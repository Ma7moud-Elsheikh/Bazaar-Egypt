import { z } from 'zod';
import { craftSchema, paginatedSchema, productSchema } from './catalog';

export const searchResultSchema = paginatedSchema(productSchema).extend({
    query: z.string(),
    correctedQuery: z.string().optional(),
    suggestions: z.array(z.string()),
    relatedCrafts: z.array(craftSchema),
    recommended: z.array(productSchema)
});
export type SearchResult = z.infer<typeof searchResultSchema>;

export const searchSuggestionsSchema = z.object({
    queries: z.array(z.string()),
    products: z.array(productSchema),
    crafts: z.array(craftSchema)
});
export type SearchSuggestions = z.infer<typeof searchSuggestionsSchema>;
