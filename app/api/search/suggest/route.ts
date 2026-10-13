import { api } from '@/lib/api';
import type { SuggestPayload } from '@/lib/search/suggest-payload';
import { NextResponse, type NextRequest } from 'next/server';

const EMPTY: SuggestPayload = { queries: [], crafts: [], products: [] };

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const q = (searchParams.get('q') ?? '').trim().slice(0, 80);
    const locale = searchParams.get('locale') === 'en' ? 'en' : 'ar';

    if (q.length < 2) return NextResponse.json(EMPTY);

    try {
        const data = await api.suggest(q, { locale, limit: 8 });

        const payload: SuggestPayload = {
            queries: data.queries,
            crafts: data.crafts.map((craft) => ({
                slug: craft.slug,
                name: craft.name,
                cover: { src: craft.cover.src, alt: craft.cover.alt }
            })),
            products: data.products.map((product) => ({
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: { src: product.images[0].src, alt: product.images[0].alt }
            }))
        };

        return NextResponse.json(payload, {
            headers: {
                'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
            }
        });
    } catch {
        // الاقتراحات تحسين مش أساس: لو فشلت نرجّع فاضي ومفيش error للمستخدم
        return NextResponse.json(EMPTY);
    }
}
