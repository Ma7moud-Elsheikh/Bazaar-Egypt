import { ArtisanCard } from '@/components/artisans/artisan-card';
import { JsonLd } from '@/components/seo/json-ld';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { api } from '@/lib/api';
import { buildAlternates } from '@/lib/seo';
import { SITE_URL } from '@/lib/site';
import { localize } from '@/lib/utils/format';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type Props = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

function parseCraftFilter(raw: Record<string, string | string[] | undefined>): string | undefined {
    const value = first(raw.craft);
    return value && SLUG.test(value) ? value : undefined;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { locale: rawLocale } = await params;
    const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;
    const t = await getTranslations({ locale, namespace: 'Artisans' });
    const craft = parseCraftFilter(await searchParams);

    return {
        title: t('metaTitle'),
        description: t('metaDescription'),
        alternates: buildAlternates(locale, '/artisans'),
        robots: craft ? { index: false, follow: true } : undefined
    };
}

export default async function ArtisansPage({ params, searchParams }: Props) {
    const { locale: rawLocale } = await params;
    setRequestLocale(rawLocale);
    const locale = rawLocale as Locale;

    const t = await getTranslations('Artisans');
    const tn = await getTranslations('Nav');
    const craftFilter = parseCraftFilter(await searchParams);

    const [crafts, artisans] = await Promise.all([
        api.getCrafts(),
        api.getArtisans(craftFilter ? { craft: craftFilter } : undefined)
    ]);

    const craftName = new Map(crafts.map((craft) => [craft.id, localize(craft.name, locale)]));

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
                name: tn('artisans'),
                item: `${SITE_URL}/${locale}/artisans`
            }
        ]
    };

    return (
        <>
            <JsonLd data={breadcrumbJsonLd} />

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

            <section aria-labelledby="artisans-list-title" className="px-4 py-20 sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <h2 id="artisans-list-title" className="sr-only">
                        {t('listLabel')}
                    </h2>

                    <nav aria-label={t('filterLabel')} className="flex flex-wrap gap-2">
                        <Link
                            href="/artisans"
                            aria-current={craftFilter ? undefined : 'true'}
                            className={`inline-flex h-11 items-center justify-center px-5 text-sm font-semibold ${
                                craftFilter ? 'btn-glass' : 'btn-primary'
                            }`}
                        >
                            {t('allCrafts')}
                        </Link>
                        {crafts.map((craft) => {
                            const active = craftFilter === craft.slug;
                            return (
                                <Link
                                    key={craft.id}
                                    href={`/artisans?craft=${craft.slug}`}
                                    aria-current={active ? 'true' : undefined}
                                    className={`inline-flex h-11 items-center justify-center px-5 text-sm font-semibold ${
                                        active ? 'btn-primary' : 'btn-glass'
                                    }`}
                                >
                                    {localize(craft.name, locale)}
                                </Link>
                            );
                        })}
                    </nav>

                    <p aria-live="polite" className="mt-6 text-sm text-muted">
                        {t('resultsCount', { count: artisans.length })}
                    </p>

                    {artisans.length === 0 ? (
                        <p className="mt-6 text-muted">{t('emptyFiltered')}</p>
                    ) : (
                        <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {artisans.map((artisan) => (
                                <li key={artisan.id}>
                                    <ArtisanCard
                                        artisan={artisan}
                                        craftName={craftName.get(artisan.craftId) ?? ''}
                                        locale={locale}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </>
    );
}
