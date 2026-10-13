import { z } from "zod";
import artisansJson from "@/data/artisans.json";
import craftsJson from "@/data/crafts.json";
import productsJson from "@/data/products.json";
import {
  buildIndex,
  rank,
  recommend,
  relatedCraftIds,
  runSearch,
  suggestQueries,
} from "@/lib/search/engine";
import {
  artisanSchema,
  craftSchema,
  productSchema,
  type Artisan,
  type Craft,
  type Product,
} from "@/lib/schemas/catalog";
import {
  orderInputSchema,
  type OrderInput,
  type OrderResult,
} from "@/lib/schemas/order";
import type { SearchResult, SearchSuggestions } from "@/lib/schemas/search";
import { normalizeSearch } from "@/lib/utils/text";
import { applyImageFallback, warnAboutMissingImages } from "./image-fallback";
import type {
  Paginated,
  ProductQuery,
  ProductSort,
  RecommendedOptions,
  SearchQuery,
  SearchSort,
  SuggestOptions,
} from "./types";

function load<T>(label: string, schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues
      .slice(0, 8)
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`[mock data] ملف ${label} مش مطابق للـ schema:\n${details}`);
  }
  return result.data;
}

function assertUnique(label: string, values: string[]) {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(`[mock data] قيمة مكررة في ${label}: ${value}`);
    }
    seen.add(value);
  }
}

const crafts = load("crafts.json", z.array(craftSchema), craftsJson);
const artisans = load("artisans.json", z.array(artisanSchema), artisansJson);
const products = load("products.json", z.array(productSchema), productsJson);

assertUnique("crafts.id", crafts.map((c) => c.id));
assertUnique("crafts.slug", crafts.map((c) => c.slug));
assertUnique("artisans.id", artisans.map((a) => a.id));
assertUnique("artisans.slug", artisans.map((a) => a.slug));
assertUnique("products.id", products.map((p) => p.id));
assertUnique("products.slug", products.map((p) => p.slug));

const craftById = new Map(crafts.map((c) => [c.id, c]));
const artisanById = new Map(artisans.map((a) => [a.id, a]));

for (const a of artisans) {
  if (!craftById.has(a.craftId)) {
    throw new Error(`[mock data] الحرفي ${a.slug} مربوط بحرفة مش موجودة: ${a.craftId}`);
  }
}
for (const p of products) {
  if (!craftById.has(p.craftId)) {
    throw new Error(`[mock data] المنتج ${p.slug} مربوط بحرفة مش موجودة: ${p.craftId}`);
  }
  if (!artisanById.has(p.artisanId)) {
    throw new Error(`[mock data] المنتج ${p.slug} مربوط بحرفي مش موجود: ${p.artisanId}`);
  }
}

warnAboutMissingImages(crafts, artisans, products);

const searchIndex = new Map(
  products.map((p) => {
    const craft = craftById.get(p.craftId);
    const text = [
      p.name.ar,
      p.name.en,
      p.summary.ar,
      p.summary.en,
      craft?.name.ar ?? "",
      craft?.name.en ?? "",
    ].join(" ");
    return [p.id, normalizeSearch(text)] as const;
  }),
);

const engine = buildIndex(products, crafts);

const sorters: Record<ProductSort, (a: Product, b: Product) => number> = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  popular: (a, b) => b.reviewCount - a.reviewCount || b.rating - a.rating,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export async function getCrafts(): Promise<Craft[]> {
  return applyImageFallback(crafts);
}

export async function getCraft(slug: string): Promise<Craft | null> {
  return applyImageFallback(crafts.find((c) => c.slug === slug) ?? null);
}

export async function getArtisans(filter?: { craft?: string }): Promise<Artisan[]> {
  if (!filter?.craft) return applyImageFallback(artisans);
  const craft = crafts.find((c) => c.slug === filter.craft);
  return applyImageFallback(
    craft ? artisans.filter((a) => a.craftId === craft.id) : [],
  );
}

export async function getArtisan(slug: string): Promise<Artisan | null> {
  return applyImageFallback(artisans.find((a) => a.slug === slug) ?? null);
}

