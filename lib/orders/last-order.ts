import type { CartItem } from '@/lib/schemas/cart';

const KEY = 'bazaar-egypt:last-order';

export type LastOrder = {
    orderId: string;
    createdAt: string;
    locale: 'ar' | 'en';
    items: CartItem[];
    customer: {
        fullName: string;
        phone: string;
        email?: string;
        governorateName: { ar: string; en: string };
        city: string;
        address: string;
        landmark?: string;
        notes?: string;
    };
    paymentMethod: { id: string; label: { ar: string; en: string } };
    totals: { subtotal: number; giftTotal: number; shippingFee: number; total: number };
    delivery?: { from: string; to: string };
};

// sessionStorage بيتمسح لما التاب يتقفل، فبيانات العميل ما بتفضلش على الجهاز
export function saveLastOrder(order: LastOrder) {
    try {
        window.sessionStorage.setItem(KEY, JSON.stringify(order));
    } catch {
        // مش مشكلة: صفحة التأكيد هتعرض رقم الطلب بس
    }
}

export function readLastOrder(orderId: string): LastOrder | null {
    try {
        const raw = window.sessionStorage.getItem(KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<LastOrder>;
        return parsed.orderId === orderId && Array.isArray(parsed.items)
            ? (parsed as LastOrder)
            : null;
    } catch {
        return null;
    }
}
