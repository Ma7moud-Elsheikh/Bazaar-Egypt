'use client';

import { ProductCardSkeleton } from '@/components/shop/product-card-skeleton';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { useTranslations } from 'next-intl';

export default function Loading() {
    const t = useTranslations('Errors');

    return (
        <section
            aria-busy="true"
            className="relative isolate overflow-hidden px-4 pt-28 pb-24 sm:px-8"
        >
            <AmbientBackground tone="light" />
            <p role="status" className="sr-only">
                {t('loading')}
            </p>

            <div aria-hidden className="mx-auto max-w-6xl">
                <div className="h-4 w-24 rounded-full bg-fg/10" />
                <div className="mt-4 h-10 w-3/4 max-w-xl rounded-2xl bg-fg/10 sm:h-14" />
                <div className="mt-4 h-5 w-full max-w-md rounded-full bg-fg/10" />

                <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                    {Array.from({ length: 4 }, (_, index) => (
                        <li key={index}>
                            <ProductCardSkeleton />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
