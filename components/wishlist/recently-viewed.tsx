'use client';

import { ProductCard } from '@/components/shop/product-card';
import { Reveal } from '@/components/ui/reveal';
import type { Locale } from '@/i18n/routing';
import { useProductsByIds } from '@/lib/products/use-products-by-ids';
import { recordView, useViewedIds } from '@/lib/recent/viewed-store';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect } from 'react';

type Props = {
    /** في صفحة المنتج: بيسجّل الزيارة وبيستبعد المنتج الحالي من القايمة */
    currentId?: string;
    limit?: number;
};

export function RecentlyViewed({ currentId, limit = 4 }: Props) {
    const t = useTranslations('Wishlist');
    const locale = useLocale() as Locale;
    const viewed = useViewedIds();

    useEffect(() => {
        if (currentId) recordView(currentId);
    }, [currentId]);

    const ids = viewed.filter((id) => id !== currentId).slice(0, limit);
    const { products } = useProductsByIds(ids);

    if (products.length === 0) return null;

    return (
        <section aria-labelledby="recent-title" className="px-4 py-16 sm:px-8 sm:py-20">
            <div className="mx-auto max-w-6xl">
                <Reveal>
                    <h2 id="recent-title" className="font-display text-2xl font-bold sm:text-3xl">
                        {t('recentTitle')}
                    </h2>
                </Reveal>
                <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                    {products.map((product, index) => (
                        <Reveal as="li" key={product.id} delay={Math.min(index, 6) * 60}>
                            <ProductCard product={product} locale={locale} />
                        </Reveal>
                    ))}
                </ul>
            </div>
        </section>
    );
}
