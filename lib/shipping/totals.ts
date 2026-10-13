import type { CartItem } from '@/lib/schemas/cart';
import type { ShippingConfig } from '@/lib/schemas/shipping';
import { DEFAULT_GIFT_WRAP_PRICE, FREE_SHIPPING_THRESHOLD } from '@/lib/store-config';
import { shippingFee, type ShippingZone } from './estimate';

export type CartTotals = {
    subtotal: number;
    giftTotal: number;
    /** null = المحافظة لسه ما اتحددتش أو أسعار الشحن لسه بتتحمّل */
    shippingFee: number | null;
    total: number;
    freeShippingThreshold: number;
    freeShippingRemaining: number;
    zone: ShippingZone | null;
};

function findZone(config: ShippingConfig, governorate: string): ShippingZone | null {
    const match = config.governorates.find((g) => g.slug === governorate);
    return match ? (config.zones.find((z) => z.id === match.zoneId) ?? null) : null;
}

export function computeTotals(
    items: Pick<CartItem, 'price' | 'quantity' | 'gift'>[],
    config: ShippingConfig | null,
    governorate: string | null
): CartTotals {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const giftPrice = config?.giftWrapPrice ?? DEFAULT_GIFT_WRAP_PRICE;
    const giftTotal = items.reduce(
        (sum, item) => sum + (item.gift?.wrap ? giftPrice * item.quantity : 0),
        0
    );

    const zone = config && governorate ? findZone(config, governorate) : null;
    const fee = config && zone ? shippingFee(config, zone, subtotal) : null;
    const threshold = config?.freeShippingThreshold ?? FREE_SHIPPING_THRESHOLD;

    return {
        subtotal,
        giftTotal,
        shippingFee: fee,
        total: subtotal + giftTotal + (fee ?? 0),
        freeShippingThreshold: threshold,
        freeShippingRemaining: Math.max(threshold - subtotal, 0),
        zone
    };
}
