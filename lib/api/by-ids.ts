import { paginatedSchema, productSchema, type Product } from '@/lib/schemas/catalog';
import { getProducts } from './mock';

const useMock = process.env.USE_MOCK_API !== 'false';

/** بيرجّع المنتجات بنفس ترتيب الـ ids (اللي مش موجود بيتخطّى) */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) return [];

    let items: Product[];

    if (useMock) {
        // الحد 48 كافي لكتالوج الـ mock الحالي (36 منتج). لو كبّرته لازم تغيّر ده
        ({ items } = await getProducts({ pageSize: 48 }));
    } else {
        const base = process.env.API_URL;
        if (!base) {
            throw new Error('API_URL مش متحدد في .env.local (مطلوب لما USE_MOCK_API=false)');
        }

        const res = await fetch(
            `${base.replace(/\/$/, '')}/products?ids=${encodeURIComponent(ids.join(','))}&pageSize=48`,
            { headers: { Accept: 'application/json' }, next: { revalidate: 30 } }
        );
        if (!res.ok) throw new Error(`API products by ids فشل (${res.status})`);

        const parsed = paginatedSchema(productSchema).safeParse(await res.json());
        if (!parsed.success) throw new Error('API products by ids رجّع شكل مخالف للـ contract');
        items = parsed.data.items;
    }

    const byId = new Map(items.map((product) => [product.id, product]));
    return ids.flatMap((id) => {
        const product = byId.get(id);
        return product ? [product] : [];
    });
}
