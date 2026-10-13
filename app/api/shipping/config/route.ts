import { api } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const config = await api.getShippingConfig();
        return NextResponse.json(config, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
            }
        });
    } catch {
        return NextResponse.json({ error: 'shipping config unavailable' }, { status: 503 });
    }
}
