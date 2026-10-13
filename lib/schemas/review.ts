import { z } from 'zod';
import { imageSchema, localizedTextSchema } from './catalog';

export const reviewSchema = z.object({
    id: z.string().min(1),
    productId: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    title: z.string().max(120).optional(),
    body: z.string().min(1).max(1200),
    authorName: z.string().min(1),
    governorate: localizedTextSchema.optional(),
    createdAt: z.string().min(10),
    verifiedPurchase: z.boolean(),
    photos: z.array(imageSchema).optional(),
    reply: z.object({ body: z.string().min(1), createdAt: z.string().min(10) }).optional()
});
export type Review = z.infer<typeof reviewSchema>;

export const reviewsResultSchema = z.object({
    summary: z.object({
        average: z.number().min(0).max(5),
        count: z.number().int().nonnegative()
    }),
    /** عدد التقييمات المتاحة في القايمة دي */
    total: z.number().int().nonnegative(),
    items: z.array(reviewSchema)
});
export type ReviewsResult = z.infer<typeof reviewsResultSchema>;
