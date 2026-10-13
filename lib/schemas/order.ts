import { z } from 'zod';

export const PAYMENT_METHOD_IDS = ['cod', 'card', 'fawry', 'wallet', 'instapay'] as const;

export const checkoutFormSchema = z.object({
    fullName: z.string().trim().min(3).max(80),
    // رقم مصري بصيغة موحّدة 01XXXXXXXXX (التحويل بيتم قبل الـ schema)
    phone: z
        .string()
        .trim()
        .regex(/^01[0125]\d{8}$/, 'رقم موبايل مصري غير صحيح'),
    email: z.union([z.string().email(), z.literal('')]).optional(),
    governorate: z.string().min(1),
    city: z.string().trim().min(2).max(80),
    address: z.string().trim().min(8).max(200),
    landmark: z.string().trim().max(120).optional(),
    notes: z.string().trim().max(500).optional(),
    paymentMethod: z.enum(PAYMENT_METHOD_IDS)
});
export type CheckoutForm = z.infer<typeof checkoutFormSchema>;

export const orderItemInputSchema = z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1).max(20),
    customization: z.record(z.string(), z.string()).optional(),
    gift: z.object({ wrap: z.boolean(), message: z.string().max(200) }).optional()
});
export type OrderItemInput = z.infer<typeof orderItemInputSchema>;

export const orderInputSchema = z.object({
    items: z.array(orderItemInputSchema).min(1).max(50),
    customer: checkoutFormSchema,
    locale: z.enum(['ar', 'en'])
});
export type OrderInput = z.infer<typeof orderInputSchema>;

export const orderResultSchema = z.object({
    orderId: z.string().min(1),
    status: z.enum(['pending', 'confirmed']),
    total: z.number().nonnegative(),
    currency: z.literal('EGP'),
    subtotal: z.number().nonnegative().optional(),
    shippingFee: z.number().nonnegative().optional(),
    giftTotal: z.number().nonnegative().optional(),
    /** للدفع الأونلاين: الواجهة بتحوّل الزائر للرابط ده بعد تسجيل الطلب */
    redirectUrl: z.string().url().optional()
});
export type OrderResult = z.infer<typeof orderResultSchema>;
