import { CheckoutForm } from '@/components/checkout/checkout-form';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { routing } from '@/i18n/routing';
import { api } from '@/lib/api';
import { buildAlternates } from '@/lib/seo';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale: rawLocale } = await params;
    const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;
    const t = await getTranslations({ locale, namespace: 'Checkout' });

    return {
        title: t('pageTitle'),
        robots: { index: false, follow: false },
        alternates: buildAlternates(locale, '/checkout')
    };
}

export default async function CheckoutPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('Checkout');

    const [methods, config] = await Promise.all([api.getPaymentMethods(), api.getShippingConfig()]);

    return (
        <section className="relative isolate overflow-hidden px-4 pt-28 pb-24 sm:px-8">
            <AmbientBackground tone="light" />

            <div className="mx-auto max-w-6xl">
                <h1 className="font-display text-4xl font-bold sm:text-5xl">{t('title')}</h1>
                <p className="mt-3 max-w-2xl text-muted">{t('subtitle')}</p>

                <CheckoutForm
                    paymentMethods={methods.filter((method) => method.enabled)}
                    config={config}
                />
            </div>
        </section>
    );
}
