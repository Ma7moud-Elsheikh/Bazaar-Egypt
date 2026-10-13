import reviewsJson from '@/data/reviews.json';
import shippingJson from '@/data/shipping.json';
import { orderInputSchema, type OrderInput, type OrderResult } from '@/lib/schemas/order';
import { paymentMethodsSchema, type PaymentMethod } from '@/lib/schemas/payment';
import { reviewSchema, reviewsResultSchema, type ReviewsResult } from '@/lib/schemas/review';
import { shippingConfigSchema, type ShippingConfig } from '@/lib/schemas/shipping';
import { shippingFee } from '@/lib/shipping/estimate';
import { z } from 'zod';
import { ApiError, createOrder as httpCreateOrder } from './http';
import { applyImageFallback } from './image-fallback';
import { getProduct, getProducts } from './mock';

const useMock = process.env.USE_MOCK_API !== 'false';

function parseOrThrow<T>(label: string, schema: z.ZodType<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
        const details = result.error.issues
            .slice(0, 8)
            .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
            .join('\n');
        throw new Error(`[mock data] ملف ${label} مش مطابق للـ schema:\n${details}`);
    }
    return result.data;
}

const reviews = parseOrThrow('reviews.json', z.array(reviewSchema), reviewsJson);
const shippingConfig = parseOrThrow('shipping.json', shippingConfigSchema, shippingJson);

const zoneIds = new Set(shippingConfig.zones.map((zone) => zone.id));
for (const governorate of shippingConfig.governorates) {
    if (!zoneIds.has(governorate.zoneId)) {
        throw new Error(
            `[mock data] المحافظة ${governorate.slug} مربوطة بمنطقة شحن مش موجودة: ${governorate.zoneId}`
        );
    }
}

const mockPaymentMethods: PaymentMethod[] = [
    {
        id: 'cod',
        label: { ar: 'الدفع عند الاستلام', en: 'Cash on delivery' },
        description: {
            ar: 'ادفع نقدًا للمندوب لما طلبك يوصلك.',
            en: 'Pay the courier in cash when your order arrives.'
        },
        enabled: true
    }
];

async function httpGet<T>(path: string, schema: z.ZodType<T>, revalidate = 60): Promise<T | null> {
    const base = process.env.API_URL;
    if (!base) {
        throw new Error('API_URL مش متحدد في .env.local (مطلوب لما USE_MOCK_API=false)');
    }

    const res = await fetch(`${base.replace(/\/$/, '')}${path}`, {
        headers: { Accept: 'application/json' },
        next: { revalidate }
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`API ${path} فشل (${res.status})`);

    const parsed = schema.safeParse(await res.json());
    if (!parsed.success) {
        const first = parsed.error.issues[0];
        throw new Error(
            `API ${path} رجّع شكل مخالف للـ contract عند "${first?.path.join('.')}": ${first?.message}`
        );
    }
    return parsed.data;
}

export async function getProductReviews(slug: string, limit = 5): Promise<ReviewsResult | null> {
    if (!useMock) {
        return httpGet(
            `/products/${encodeURIComponent(slug)}/reviews?limit=${limit}`,
            reviewsResultSchema
        );
    }

    const product = await getProduct(slug);
    if (!product) return null;

    const items = reviews
        .filter((review) => review.productId === product.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return applyImageFallback({
        // الرقم المعروض هو رقم المنتج. القايمة عينة من التقييمات
        summary: { average: product.rating, count: product.reviewCount },
        total: items.length,
        items: items.slice(0, limit)
    });
}

export async function getShippingConfig(): Promise<ShippingConfig> {
    if (useMock) return shippingConfig;

    const data = await httpGet('/shipping/config', shippingConfigSchema, 300);
    if (!data) throw new Error('API /shipping/config مش موجود');
    return data;
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
    if (useMock) return mockPaymentMethods;
    return (await httpGet('/payment-methods', paymentMethodsSchema, 300)) ?? [];
}

/* ───────────── تسجيل الطلب ───────────── */

export type OrderErrorCode = 'invalid' | 'out_of_stock' | 'unavailable';

export class OrderError extends Error {
    readonly code: OrderErrorCode;
    readonly detail?: string;

    constructor(code: OrderErrorCode, detail?: string) {
        super(`Order failed: ${code}${detail ? ` (${detail})` : ''}`);
        this.name = 'OrderError';
        this.code = code;
        this.detail = detail;
    }
}

export async function placeOrder(input: OrderInput): Promise<OrderResult> {
    const parsed = orderInputSchema.safeParse(input);
    if (!parsed.success) throw new OrderError('invalid');
    const order = parsed.data;

    if (!useMock) {
        try {
            return await httpCreateOrder(order);
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.status === 409) throw new OrderError('out_of_stock');
                if (error.status === 400 || error.status === 422) throw new OrderError('invalid');
            }
            throw new OrderError('unavailable');
        }
    }

    // mock: السيرفر بيحسب كل حاجة من الكتالوج (مش من أسعار السلة)
    // الحد 48 كافي لكتالوج الـ mock الحالي (36 منتج)
    const { items: catalog } = await getProducts({ pageSize: 48 });
    const byId = new Map(catalog.map((product) => [product.id, product]));

    const methods = await getPaymentMethods();
    if (!methods.some((m) => m.enabled && m.id === order.customer.paymentMethod)) {
        throw new OrderError('invalid', 'paymentMethod');
    }

    let subtotal = 0;
    let giftUnits = 0;

    for (const item of order.items) {
        const product = byId.get(item.productId);
        if (!product) throw new OrderError('invalid', item.productId);

        if (!product.madeToOrder && product.stock < item.quantity) {
            throw new OrderError('out_of_stock', product.slug);
        }

        const missingRequired = product.customizationOptions.some(
            (option) => option.required && !(item.customization?.[option.key] ?? '').trim()
        );
        if (missingRequired) throw new OrderError('invalid', product.slug);

        subtotal += product.price * item.quantity;
        if (item.gift?.wrap) giftUnits += item.quantity;
    }

    const governorate = shippingConfig.governorates.find(
        (g) => g.slug === order.customer.governorate
    );
    const zone = governorate
        ? shippingConfig.zones.find((z) => z.id === governorate.zoneId)
        : undefined;
    if (!zone) throw new OrderError('invalid', 'governorate');

    const giftTotal = giftUnits * shippingConfig.giftWrapPrice;
    const fee = shippingFee(shippingConfig, zone, subtotal);

    return {
        orderId: `BZ-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        status: 'pending',
        total: subtotal + giftTotal + fee,
        currency: 'EGP',
        subtotal,
        shippingFee: fee,
        giftTotal
    };
}
