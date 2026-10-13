import type { SearchLocale } from '@/lib/api/types';
import type { Craft, Product } from '@/lib/schemas/catalog';
import { normalizeSearch } from '@/lib/utils/text';

const LOCALES: SearchLocale[] = ['ar', 'en'];
const TOKEN_SPLIT = /[^\p{L}\p{N}]+/u;
const WORD_SPLIT = /[^\p{L}\p{M}\p{N}]+/u;

function stripArticle(token: string): string {
    return token.length > 3 && token.startsWith('ال') ? token.slice(2) : token;
}

export function tokenize(text: string): string[] {
    return normalizeSearch(text)
        .split(TOKEN_SPLIT)
        .filter((token) => token.length >= 2)
        .map(stripArticle);
}

/* ───────────── ترادفات (كل مجموعة بتعني نفس الحاجة تقريبًا) ───────────── */
const SYNONYM_GROUPS: string[][] = [
    [
        'فخار',
        'فخاري',
        'قلة',
        'زير',
        'إبريق',
        'أواني',
        'طين',
        'قناوي',
        'مزهرية',
        'pottery',
        'clay',
        'jar',
        'jug',
        'ceramic',
        'vase'
    ],
    ['نحاس', 'نحاسيات', 'نحاسي', 'صينية', 'طبق', 'copper', 'brass', 'tray', 'copperware'],
    [
        'نسيج',
        'منسوج',
        'شال',
        'ملاية',
        'كليم',
        'سجاد',
        'weaving',
        'woven',
        'textile',
        'shawl',
        'kilim',
        'rug'
    ],
    ['تطريز', 'مطرز', 'مطرزة', 'وسادة', 'embroidery', 'embroidered', 'cushion', 'pillow'],
    ['خشب', 'خشبي', 'خشبية', 'صندوق', 'صدف', 'wood', 'wooden', 'woodwork', 'box', 'inlay'],
    ['زجاج', 'فسيفساء', 'فانوس', 'معشق', 'glass', 'mosaic', 'lantern'],
    ['هدية', 'هدايا', 'gift', 'gifts', 'present']
];

const SYNONYMS = new Map<string, string[]>();
for (const group of SYNONYM_GROUPS) {
    const tokens = [...new Set(group.flatMap((word) => tokenize(word)))];
    for (const token of tokens) {
        SYNONYMS.set(token, [
            ...(SYNONYMS.get(token) ?? []),
            ...tokens.filter((other) => other !== token)
        ]);
    }
}

/* ───────────── مطابقة الكلمات ───────────── */
function allowedEdits(length: number): number {
    if (length >= 8) return 2;
    if (length >= 4) return 1;
    return 0;
}

function editDistance(a: string, b: string, max: number): number {
    if (Math.abs(a.length - b.length) > max) return max + 1;

    const rows = a.length + 1;
    const cols = b.length + 1;
    const d: number[][] = Array.from({ length: rows }, (_, i) => {
        const row = new Array<number>(cols).fill(0);
        row[0] = i;
        return row;
    });
    for (let j = 0; j < cols; j++) d[0][j] = j;

    for (let i = 1; i < rows; i++) {
        for (let j = 1; j < cols; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
            }
        }
    }
    return d[a.length][b.length];
}

/** 1 = تطابق تام | 0.8 = بداية كلمة | 0.55 = خطأ إملائي بسيط | 0 = مفيش */
function matchToken(query: string, indexed: string, fuzzy: boolean, minPrefix: number): number {
    if (query === indexed) return 1;
    if (indexed.startsWith(query) && query.length >= minPrefix) return 0.8;
    if (query.startsWith(indexed) && indexed.length >= 3) return 0.8;

    if (fuzzy) {
        const max = allowedEdits(query.length);
        if (max > 0 && editDistance(query, indexed, max) <= max) return 0.55;
    }
    return 0;
}

/* ───────────── الفهرس ───────────── */
type Field = { weight: number; tokens: string[] };
type Doc = { product: Product; fields: Field[]; nameNorm: string };

export type SearchIndex = {
    docs: Doc[];
    craftDocs: { id: string; tokens: string[] }[];
    vocabulary: Map<string, { display: string; count: number }>;
    candidates: Record<SearchLocale, string[]>;
};

