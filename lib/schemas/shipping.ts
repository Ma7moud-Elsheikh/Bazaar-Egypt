import { z } from 'zod';
import { localizedTextSchema } from './catalog';

export const shippingZoneSchema = z.object({
    id: z.string().min(1),
    fee: z.number().nonnegative(),
    etaDays: z.object({
        min: z.number().int().nonnegative(),
        max: z.number().int().nonnegative()
    })
});

export const shippingGovernorateSchema = z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: localizedTextSchema,
    zoneId: z.string().min(1)
});

export const shippingConfigSchema = z.object({
    freeShippingThreshold: z.number().nonnegative(),
    returnDays: z.number().int().nonnegative(),
    giftWrapPrice: z.number().nonnegative(),
    zones: z.array(shippingZoneSchema).min(1),
    governorates: z.array(shippingGovernorateSchema).min(1)
});
export type ShippingConfig = z.infer<typeof shippingConfigSchema>;
