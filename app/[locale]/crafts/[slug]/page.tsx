import { ArtisanCard } from '@/components/artisans/artisan-card';
import { Breadcrumbs } from '@/components/product/breadcrumbs';
import { JsonLd } from '@/components/seo/json-ld';
import { ProductCard } from '@/components/shop/product-card';
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
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { cache } from 'react';

type Props = { params: Promise<{ locale: string; slug: string }> };

const getCraft = cache((slug: string) => api.getCraft(slug));

function trimMeta(text: string, max = 155): string {
    if (text.length <= max) return text;
    return `${text.slice(0, max - 1).trimEnd()}…`;
}

export async function generateStaticParams() {
    const crafts = await api.getCrafts();
    return crafts.map((craft) => ({ slug: craft.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale: rawLocale, slug } = await params;
    const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;

    const craft = await getCraft(slug);
    if (!craft) return {};

    const name = localize(craft.name, locale);
    const description = trimMeta(
        `${localize(craft.tagline, locale)} ${localize(craft.description, locale)}`
    );

    return {
        title: name,
        description,
        alternates: buildAlternates(locale, `/crafts/${slug}`),
        openGraph: {
            images: [
                {
                    url: craft.cover.src,
                    width: craft.cover.width,
                    height: craft.cover.height,
                    alt: localize(craft.cover.alt, locale)
                }
            ]
        }
    };
}

export default async function CraftDetailPage({ params }: Props) {
    const { locale: rawLocale, slug } = await params;
    setRequestLocale(rawLocale);
    const locale = rawLocale as Locale;

    const craft = await getCraft(slug);
    if (!craft) notFound();

    const t = await getTranslations('Crafts');
    const tn = await getTranslations('Nav');

    const [artisans, productsResult, allCrafts] = await Promise.all([
        api.getArtisans({ craft: slug }),
        api.getProducts({ craft: slug, pageSize: 8, sort: 'popular' }),
        api.getCrafts()
    ]);

    const craftName = localize(craft.name, locale);
    const craftDescription = localize(craft.description, locale);
    const otherCrafts = allCrafts.filter((item) => item.id !== craft.id);
    const products = productsResult.items;

    const crumbs = [
        { label: tn('home'), href: '/' },
        { label: tn('crafts'), href: '/crafts' },
        { label: craftName }
    ];

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.label,
            ...(crumb.href
                ? { item: `${SITE_URL}/${locale}${crumb.href === '/' ? '' : crumb.href}` }
                : {})
        }))
    };

    const collectionJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: craftName,
        description: craftDescription,
        url: `${SITE_URL}/${locale}/crafts/${slug}`
    };

    return (
        <>
            <JsonLd data={breadcrumbJsonLd} />
            <JsonLd data={collectionJsonLd} />

            <section
                data-theme="dark"
                className="relative isolate overflow-hidden px-4 pt-32 pb-20 sm:px-8"
            >
                <AmbientBackground pattern />

                <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <Breadcrumbs items={crumbs} label={t('breadcrumb')} />

                        <p className="mt-6 text-sm font-semibold text-accent">
                            {t('detailEyebrow')}
                        </p>
                        <h1 className="mt-2 font-display text-4xl font-bold sm:text-6xl">
                            {craftName}
                        </h1>
                        <p className="mt-4 font-accent text-2xl text-accent">
                            {localize(craft.tagline, locale)}
                        </p>
                        <p className="mt-4 max-w-xl leading-relaxed text-fg/85">
                            {craftDescription}
                        </p>

                        <Link
                            href={`/shop?craft=${slug}`}
                            className="btn-primary mt-8 inline-flex h-11 items-center justify-center px-6 text-sm font-semibold"
                        >
                            {t('heroCta', { craft: craftName })}
                        </Link>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="glass rounded-[2rem] p-2">
                            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem]">
                                <Image
                                    src={craft.cover.src}
                                    alt={localize(craft.cover.alt, locale)}
                                    fill
                                    preload
                                    sizes="(min-width: 1024px) 40vw, 90vw"
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {artisans.length > 0 && (
                <section className="px-4 py-16 sm:px-8">
                    <div className="mx-auto max-w-6xl">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <h2 className="font-display text-3xl font-bold sm:text-4xl">
                                    {t('artisansTitle', { craft: craftName })}
                                </h2>
                                <p className="mt-2 max-w-xl text-muted">{t('artisansSubtitle')}</p>
                            </div>
                            <Link
                                href="/artisans"
                                className="btn-glass inline-flex h-11 items-center justify-center px-6 text-sm font-semibold"
                            >
                                {t('viewAllArtisans')}
                            </Link>
                        </div>

                        <ul className="mt-10 grid gap-5 md:grid-cols-3">
                            {artisans.map((artisan) => (
                                <li key={artisan.id}>
                                    <ArtisanCard
                                        artisan={artisan}
                                        craftName={craftName}
                                        locale={locale}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            <section className="px-4 py-16 sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <h2 className="font-display text-3xl font-bold sm:text-4xl">
                        {t('productsTitle', { craft: craftName })}
                    </h2>

                    {products.length === 0 ? (
                        <p className="mt-6 text-muted">{t('noProducts')}</p>
                    ) : (
                        <>
                            <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                                {products.map((product, index) => (
                                    <li key={product.id}>
                                        <ProductCard
                                            product={product}
                                            craftName={craftName}
                                            locale={locale}
                                            eager={index < 4}
                                        />
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-10 flex justify-center">
                                <Link
                                    href={`/shop?craft=${slug}`}
                                    className="btn-glass inline-flex h-11 items-center justify-center px-6 text-sm font-semibold"
                                >
                                    {t('viewAllProducts', { craft: craftName })}
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {otherCrafts.length > 0 && (
                <section className="px-4 pb-20 sm:px-8">
                    <div className="mx-auto max-w-6xl">
                        <h2 className="font-display text-3xl font-bold sm:text-4xl">
                            {t('otherCraftsTitle')}
                        </h2>
                        <nav
                            aria-label={t('otherCraftsTitle')}
                            className="mt-6 flex flex-wrap gap-2"
                        >
                            {otherCrafts.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/crafts/${item.slug}`}
                                    className="btn-glass inline-flex h-11 items-center justify-center px-5 text-sm font-semibold"
                                >
                                    {localize(item.name, locale)}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </section>
            )}
        </>
    );
}