export function buildIndex(products: Product[], crafts: Craft[]): SearchIndex {
    const craftById = new Map(crafts.map((c) => [c.id, c]));
    const vocabulary = new Map<string, { display: string; count: number }>();

    const addVocabulary = (text: string) => {
        for (const raw of text.split(WORD_SPLIT).filter(Boolean)) {
            const token = stripArticle(normalizeSearch(raw));
            if (token.length < 3) continue;
            const entry = vocabulary.get(token);
            if (entry) entry.count += 1;
            else vocabulary.set(token, { display: raw, count: 1 });
        }
    };

    const candidates: Record<SearchLocale, Set<string>> = {
        ar: new Set(),
        en: new Set()
    };
    for (const craft of crafts) {
        addVocabulary(`${craft.name.ar} ${craft.name.en}`);
        for (const locale of LOCALES) candidates[locale].add(craft.name[locale]);
    }

    const docs: Doc[] = products.map((p) => {
        const craft = craftById.get(p.craftId);
        const materials = p.materials.map((m) => `${m.ar} ${m.en}`).join(' ');

        addVocabulary(`${p.name.ar} ${p.name.en} ${materials}`);
        for (const locale of LOCALES) {
            p.materials.forEach((m) => candidates[locale].add(m[locale]));
            candidates[locale].add(p.name[locale].split(/\s+/).slice(0, 2).join(' '));
        }

        return {
            product: p,
            nameNorm: normalizeSearch(`${p.name.ar} ${p.name.en}`),
            fields: [
                { weight: 10, tokens: tokenize(`${p.name.ar} ${p.name.en}`) },
                {
                    weight: 6,
                    tokens: tokenize(craft ? `${craft.name.ar} ${craft.name.en}` : '')
                },
                { weight: 4, tokens: tokenize(materials) },
                {
                    weight: 3,
                    tokens: tokenize(`${p.governorate.name.ar} ${p.governorate.name.en}`)
                },
                { weight: 3, tokens: tokenize(`${p.summary.ar} ${p.summary.en}`) },
                { weight: 1, tokens: tokenize(`${p.description.ar} ${p.description.en}`) },
                { weight: 2, tokens: tokenize(p.slug.replace(/-/g, ' ')) }
            ]
        };
    });

    return {
        docs,
        craftDocs: crafts.map((c) => ({
            id: c.id,
            tokens: tokenize(`${c.name.ar} ${c.name.en}`)
        })),
        vocabulary,
        candidates: { ar: [...candidates.ar], en: [...candidates.en] }
    };
}

/* ───────────── تحليل الاستعلام والترتيب ───────────── */
type Analyzed = { tokens: string[]; variants: { token: string; weight: number }[][] };

function analyze(q: string): Analyzed {
    const tokens = tokenize(q);
    return {
        tokens,
        variants: tokens.map((token) => [
            { token, weight: 1 },
            ...(SYNONYMS.get(token) ?? []).map((synonym) => ({
                token: synonym,
                weight: 0.6
            }))
        ])
    };
}

function scoreDoc(
    doc: Doc,
    analyzed: Analyzed,
    fuzzy: boolean,
    minPrefix: number,
    phrase: string
): number {
    let total = 0;

    for (const variants of analyzed.variants) {
        let best = 0;
        for (const field of doc.fields) {
            for (const variant of variants) {
                let match = 0;
                for (const indexed of field.tokens) {
                    match = Math.max(match, matchToken(variant.token, indexed, fuzzy, minPrefix));
                    if (match === 1) break;
                }
                best = Math.max(best, field.weight * match * variant.weight);
            }
        }
        if (best === 0) return 0; // كل كلمة في البحث لازم يكون لها مطابقة
        total += best;
    }

    if (phrase && doc.nameNorm.includes(phrase)) total += 5;
    return total;
}

export type Ranked = { product: Product; score: number };

