import { OrderConfirmation } from '@/components/checkout/order-confirmation';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { routing } from '@/i18n/routing';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ locale: string; id: string }> };

const ORDER_ID = /^[A-Za-z0-9-]{4,40}$/;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale: rawLocale } = await params;
    const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;
    const t = await getTranslations({ locale, namespace: 'Order' });

    return {
        title: t('pageTitle'),
        robots: { index: false, follow: false }
    };
}

export default async function OrderPage({ params }: Props) {
    const { locale, id } = await params;
    setRequestLocale(locale);

    if (!ORDER_ID.test(id)) notFound();

    return (
        <section className="relative isolate overflow-hidden px-4 pt-28 pb-24 sm:px-8">
            <AmbientBackground tone="light" />
            <OrderConfirmation orderId={id} />
        </section>
    );
}
