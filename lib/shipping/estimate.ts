import type { ShippingConfig } from '@/lib/schemas/shipping';

export type ShippingZone = ShippingConfig['zones'][number];
export type DeliveryEstimate = { zone: ShippingZone; from: Date; to: Date };

export function addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}

export function estimateDelivery(
    config: ShippingConfig,
    governorateSlug: string,
    product: { madeToOrder: boolean; leadTimeDays: number },
    today: Date
): DeliveryEstimate | null {
    const governorate = config.governorates.find((g) => g.slug === governorateSlug);
    const zone = governorate ? config.zones.find((z) => z.id === governorate.zoneId) : undefined;
    if (!zone) return null;

    // المنتج الجاهز بيحتاج يوم تجهيز. المصنوع حسب الطلب بيحتاج مدة التجهيز بتاعته
    const prep = product.madeToOrder ? Math.max(product.leadTimeDays, 1) : 1;

    return {
        zone,
        from: addDays(today, prep + zone.etaDays.min),
        to: addDays(today, prep + zone.etaDays.max)
    };
}

export function shippingFee(config: ShippingConfig, zone: ShippingZone, subtotal: number): number {
    return subtotal >= config.freeShippingThreshold ? 0 : zone.fee;
}
