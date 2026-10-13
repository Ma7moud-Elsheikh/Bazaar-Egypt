import type { Artisan, Craft, Product } from '@/lib/schemas/catalog';
import type { OrderInput, OrderResult } from '@/lib/schemas/order';
import type { SearchResult, SearchSuggestions } from '@/lib/schemas/search';

export type ProductSort = 'newest' | 'popular' | 'price-asc' | 'price-desc';
export type SearchSort = 'relevance' | ProductSort;
export type SearchLocale = 'ar' | 'en';

export type ProductQuery = {
    craft?: string;
    artisan?: string;
    governorate?: string;
    q?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: ProductSort;
    page?: number;
    pageSize?: number;
};

export type Paginated<T> = {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
};

export type SearchQuery = {
    q: string;
    craft?: string;
    governorate?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: SearchSort;
    page?: number;
    pageSize?: number;
};

export type SuggestOptions = { limit?: number; locale?: SearchLocale };

export type RecommendedOptions = {
    /** slugs الحرف المفضّلة في الاقتراح */
    craftSlugs?: string[];
    /** ids منتجات تتستبعد */
    exclude?: string[];
    limit?: number;
};

export interface CatalogApi {
    getCrafts(): Promise<Craft[]>;
    getCraft(slug: string): Promise<Craft | null>;
    getArtisans(filter?: { craft?: string }): Promise<Artisan[]>;
    getArtisan(slug: string): Promise<Artisan | null>;
    getProducts(query?: ProductQuery): Promise<Paginated<Product>>;
    getProduct(slug: string): Promise<Product | null>;
    getRelatedProducts(slug: string, limit?: number): Promise<Product[]>;
    search(query: SearchQuery): Promise<SearchResult>;
    suggest(q: string, options?: SuggestOptions): Promise<SearchSuggestions>;
    getRecommended(options?: RecommendedOptions): Promise<Product[]>;
    createOrder(input: OrderInput): Promise<OrderResult>;
}
