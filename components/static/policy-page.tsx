import { Breadcrumbs } from '@/components/product/breadcrumbs';
import { JsonLd } from '@/components/seo/json-ld';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { routing, type Locale } from '@/i18n/routing';
import { api } from '@/lib/api';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { buildAlternates } from '@/lib/seo';
import { LEGAL_UPDATED } from '@/lib/site';
import { toSections } from '@/lib/static-content';
import { formatPrice } from '@/lib/utils/format';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ShippingZones } from './shipping-zones';

export type PolicyDoc = 'shipping' | 'returns' | 'privacy' | 'terms';

export async function policyMetadata(doc: PolicyDoc, rawLocale: string): Promise<Metadata> {
    const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;
    const t = await getTranslations({ locale, namespace: 'Pages' });

    return {
        title: t(`${doc}.metaTitle`),
        description: t(`${doc}.metaDescription`),
        alternates: buildAlternates(locale, `/${doc}`)
    };
}

type Props = { doc: PolicyDoc; locale: string };

export async function PolicyPage({ doc, locale: rawLocale }: Props) {
    setRequestLocale(rawLocale);
    const locale = rawLocale as Locale;

    const t = await getTranslations('Pages');
    const tn = await getTranslations('Nav');
    const config = await api.getShippingConfig();

    const sections = toSections(t.raw(`${doc}.sections`), {
        days: config.returnDays,
        threshold: formatPrice(config.freeShippingThreshold, locale)
    });

    const title = t(`${doc}.title`);
    const updated = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(LEGAL_UPDATED));

    const crumbs = [{ label: tn('home'), href: '/' }, { label: title }];

    return (
        <>
            <JsonLd
                data={breadcrumbJsonLd(locale, [{ name: tn('home'), path: '/' }, { name: title }])}
            />

            <section className="relative isolate overflow-hidden px-4 pt-28 pb-8 sm:px-8">
                <AmbientBackground tone="light" />

                <div className="mx-auto max-w-6xl">
                    <Breadcrumbs items={crumbs} label={t('common.breadcrumb')} />
                    <p className="mt-6 text-sm font-semibold text-accent">{t(`${doc}.eyebrow`)}</p>
                    <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">{title}</h1>
                    <p className="mt-4 max-w-2xl text-lg text-fg/85">{t(`${doc}.intro`)}</p>
                    <p className="mt-3 text-sm text-muted">
                        {t('common.updated', { date: updated })}
                    </p>
                </div>
            </section>

            <section className="px-4 pb-24 sm:px-8">
                <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-12">
                    <aside className="hidden lg:col-span-3 lg:block">
                        <nav aria-label={t('common.toc')} className="sticky top-28">
                            <p className="mb-3 font-display text-lg font-bold">{t('common.toc')}</p>
                            <ol className="space-y-1 text-sm">
                                {sections.map((section, index) => (
                                    <li key={section.heading}>
                                        <a
                                            href={`#section-${index + 1}`}
                                            className="flex min-h-11 items-center text-muted transition hover:text-fg"
                                        >
                                            {section.heading}
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    </aside>

                    <div className="lg:col-span-9">
                        <div className="max-w-3xl">
                            {doc === 'shipping' && <ShippingZones locale={locale} />}

                            {sections.map((section, index) => (
                                <section
                                    key={section.heading}
                                    id={`section-${index + 1}`}
                                    aria-labelledby={`section-title-${index + 1}`}
                                    className="mb-10 scroll-mt-28"
                                >
                                    <h2
                                        id={`section-title-${index + 1}`}
                                        className="font-display text-2xl font-bold sm:text-3xl"
                                    >
                                        {section.heading}
                                    </h2>
                                    <div className="mt-3 space-y-4 text-base leading-8 text-fg/90">
                                        {section.paragraphs.map((paragraph) => (
                                            <p key={paragraph}>{paragraph}</p>
                                        ))}
                                        {section.list.length > 0 && (
                                            <ul className="list-disc space-y-2 ps-6 marker:text-accent">
                                                {section.list.map((item) => (
                                                    <li key={item}>{item}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </section>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
