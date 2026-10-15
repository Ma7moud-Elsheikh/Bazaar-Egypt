'use client';

import { AmbientBackground } from '@/components/ui/ambient-background';
import { useTranslations } from 'next-intl';

export default function ProductLoading() {
    const t = useTranslations('Errors');

    return (
        <section
            aria-busy="true"
            className="relative isolate overflow-hidden px-4 pt-28 pb-12 sm:px-8"
        >
            <AmbientBackground tone="light" />
            <p role="status" className="sr-only">
                {t('loading')}
            </p>

            <div aria-hidden className="mx-auto max-w-6xl">
                <div className="h-4 w-64 max-w-full rounded-full bg-fg/10" />

                <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-12">
                    <div className="lg:col-span-7">
                        <div className="aspect-[4/5] rounded-card bg-surface-2 motion-safe:animate-pulse" />
                    </div>

                    <div className="lg:col-span-5">
                        <div className="glass space-y-4 rounded-[1.75rem] p-5 sm:p-7 motion-safe:animate-pulse">
                            <div className="h-9 w-24 rounded-full bg-fg/10" />
                            <div className="h-10 w-3/4 rounded-2xl bg-fg/10" />
                            <div className="h-5 w-1/3 rounded-full bg-fg/10" />
                            <div className="h-12 w-1/2 rounded-2xl bg-fg/10" />
                            <div className="h-24 w-full rounded-2xl bg-fg/10" />
                            <div className="h-12 w-full rounded-full bg-fg/15" />
                            <div className="h-12 w-full rounded-full bg-fg/10" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
