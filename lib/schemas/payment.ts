import { z } from 'zod';
import { localizedTextSchema } from './catalog';
import { PAYMENT_METHOD_IDS } from './order';

export const paymentMethodSchema = z.object({
    id: z.enum(PAYMENT_METHOD_IDS),
    label: localizedTextSchema,
    description: localizedTextSchema.optional(),
    enabled: z.boolean()
});
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const paymentMethodsSchema = z.array(paymentMethodSchema);
