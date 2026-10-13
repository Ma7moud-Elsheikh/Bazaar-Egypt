'use client';

import { Link } from '@/i18n/navigation';
import { cartActions, useCart } from '@/lib/cart/cart-store';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { CartLine } from './cart-line';
import { CartSummary } from './cart-summary';

export function CartPageView() {
    const t = useTranslations('Cart');
    const { items, count } = useCart();
    const [mounted, setMounted] = useState(false);

    // السلة محفوظة في المتصفح، فمنعرضش «السلة فارغة» قبل ما نقراها
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div aria-busy="true" className="mt-8 grid gap-8 lg:grid-cols-12">
                <p className="sr-only" role="status">
                    {t('loading')}
                </p>
                <div className="glass h-64 rounded-[1.75rem] lg:col-span-8 motion-safe:animate-pulse" />
                <div className="glass h-72 rounded-[1.75rem] lg:col-span-4 motion-safe:animate-pulse" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="glass mt-8 rounded-[1.75rem] p-10 text-center">
                <p className="font-display text-2xl font-bold">{t('emptyTitle')}</p>
                <p className="mt-2 text-muted">{t('emptyText')}</p>
                <Link
                    href="/shop"
                    className="btn-primary mt-6 inline-flex h-12 items-center justify-center px-8 text-sm font-semibold"
                >
                    {t('continueShopping')}
                </Link>
            </div>
        );
    }

    return (
        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-start">
            <section aria-labelledby="cart-items-title" className="lg:col-span-8">
                <div className="flex items-center justify-between gap-4">
                    <h2 id="cart-items-title" className="text-sm text-muted">
                        {t('itemCount', { count })}
                    </h2>
                    <button
                        type="button"
                        onClick={cartActions.clear}
                        className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-muted transition hover:text-fg"
                    >
                        {t('clearCart')}
                    </button>
                </div>

                <ul className="glass mt-2 divide-y divide-line rounded-[1.75rem] px-5 sm:px-6">
                    {items.map((item) => (
                        <li key={item.lineId}>
                            <CartLine item={item} large />
                        </li>
                    ))}
                </ul>
            </section>

            <aside
                aria-labelledby="cart-summary-title"
                className="glass rounded-[1.75rem] p-5 sm:p-6 lg:sticky lg:top-28 lg:col-span-4"
            >
                <h2 id="cart-summary-title" className="mb-4 font-display text-xl font-bold">
                    {t('orderSummary')}
                </h2>
                <CartSummary variant="page" />
            </aside>
        </div>
    );
}
