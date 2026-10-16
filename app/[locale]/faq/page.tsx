import { Breadcrumbs } from '@/components/product/breadcrumbs';
import { JsonLd } from '@/components/seo/json-ld';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { ChevronIcon } from '@/components/ui/icons';
import { Reveal } from '@/components/ui/reveal';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { api } from '@/lib/api';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { buildAlternates } from '@/lib/seo';
import { toFaqGroups } from '@/lib/static-content';
import { formatPrice } from '@/lib/utils/format';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale: rawLocale } = await params;
    const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;
    const t = await getTranslations({ locale, namespace: 'Pages' });

    return {
        title: t('faq.metaTitle'),
        description: t('faq.metaDescription'),
        alternates: buildAlternates(locale, '/faq')
    };
}

export default async function FaqPage({ params }: Props) {
    const { locale: rawLocale } = await params;
    setRequestLocale(rawLocale);
    const locale = rawLocale as Locale;

    const t = await getTranslations('Pages');
    const tn = await getTranslations('Nav');
    const config = await api.getShippingConfig();

    const groups = toFaqGroups(t.raw('faq.groups'), {
        days: config.returnDays,
        threshold: formatPrice(config.freeShippingThreshold, locale)
    });

    return (
        <>
            <JsonLd
                data={breadcrumbJsonLd(locale, [
                    { name: tn('home'), path: '/' },
                    { name: t('faq.title') }
                ])}
            />

            <section className="relative isolate overflow-hidden px-4 pt-28 pb-8 sm:px-8">
                <AmbientBackground tone="light" />
                <div className="mx-auto max-w-6xl">
                    <Breadcrumbs
                        items={[{ label: tn('home'), href: '/' }, { label: t('faq.title') }]}
                        label={t('common.breadcrumb')}
                    />
                    <p className="mt-6 text-sm font-semibold text-accent">{t('faq.eyebrow')}</p>
                    <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
                        {t('faq.title')}
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg text-fg/85">{t('faq.intro')}</p>
                </div>
            </section>

            <section className="px-4 pb-24 sm:px-8">
                <div className="mx-auto max-w-3xl space-y-12">
                    {groups.map((group, groupIndex) => (
                        <Reveal key={group.title}>
                            <section aria-labelledby={`faq-group-${groupIndex}`}>
                                <h2
                                    id={`faq-group-${groupIndex}`}
                                    className="font-display text-2xl font-bold sm:text-3xl"
                                >
                                    {group.title}
                                </h2>

                                <div className="mt-4 border-t border-line">
                                    {group.items.map((item) => (
                                        <details key={item.q} className="group border-b border-line">
                                            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-lg font-bold [&::-webkit-details-marker]:hidden">
                                                {item.q}
                                                <ChevronIcon className="size-5 shrink-0 text-muted transition duration-300 group-open:rotate-90 rtl:-scale-x-100" />
                                            </summary>
                                            <p className="pb-5 leading-8 text-fg/90">{item.a}</p>
                                        </details>
                                    ))}
                                </div>
                            </section>
                        </Reveal>
                    ))}

                    <aside className="glass rounded-[1.75rem] p-6 text-center sm:p-8">
                        <h2 className="font-display text-2xl font-bold">{t('faq.moreTitle')}</h2>
                        <p className="mt-2 text-muted">{t('faq.moreText')}</p>
                        <Link
                            href="/contact"
                            className="btn-primary mt-5 inline-flex h-12 items-center justify-center px-8 text-sm font-semibold"
                        >
                            {t('faq.moreCta')}
                        </Link>
                    </aside>
                </div>
            </section>
        </>
    );
}