export async function getProducts(
  query: ProductQuery = {},
): Promise<Paginated<Product>> {
  const { craft, artisan, governorate, q, minPrice, maxPrice, sort = "newest" } = query;
  const pageSize = clamp(query.pageSize ?? 12, 1, 48);
  const page = Math.max(1, query.page ?? 1);
  const needle = q ? normalizeSearch(q) : "";

  const filtered = products.filter((p) => {
    if (craft && craftById.get(p.craftId)?.slug !== craft) return false;
    if (artisan && artisanById.get(p.artisanId)?.slug !== artisan) return false;
    if (governorate && p.governorate.slug !== governorate) return false;
    if (minPrice !== undefined && p.price < minPrice) return false;
    if (maxPrice !== undefined && p.price > maxPrice) return false;
    if (needle && !(searchIndex.get(p.id) ?? "").includes(needle)) return false;
    return true;
  });

  const sorted = [...filtered].sort(sorters[sort]);
  const total = sorted.length;

  return applyImageFallback({
    items: sorted.slice((page - 1) * pageSize, page * pageSize),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function getProduct(slug: string): Promise<Product | null> {
  return applyImageFallback(products.find((p) => p.slug === slug) ?? null);
}

export async function getRelatedProducts(slug: string, limit = 4): Promise<Product[]> {
  const current = products.find((p) => p.slug === slug);
  if (!current) return [];

  const sameCraft = products.filter(
    (p) => p.id !== current.id && p.craftId === current.craftId,
  );
  const others = products
    .filter((p) => p.id !== current.id && p.craftId !== current.craftId)
    .sort(sorters.popular);

  return applyImageFallback([...sameCraft, ...others].slice(0, limit));
}

export async function search(query: SearchQuery): Promise<SearchResult> {
  const q = query.q.trim().slice(0, 80);
  const sort: SearchSort = query.sort ?? "relevance";
  const pageSize = clamp(query.pageSize ?? 12, 1, 48);
  const page = Math.max(1, query.page ?? 1);

  const run = runSearch(engine, q);
  const craftId = query.craft
    ? crafts.find((c) => c.slug === query.craft)?.id
    : undefined;

  const filtered = run.matches.filter(({ product: p }) => {
    if (query.craft && p.craftId !== craftId) return false;
    if (query.governorate && p.governorate.slug !== query.governorate) return false;
    if (query.minPrice !== undefined && p.price < query.minPrice) return false;
    if (query.maxPrice !== undefined && p.price > query.maxPrice) return false;
    return true;
  });

  const sorted =
    sort === "relevance"
      ? filtered
      : [...filtered].sort((a, b) => sorters[sort](a.product, b.product));

  const total = sorted.length;

  let relatedCrafts: Craft[];
  if (run.matches.length > 0) {
    const matchedCraftIds = new Set(run.matches.map((m) => m.product.craftId));
    relatedCrafts = crafts.filter((c) => matchedCraftIds.has(c.id));
  } else {
    const ordered = relatedCraftIds(engine, q, { fuzzy: true });
    relatedCrafts = [
      ...ordered
        .map((id) => craftById.get(id))
        .filter((c): c is Craft => c !== undefined),
      ...crafts.filter((c) => !ordered.includes(c.id)),
    ];
  }

  const recommended = recommend(products, {
    craftIds: [...new Set(run.matches.slice(0, 5).map((m) => m.product.craftId))],
    exclude: new Set(run.matches.map((m) => m.product.id)),
    limit: 8,
  });

  return applyImageFallback({
    items: sorted.slice((page - 1) * pageSize, page * pageSize).map((m) => m.product),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    query: q,
    correctedQuery: run.correctedQuery,
    suggestions: run.suggestions,
    relatedCrafts,
    recommended,
  });
}

export async function suggest(
  q: string,
  options: SuggestOptions = {},
): Promise<SearchSuggestions> {
  const { limit = 8, locale = "ar" } = options;
  const query = q.trim().slice(0, 80);

  if (query.length < 2) return { queries: [], products: [], crafts: [] };

  const strict = rank(engine, query, false, 2);
  const matches = strict.length > 0 ? strict : rank(engine, query, true, 2);

  const craftIds = relatedCraftIds(engine, query, { fuzzy: false, minPrefix: 2 });

  return applyImageFallback({
    queries: suggestQueries(engine, query, locale, clamp(limit, 1, 8) > 4 ? 4 : 3),
    products: matches.slice(0, 4).map((m) => m.product),
    crafts: craftIds
      .slice(0, 2)
      .map((id) => craftById.get(id))
      .filter((c): c is Craft => c !== undefined),
  });
}

export async function getRecommended(
  options: RecommendedOptions = {},
): Promise<Product[]> {
  const { craftSlugs = [], exclude = [], limit = 8 } = options;
  const craftIds = craftSlugs
    .map((slug) => crafts.find((c) => c.slug === slug)?.id)
    .filter((id): id is string => id !== undefined);

  return applyImageFallback(
    recommend(products, {
      craftIds,
      exclude: new Set(exclude),
      limit: clamp(limit, 1, 24),
    }),
  );
}

export async function createOrder(input: OrderInput): Promise<OrderResult> {
  const order = orderInputSchema.parse(input);
  let total = 0;

  for (const item of order.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      throw new Error(`المنتج ${item.productId} مش موجود`);
    }
    if (!product.madeToOrder && product.stock < item.quantity) {
      throw new Error(`المخزون غير كافٍ: ${product.slug}`);
    }
    total += product.price * item.quantity;
  }

  return {
    orderId: `BZ-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    status: "pending",
    total,
    currency: "EGP",
  };
}
