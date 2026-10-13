import type { SearchSort } from '@/lib/api/types';

export const SEARCH_SORT_OPTIONS: SearchSort[] = [
    'relevance',
    'newest',
    'popular',
    'price-asc',
    'price-desc'
];

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type SearchFilters = {
    q: string;
    craft?: string;
    sort: SearchSort;
    page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

export function parseSearchParams(raw: RawParams): SearchFilters {
    const sortRaw = first(raw.sort);
    const craft = first(raw.craft);
    const page = Number.parseInt(first(raw.page) ?? '', 10);

    return {
        q: (first(raw.q) ?? '').trim().slice(0, 80),
        craft: craft && SLUG.test(craft) ? craft : undefined,
        sort: SEARCH_SORT_OPTIONS.find((s) => s === sortRaw) ?? 'relevance',
        page: Number.isFinite(page) && page > 0 ? page : 1
    };
}

export function buildSearchQuery(
    filters: SearchFilters,
    overrides: Partial<SearchFilters> = {}
): string {
    const next = { ...filters, ...overrides };
    const params = new URLSearchParams();

    if (next.q) params.set('q', next.q);
    if (next.craft) params.set('craft', next.craft);
    if (next.sort !== 'relevance') params.set('sort', next.sort);
    if (next.page > 1) params.set('page', String(next.page));

    const qs = params.toString();
    return qs ? `?${qs}` : '';
}
