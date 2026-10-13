import { z } from 'zod';
import { imageSchema, localizedTextSchema } from './catalog';

export const cartGiftSchema = z.object({
    wrap: z.boolean(),
    message: z.string().max(200)
});
export type CartGift = z.infer<typeof cartGiftSchema>;

export const cartItemSchema = z.object({
    lineId: z.string().min(1),
    productId: z.string().min(1),
    slug: z.string().min(1),
    name: localizedTextSchema,
    price: z.number().positive(),
    image: imageSchema,
    quantity: z.number().int().min(1).max(20),
    maxQuantity: z.number().int().min(1).max(20),
    customization: z.record(z.string(), z.string()).optional(),
    gift: cartGiftSchema.optional(),
    // اختيارية عشان سلات اتحفظت قبل التحديث ده تفضل صالحة
    madeToOrder: z.boolean().optional(),
    leadTimeDays: z.number().int().nonnegative().optional()
});
export type CartItem = z.infer<typeof cartItemSchema>;

export const persistedCartSchema = z.object({
    version: z.literal(1),
    items: z.array(cartItemSchema)
});
