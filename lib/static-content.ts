type Values = Record<string, string | number>;

export type ContentSection = { heading: string; paragraphs: string[]; list: string[] };
export type Card = { title: string; text: string };
export type FaqGroup = { title: string; items: { q: string; a: string }[] };

/** بيعوّض {name} في النصوص اللي جاية من t.raw (اللي ما بتعدّيش على ICU) */
export function fill(text: string, values: Values = {}): string {
    return text.replace(/\{(\w+)\}/g, (match, key: string) =>
        key in values ? String(values[key]) : match
    );
}

const isString = (value: unknown): value is string => typeof value === 'string';
const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

export function toStrings(raw: unknown, values: Values = {}): string[] {
    return Array.isArray(raw) ? raw.filter(isString).map((s) => fill(s, values)) : [];
}

export function toSections(raw: unknown, values: Values = {}): ContentSection[] {
    if (!Array.isArray(raw)) return [];

    return raw.flatMap((item) => {
        if (!isRecord(item) || !isString(item.heading)) return [];
        return [
            {
                heading: fill(item.heading, values),
                paragraphs: toStrings(item.paragraphs, values),
                list: toStrings(item.list, values)
            }
        ];
    });
}

export function toCards(raw: unknown, values: Values = {}): Card[] {
    if (!Array.isArray(raw)) return [];

    return raw.flatMap((item) => {
        if (!isRecord(item) || !isString(item.title) || !isString(item.text)) return [];
        return [{ title: fill(item.title, values), text: fill(item.text, values) }];
    });
}

export function toFaqGroups(raw: unknown, values: Values = {}): FaqGroup[] {
    if (!Array.isArray(raw)) return [];

    return raw.flatMap((group) => {
        if (!isRecord(group) || !isString(group.title) || !Array.isArray(group.items)) return [];

        const items = group.items.flatMap((entry) => {
            if (!isRecord(entry) || !isString(entry.q) || !isString(entry.a)) return [];
            return [{ q: fill(entry.q, values), a: fill(entry.a, values) }];
        });

        return items.length > 0 ? [{ title: fill(group.title, values), items }] : [];
    });
}
