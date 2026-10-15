'use client';

import { AmbientBackground } from '@/components/ui/ambient-background';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

type Props = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function RouteError({ error, reset }: Props) {
    const t = useTranslations('Errors');

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <section
            data-theme="dark"
            className="relative isolate flex min-h-[80dvh] items-center justify-center overflow-hidden px-6 pt-28 pb-16"
        >
            <AmbientBackground />

            <div
                role="alert"
                className="glass w-full max-w-xl rounded-[2rem] p-8 text-center sm:p-12"
            >
                <h1 className="font-display text-3xl font-bold sm:text-4xl">{t('title')}</h1>
                <p className="mt-3 text-fg/85">{t('text')}</p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <button
                        type="button"
                        onClick={reset}
                        className="btn-primary inline-flex h-12 items-center justify-center px-8 text-sm font-semibold"
                    >
                        {t('retry')}
                    </button>
                    <Link
                        href="/"
                        className="btn-glass inline-flex h-12 items-center justify-center px-8 text-sm font-semibold"
                    >
                        {t('home')}
                    </Link>
                    <Link
                        href="/contact"
                        className="btn-glass inline-flex h-12 items-center justify-center px-8 text-sm font-semibold"
                    >
                        {t('contact')}
                    </Link>
                </div>

                {error.digest && (
                    <p dir="ltr" className="mt-6 text-xs text-fg/60">
                        {t('reference', { digest: error.digest })}
                    </p>
                )}
            </div>
        </section>
    );
}
