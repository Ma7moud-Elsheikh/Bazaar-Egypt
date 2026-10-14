import { api } from '@/lib/api';
import { NextResponse, type NextRequest } from 'next/server';

const ID = /^[A-Za-z0-9_-]{1,64}$/;

export async function GET(request: NextRequest) {
    const raw = request.nextUrl.searchParams.get('ids') ?? '';
    const ids = [
        ...new Set(
            raw
                .split(',')
                .map((id) => id.trim())
                .filter((id) => ID.test(id))
        )
    ].slice(0, 48);

    if (ids.length === 0) return NextResponse.json([]);

    try {
        const products = await api.getProductsByIds(ids);
        return NextResponse.json(products, {
            headers: { 'Cache-Control': 'private, max-age=30' }
        });
    } catch {
        return NextResponse.json([], { status: 502 });
    }
}
