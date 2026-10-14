import { AmbientBackground } from '@/components/ui/ambient-background';
import { WishlistView } from '@/components/wishlist/wishlist-view';
import { routing } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale: rawLocale } = await params;
    const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;
    const t = await getTranslations({ locale, namespace: 'Wishlist' });

    return {
        title: t('metaTitle'),
        // قايمة شخصية: ما بتتفهرسش
        robots: { index: false, follow: false },
        alternates: buildAlternates(locale, '/wishlist')
    };
}

export default async function WishlistPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('Wishlist');

    return (
        <section className="relative isolate overflow-hidden px-4 pt-28 pb-24 sm:px-8">
            <AmbientBackground tone="light" />

            <div className="mx-auto max-w-6xl">
                <p className="text-sm font-semibold text-accent">{t('eyebrow')}</p>
                <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">{t('title')}</h1>
                <p className="mt-3 max-w-2xl text-muted">{t('subtitle')}</p>

                <WishlistView />
            </div>
        </section>
    );
}
