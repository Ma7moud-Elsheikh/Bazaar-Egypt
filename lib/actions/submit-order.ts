'use server';

import { api, OrderError } from '@/lib/api';
import { orderInputSchema, type OrderResult } from '@/lib/schemas/order';
import { normalizeEgyptPhone } from '@/lib/utils/phone';

export type SubmitOrderResponse =
    | { ok: true; result: OrderResult }
    | { ok: false; code: 'invalid' | 'out_of_stock' | 'unavailable'; detail?: string };

function prepare(payload: unknown): unknown {
    if (!payload || typeof payload !== 'object') return payload;

    const input = payload as { customer?: Record<string, unknown> };
    if (!input.customer || typeof input.customer.phone !== 'string') return payload;

    return {
        ...input,
        customer: { ...input.customer, phone: normalizeEgyptPhone(input.customer.phone) }
    };
}

export async function submitOrder(payload: unknown): Promise<SubmitOrderResponse> {
    const parsed = orderInputSchema.safeParse(prepare(payload));
    if (!parsed.success) return { ok: false, code: 'invalid' };

    try {
        const result = await api.createOrder(parsed.data);
        return { ok: true, result };
    } catch (error) {
        if (error instanceof OrderError) {
            return { ok: false, code: error.code, detail: error.detail };
        }
        console.error('[submitOrder]', error);
        return { ok: false, code: 'unavailable' };
    }
}
