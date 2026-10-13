import type { Artisan, Craft, Product } from '@/lib/schemas/catalog';
import { artisanSchema, craftSchema, paginatedSchema, productSchema } from '@/lib/schemas/catalog';
import { orderResultSchema, type OrderInput, type OrderResult } from '@/lib/schemas/order';
import {
    searchResultSchema,
    searchSuggestionsSchema,
    type SearchResult,
    type SearchSuggestions
} from '@/lib/schemas/search';
import { z } from 'zod';
import type {
    Paginated,
    ProductQuery,
    RecommendedOptions,
    SearchQuery,
    SuggestOptions
} from './types';

export class ApiError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

type Options = { method?: 'GET' | 'POST'; body?: unknown; revalidate?: number };

function baseUrl(): string {
    const url = process.env.API_URL;
    if (!url) {
        throw new Error('API_URL مش متحدد في .env.local (مطلوب لما USE_MOCK_API=false)');
    }
    return url.replace(/\/$/, '');
}

async function request<T>(
    path: string,
    schema: z.ZodType<T>,
    { method = 'GET', body, revalidate = 60 }: Options = {}
): Promise<T | null> {
    const res = await fetch(`${baseUrl()}${path}`, {
        method,
        headers: {
            Accept: 'application/json',
            ...(body ? { 'Content-Type': 'application/json' } : {})
        },
        body: body ? JSON.stringify(body) : undefined,
        ...(method === 'GET' ? { next: { revalidate } } : { cache: 'no-store' as const })
    });

    if (res.status === 404) return null;
    if (!res.ok) {
        throw new ApiError(res.status, `API ${method} ${path} فشل (${res.status})`);
    }

    const parsed = schema.safeParse(await res.json());
    if (!parsed.success) {
        const first = parsed.error.issues[0];
        throw new ApiError(
            502,
            `API ${path} رجّع شكل مخالف للـ contract عند "${first?.path.join('.')}": ${first?.message}`
        );
    }
    return parsed.data;
}

async function requestOrThrow<T>(
    path: string,
    schema: z.ZodType<T>,
    options?: Options
): Promise<T> {
    const data = await request(path, schema, options);
    if (data === null) throw new ApiError(404, `API ${path} مش موجود`);
    return data;
}

function toQueryString(query: Record<string, unknown>): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === '') continue;
        params.set(key, String(value));
    }
    const qs = params.toString();
    return qs ? `?${qs}` : '';
}

export function getCrafts(): Promise<Craft[]> {
    return requestOrThrow('/crafts', z.array(craftSchema));
}

export function getCraft(slug: string): Promise<Craft | null> {
    return request(`/crafts/${encodeURIComponent(slug)}`, craftSchema);
}

export function getArtisans(filter?: { craft?: string }): Promise<Artisan[]> {
    return requestOrThrow(
        `/artisans${toQueryString({ craft: filter?.craft })}`,
        z.array(artisanSchema)
    );
}

export function getArtisan(slug: string): Promise<Artisan | null> {
    return request(`/artisans/${encodeURIComponent(slug)}`, artisanSchema);
}

export function getProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
    return requestOrThrow(`/products${toQueryString(query)}`, paginatedSchema(productSchema));
}

export function getProduct(slug: string): Promise<Product | null> {
    return request(`/products/${encodeURIComponent(slug)}`, productSchema);
}

export function getRelatedProducts(slug: string, limit = 4): Promise<Product[]> {
    return requestOrThrow(
        `/products/${encodeURIComponent(slug)}/related${toQueryString({ limit })}`,
        z.array(productSchema)
    );
}

export function search(query: SearchQuery): Promise<SearchResult> {
    return requestOrThrow(`/search${toQueryString(query)}`, searchResultSchema, { revalidate: 30 });
}

export function suggest(q: string, options: SuggestOptions = {}): Promise<SearchSuggestions> {
    return requestOrThrow(
        `/search/suggest${toQueryString({ q, limit: options.limit, locale: options.locale })}`,
        searchSuggestionsSchema,
        { revalidate: 30 }
    );
}

export function getRecommended(options: RecommendedOptions = {}): Promise<Product[]> {
    return requestOrThrow(
        `/products/recommended${toQueryString({
            craft: options.craftSlugs?.join(','),
            exclude: options.exclude?.join(','),
            limit: options.limit
        })}`,
        z.array(productSchema)
    );
}

export function createOrder(input: OrderInput): Promise<OrderResult> {
    return requestOrThrow('/orders', orderResultSchema, { method: 'POST', body: input });
}
