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

const getArtisan = cache((slug: string) => api.getArtisan(slug));

const absolute = (src: string) => (src.startsWith('http') ? src : `${SITE_URL}${src}`);

function trimMeta(text: string, max = 155): string {
    if (text.length <= max) return text;
    return `${text.slice(0, max - 1).trimEnd()}…`;
}

export async function generateStaticParams() {
    const artisans = await api.getArtisans();
    return artisans.map((artisan) => ({ slug: artisan.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale: rawLocale, slug } = await params;
    const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;

    const artisan = await getArtisan(slug);
    if (!artisan) return {};

    const name = localize(artisan.name, locale);
    const description = trimMeta(localize(artisan.bio, locale));

    return {
        title: name,
        description,
        alternates: buildAlternates(locale, `/artisans/${slug}`),
        openGraph: {
            images: [
                {
                    url: artisan.portrait.src,
                    width: artisan.portrait.width,
                    height: artisan.portrait.height,
                    alt: localize(artisan.portrait.alt, locale)
                }
            ]
        }
    };
}

export default async function ArtisanDetailPage({ params }: Props) {
    const { locale: rawLocale, slug } = await params;
    setRequestLocale(rawLocale);
    const locale = rawLocale as Locale;

    const artisan = await getArtisan(slug);
    if (!artisan) notFound();

    const t = await getTranslations('Artisans');
    const tn = await getTranslations('Nav');

    const crafts = await api.getCrafts();
    const craft = crafts.find((item) => item.id === artisan.craftId);

    const [productsResult, craftArtisans] = await Promise.all([
        api.getProducts({ artisan: slug, pageSize: 8, sort: 'popular' }),
        craft ? api.getArtisans({ craft: craft.slug }) : Promise.resolve([])
    ]);

    const craftName = craft ? localize(craft.name, locale) : '';
    const name = localize(artisan.name, locale);
    const bio = localize(artisan.bio, locale);
    const products = productsResult.items;
    const moreArtisans = craftArtisans.filter((item) => item.id !== artisan.id).slice(0, 3);

    const crumbs = [
        { label: tn('home'), href: '/' },
        { label: tn('artisans'), href: '/artisans' },
        { label: name }
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

    const personJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name,
        image: absolute(artisan.portrait.src),
        description: bio,
        jobTitle: craftName,
        homeLocation: localize(artisan.governorate.name, locale),
        url: `${SITE_URL}/${locale}/artisans/${slug}`
    };

    return (
        <>
            <JsonLd data={breadcrumbJsonLd} />
            <JsonLd data={personJsonLd} />

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
                        <h1 className="mt-2 font-display text-4xl font-bold sm:text-6xl">{name}</h1>

                        <ul className="mt-6 flex flex-wrap gap-2">
                            {craft && (
                                <li className="glass rounded-full px-4 py-1.5 text-sm">
                                    <Link href={`/crafts/${craft.slug}`}>{craftName}</Link>
                                </li>
                            )}
                            <li className="glass rounded-full px-4 py-1.5 text-sm">
                                {t('fromGovernorate', {
                                    governorate: localize(artisan.governorate.name, locale)
                                })}
                            </li>
                            <li className="glass rounded-full px-4 py-1.5 text-sm">
                                {t('experience', { years: artisan.yearsOfExperience })}
                            </li>
                        </ul>

                        <p className="mt-5 max-w-xl leading-relaxed text-fg/85">{bio}</p>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="glass rounded-[2rem] p-2">
                            <div className="relative aspect-square overflow-hidden rounded-[1.5rem]">
                                <Image
                                    src={artisan.portrait.src}
                                    alt={localize(artisan.portrait.alt, locale)}
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

            <section className="px-4 py-16 sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <h2 className="font-display text-3xl font-bold sm:text-4xl">
                        {t('storyTitle')}
                    </h2>
                    <blockquote
                        className={`mt-6 max-w-3xl border-s-2 border-accent ps-5 font-accent text-3xl leading-relaxed text-fg ${
                            locale === 'en' ? 'italic' : ''
                        }`}
                    >
                        {localize(artisan.story, locale)}
                    </blockquote>
                </div>
            </section>

            <section className="px-4 py-16 sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <h2 className="font-display text-3xl font-bold sm:text-4xl">
                        {t('productsTitle', { name })}
                    </h2>

                    {products.length === 0 ? (
                        <p className="mt-6 text-muted">{t('noProducts', { name })}</p>
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

                            {craft && (
                                <div className="mt-10 flex justify-center">
                                    <Link
                                        href={`/shop?craft=${craft.slug}`}
                                        className="btn-glass inline-flex h-11 items-center justify-center px-6 text-sm font-semibold"
                                    >
                                        {t('viewAllProducts', { craft: craftName })}
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {moreArtisans.length > 0 && craft && (
                <section className="px-4 pb-20 sm:px-8">
                    <div className="mx-auto max-w-6xl">
                        <h2 className="font-display text-3xl font-bold sm:text-4xl">
                            {t('moreArtisansTitle', { craft: craftName })}
                        </h2>
                        <ul className="mt-10 grid gap-5 md:grid-cols-3">
                            {moreArtisans.map((item) => (
                                <li key={item.id}>
                                    <ArtisanCard
                                        artisan={item}
                                        craftName={craftName}
                                        locale={locale}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}
        </>
    );
}