export function rank(index: SearchIndex, q: string, fuzzy: boolean, minPrefix = 3): Ranked[] {
    const analyzed = analyze(q);
    if (analyzed.tokens.length === 0) return [];
    const phrase = normalizeSearch(q);

    return index.docs
        .map((doc) => ({
            product: doc.product,
            score: scoreDoc(doc, analyzed, fuzzy, minPrefix, phrase)
        }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score || b.product.reviewCount - a.product.reviewCount);
}

function scoreCraft(
    tokens: string[],
    analyzed: Analyzed,
    fuzzy: boolean,
    minPrefix: number
): number {
    let total = 0;
    for (const variants of analyzed.variants) {
        let best = 0;
        for (const variant of variants) {
            for (const indexed of tokens) {
                best = Math.max(
                    best,
                    matchToken(variant.token, indexed, fuzzy, minPrefix) * variant.weight
                );
            }
        }
        total += best;
    }
    return total;
}

/** الحرف المرتبطة بالاستعلام (مرتبة بالأقرب أولًا) */
export function relatedCraftIds(
    index: SearchIndex,
    q: string,
    options: { fuzzy: boolean; minPrefix?: number }
): string[] {
    const analyzed = analyze(q);
    if (analyzed.tokens.length === 0) return [];

    return index.craftDocs
        .map((craft) => ({
            id: craft.id,
            score: scoreCraft(craft.tokens, analyzed, options.fuzzy, options.minPrefix ?? 3)
        }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.id);
}

/* ───────────── تصحيح وبدائل ───────────── */
export function findCorrection(index: SearchIndex, q: string): string | undefined {
    const words = q.trim().split(/\s+/).filter(Boolean);
    let changed = false;

    const corrected = words.map((word) => {
        const token = stripArticle(normalizeSearch(word));
        if (token.length < 3 || SYNONYMS.has(token)) return word;

        for (const vocabToken of index.vocabulary.keys()) {
            if (matchToken(token, vocabToken, false, 3) > 0) return word;
        }

        const max = allowedEdits(token.length) + (token.length >= 6 ? 1 : 0);
        let best: { display: string; dist: number; count: number } | undefined;

        for (const [vocabToken, entry] of index.vocabulary) {
            const dist = editDistance(token, vocabToken, max);
            if (
                dist <= max &&
                (!best || dist < best.dist || (dist === best.dist && entry.count > best.count))
            ) {
                best = { display: entry.display, dist, count: entry.count };
            }
        }

        if (best) {
            changed = true;
            return best.display;
        }
        return word;
    });

    return changed ? corrected.join(' ') : undefined;
}

/** نفس الاستعلام بعد حذف كلمة واحدة، بشرط إنه يرجّع نتايج */
function relaxedQueries(index: SearchIndex, q: string, limit: number): string[] {
    const words = q.trim().split(/\s+/).filter(Boolean);
    if (words.length < 2) return [];

    return words
        .map((_, i) => words.filter((__, j) => j !== i).join(' '))
        .map((candidate) => ({ candidate, count: rank(index, candidate, false).length }))
        .filter((entry) => entry.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
        .map((entry) => entry.candidate);
}

/** كلمات قريبة من المفردات (للكلمة المفردة اللي ملهاش نتيجة) */
function nearbyTerms(index: SearchIndex, q: string, limit: number): string[] {
    const token = tokenize(q)[0];
    if (!token || token.length < 3) return [];

    const threshold = Math.min(3, Math.max(1, Math.ceil(token.length * 0.4)));

    return [...index.vocabulary]
        .map(([vocabToken, entry]) => ({
            display: entry.display,
            dist: editDistance(token, vocabToken, 3),
            count: entry.count
        }))
        .filter((entry) => entry.dist <= threshold)
        .sort((a, b) => a.dist - b.dist || b.count - a.count)
        .slice(0, limit)
        .map((entry) => entry.display);
}

export type SearchRun = {
    matches: Ranked[];
    correctedQuery?: string;
    suggestions: string[];
};

export function runSearch(index: SearchIndex, q: string): SearchRun {
    const strict = rank(index, q, false);
    if (strict.length > 0) return { matches: strict, suggestions: [] };

    const fuzzy = rank(index, q, true);
    if (fuzzy.length > 0) {
        return {
            matches: fuzzy,
            correctedQuery: findCorrection(index, q),
            suggestions: []
        };
    }

    const suggestions = [
        ...new Set([...relaxedQueries(index, q, 3), ...nearbyTerms(index, q, 3)])
    ].slice(0, 4);

    return { matches: [], suggestions };
}

/** اقتراحات نصية للـ autosuggest (حرف وخامات وبدايات أسماء المنتجات) */
export function suggestQueries(
    index: SearchIndex,
    q: string,
    locale: SearchLocale,
    limit: number
): string[] {
    const queryTokens = tokenize(q);
    if (queryTokens.length === 0) return [];
    const phrase = normalizeSearch(q);

    return index.candidates[locale]
        .map((text) => {
            const norm = normalizeSearch(text);
            const tokens = tokenize(text);
            const matches = queryTokens.every((queryToken) =>
                tokens.some((token) => matchToken(queryToken, token, false, 2) > 0)
            );
            return { text, norm, matches };
        })
        .filter((entry) => entry.matches && entry.norm !== phrase)
        .sort((a, b) => {
            const aStarts = a.norm.startsWith(phrase) ? 0 : 1;
            const bStarts = b.norm.startsWith(phrase) ? 0 : 1;
            return aStarts - bStarts || a.norm.length - b.norm.length;
        })
        .slice(0, limit)
        .map((entry) => entry.text);
}

/* ───────────── منتجات مقترحة ───────────── */
export function recommend(
    products: Product[],
    options: { craftIds?: string[]; exclude?: Set<string>; limit: number }
): Product[] {
    const { craftIds = [], exclude = new Set<string>(), limit } = options;
    const popular = (a: Product, b: Product) =>
        b.reviewCount - a.reviewCount || b.rating - a.rating;

    const pool = products.filter((p) => !exclude.has(p.id));
    const sameCraft = pool.filter((p) => craftIds.includes(p.craftId)).sort(popular);
    const others = pool.filter((p) => !craftIds.includes(p.craftId)).sort(popular);

    const split = Math.ceil(limit * 0.6);
    return [...sameCraft.slice(0, split), ...others, ...sameCraft.slice(split)].slice(0, limit);
}
