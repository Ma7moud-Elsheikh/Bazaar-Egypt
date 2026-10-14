import type { Product } from '@/lib/schemas/catalog';
import { useEffect, useState } from 'react';

type State = { key: string; products: Product[]; status: 'loading' | 'ready' | 'error' };

/** بيجيب المنتجات بالـ ids من /api/products (للمفضلة وشاهدتها مؤخرًا) */
export function useProductsByIds(ids: string[]): {
    products: Product[];
    status: 'loading' | 'ready' | 'error';
} {
    const key = ids.join(',');
    const [state, setState] = useState<State>({ key: '', products: [], status: 'loading' });

    useEffect(() => {
        if (!key) return;

        const controller = new AbortController();

        fetch(`/api/products?ids=${encodeURIComponent(key)}`, { signal: controller.signal })
            .then((res) => {
                if (!res.ok) throw new Error('products request failed');
                return res.json() as Promise<Product[]>;
            })
            .then((products) => setState({ key, products, status: 'ready' }))
            .catch((error: Error) => {
                if (error.name !== 'AbortError') setState({ key, products: [], status: 'error' });
            });

        return () => controller.abort();
    }, [key]);

    if (!key) return { products: [], status: 'ready' };
    if (state.key !== key) return { products: state.products, status: 'loading' };
    return { products: state.products, status: state.status };
}
