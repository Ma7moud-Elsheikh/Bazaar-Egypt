import type { ProductSort } from '@/lib/api/types';

export const SORT_OPTIONS: ProductSort[] = ['newest', 'popular', 'price-asc', 'price-desc'];

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type ShopFilters = {
    q?: string;
    craft?: string;
    governorate?: string;
    minPrice?: number;
    maxPrice?: number;
    sort: ProductSort;
    page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

function toPrice(value: string | undefined): number | undefined {
    if (!value || value.trim() === '') return undefined;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
}

function toSlug(value: string | undefined): string | undefined {
    return value && SLUG.test(value) ? value : undefined;
}

export function parseShopSearchParams(raw: RawParams): ShopFilters {
    const sortRaw = first(raw.sort);
    const page = Number.parseInt(first(raw.page) ?? '', 10);

    return {
        q: first(raw.q)?.trim().slice(0, 80) || undefined,
        craft: toSlug(first(raw.craft)),
        governorate: toSlug(first(raw.governorate)),
        minPrice: toPrice(first(raw.minPrice)),
        maxPrice: toPrice(first(raw.maxPrice)),
        sort: SORT_OPTIONS.find((s) => s === sortRaw) ?? 'newest',
        page: Number.isFinite(page) && page > 0 ? page : 1
    };
}

/** أي فلتر أو ترتيب غير الافتراضي */
export function isFiltered(filters: ShopFilters): boolean {
    return Boolean(
        filters.q ||
        filters.craft ||
        filters.governorate ||
        filters.minPrice !== undefined ||
        filters.maxPrice !== undefined ||
        filters.sort !== 'newest'
    );
}

export function buildShopQuery(filters: ShopFilters, overrides: Partial<ShopFilters> = {}): string {
    const next = { ...filters, ...overrides };
    const params = new URLSearchParams();

    if (next.q) params.set('q', next.q);
    if (next.craft) params.set('craft', next.craft);
    if (next.governorate) params.set('governorate', next.governorate);
    if (next.minPrice !== undefined) params.set('minPrice', String(next.minPrice));
    if (next.maxPrice !== undefined) params.set('maxPrice', String(next.maxPrice));
    if (next.sort !== 'newest') params.set('sort', next.sort);
    if (next.page > 1) params.set('page', String(next.page));

    const qs = params.toString();
    return qs ? `?${qs}` : '';
}
