'use client';

import { ProductCard } from '@/components/shop/product-card';
import { ProductCardSkeleton } from '@/components/shop/product-card-skeleton';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { cartActions } from '@/lib/cart/cart-store';
import { useProductsByIds } from '@/lib/products/use-products-by-ids';
import { useWishlistIds, wishlistActions } from '@/lib/wishlist/wishlist-store';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const gridClass = 'grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4';

export function WishlistView() {
    const t = useTranslations('Wishlist');
    const locale = useLocale() as Locale;
    const ids = useWishlistIds();
    const { products, status } = useProductsByIds(ids);
    const [mounted, setMounted] = useState(false);

    // المفضلة محفوظة في المتصفح، فمنعرضش «فاضية» قبل ما نقراها
    useEffect(() => {
        setMounted(true);
    }, []);

    // منتجات اتشالت من الكتالوج: نشيلها من المفضلة
    useEffect(() => {
        if (status !== 'ready' || ids.length === 0) return;
        const known = new Set(products.map((product) => product.id));
        ids.filter((id) => !known.has(id)).forEach((id) => wishlistActions.remove(id));
    }, [status, products, ids]);

    if (!mounted) {
        return (
            <ul aria-busy="true" className={`mt-8 ${gridClass}`}>
                {Array.from({ length: 4 }, (_, index) => (
                    <li key={index}>
                        <ProductCardSkeleton />
                    </li>
                ))}
            </ul>
        );
    }

    if (ids.length === 0) {
        return (
            <div className="glass mt-8 rounded-[1.75rem] p-10 text-center">
                <p className="font-display text-2xl font-bold">{t('emptyTitle')}</p>
                <p className="mt-2 text-muted">{t('emptyText')}</p>
                <Link
                    href="/shop"
                    className="btn-primary mt-6 inline-flex h-12 items-center justify-center px-8 text-sm font-semibold"
                >
                    {t('emptyCta')}
                </Link>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <p
                role="alert"
                className="glass mt-8 rounded-[1.75rem] p-8 text-center font-medium text-clay"
            >
                {t('error')}
            </p>
        );
    }

    if (products.length === 0) {
        return (
            <ul aria-busy="true" className={`mt-8 ${gridClass}`}>
                {Array.from({ length: Math.min(ids.length, 4) }, (_, index) => (
                    <li key={index}>
                        <ProductCardSkeleton />
                    </li>
                ))}
            </ul>
        );
    }

    const addable = products.filter(
        (product) => !product.customizable && (product.madeToOrder || product.stock > 0)
    );
    const skipped = products.length - addable.length;

    function addAll() {
        addable.forEach((product, index) =>
            cartActions.add({ product, openDrawer: index === addable.length - 1 })
        );
    }

    return (
        <div className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p aria-live="polite" className="text-sm text-muted">
                    {t('count', { count: products.length })}
                </p>

                <div className="flex flex-wrap gap-2">
                    {addable.length > 0 && (
                        <button
                            type="button"
                            onClick={addAll}
                            className="btn-primary inline-flex h-11 items-center px-6 text-sm font-semibold"
                        >
                            {t('addAll')}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={wishlistActions.clear}
                        className="btn-glass inline-flex h-11 items-center px-6 text-sm font-semibold"
                    >
                        {t('clearAll')}
                    </button>
                </div>
            </div>

            {skipped > 0 && addable.length > 0 && (
                <p className="mt-3 text-sm text-muted">{t('skippedNote', { count: skipped })}</p>
            )}

            <ul className={`mt-6 ${gridClass}`}>
                {products.map((product, index) => (
                    <li key={product.id}>
                        <ProductCard product={product} locale={locale} eager={index < 4} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
