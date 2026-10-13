import { CartPageView } from '@/components/cart/cart-page-view';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { routing } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale: rawLocale } = await params;
    const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;
    const t = await getTranslations({ locale, namespace: 'Cart' });

    return {
        title: t('pageTitle'),
        // السلة صفحة شخصية: ما بتتفهرسش
        robots: { index: false, follow: false },
        alternates: buildAlternates(locale, '/cart')
    };
}

export default async function CartPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('Cart');

    return (
        <section className="relative isolate overflow-hidden px-4 pt-28 pb-24 sm:px-8">
            <AmbientBackground tone="light" />

            <div className="mx-auto max-w-6xl">
                <h1 className="font-display text-4xl font-bold sm:text-5xl">{t('pageTitle')}</h1>
                <CartPageView />
            </div>
        </section>
    );
}
