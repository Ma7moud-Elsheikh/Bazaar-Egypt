import { CraftCard } from '@/components/crafts/craft-card';
import { JsonLd } from '@/components/seo/json-ld';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { routing, type Locale } from '@/i18n/routing';
import { api } from '@/lib/api';
import { buildAlternates } from '@/lib/seo';
import { SITE_URL } from '@/lib/site';
import { localize } from '@/lib/utils/format';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale: rawLocale } = await params;
    const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;
    const t = await getTranslations({ locale, namespace: 'Crafts' });

    return {
        title: t('metaTitle'),
        description: t('metaDescription'),
        alternates: buildAlternates(locale, '/crafts')
    };
}

export default async function CraftsPage({ params }: Props) {
    const { locale: rawLocale } = await params;
    setRequestLocale(rawLocale);
    const locale = rawLocale as Locale;

    const t = await getTranslations('Crafts');
    const tn = await getTranslations('Nav');

    const [crafts, artisans, productsResult] = await Promise.all([
        api.getCrafts(),
        api.getArtisans(),
        api.getProducts({ pageSize: 48 })
    ]);

    const productsCountByCraft = new Map<string, number>();
    for (const product of productsResult.items) {
        productsCountByCraft.set(
            product.craftId,
            (productsCountByCraft.get(product.craftId) ?? 0) + 1
        );
    }

    const artisansCountByCraft = new Map<string, number>();
    for (const artisan of artisans) {
        artisansCountByCraft.set(
            artisan.craftId,
            (artisansCountByCraft.get(artisan.craftId) ?? 0) + 1
        );
    }

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: tn('home'),
                item: `${SITE_URL}/${locale}`
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: tn('crafts'),
                item: `${SITE_URL}/${locale}/crafts`
            }
        ]
    };

    const itemListJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: crafts.map((craft, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${SITE_URL}/${locale}/crafts/${craft.slug}`,
            name: localize(craft.name, locale)
        }))
    };

    return (
        <>
            <JsonLd data={breadcrumbJsonLd} />
            <JsonLd data={itemListJsonLd} />

            <section className="relative isolate overflow-hidden px-4 pt-28 pb-10 sm:px-8">
                <AmbientBackground tone="light" />

                <div className="mx-auto max-w-6xl">
                    <p className="text-sm text-accent">{t('eyebrow')}</p>
                    <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
                        {t('title')}
                    </h1>
                    <p className="mt-3 max-w-2xl text-muted">{t('subtitle')}</p>
                </div>
            </section>

            <section aria-labelledby="crafts-list-title" className="px-4 pb-20 sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <h2 id="crafts-list-title" className="sr-only">
                        {t('listLabel')}
                    </h2>

                    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {crafts.map((craft) => (
                            <li key={craft.id}>
                                <CraftCard
                                    craft={craft}
                                    productsCount={productsCountByCraft.get(craft.id) ?? 0}
                                    artisansCount={artisansCountByCraft.get(craft.id) ?? 0}
                                    locale={locale}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </>
    );
}
