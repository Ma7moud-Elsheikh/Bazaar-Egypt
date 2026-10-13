import { ArtisanStory } from '@/components/product/artisan-story';
import { Breadcrumbs } from '@/components/product/breadcrumbs';
import { Gallery } from '@/components/product/gallery';
import { ProductAccordion } from '@/components/product/product-accordion';
import { PurchasePanel } from '@/components/product/purchase-panel';
import { Reviews } from '@/components/product/reviews';
import { JsonLd } from '@/components/seo/json-ld';
import { RecommendedProducts } from '@/components/shop/recommended-products';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { StarIcon } from '@/components/ui/icons';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { api } from '@/lib/api';
import { buildAlternates } from '@/lib/seo';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import { DEFAULT_RETURN_DAYS } from '@/lib/store-config';
import { formatPrice, localize } from '@/lib/utils/format';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { cache } from 'react';

type Props = { params: Promise<{ locale: string; slug: string }> };

const getProduct = cache((slug: string) => api.getProduct(slug));

const absolute = (src: string) => (src.startsWith('http') ? src : `${SITE_URL}${src}`);

export async function generateStaticParams() {
    const { items } = await api.getProducts({ pageSize: 48 });
    return items.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale: rawLocale, slug } = await params;
    const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;

    const product = await getProduct(slug);
    if (!product) return {};

    const name = localize(product.name, locale);
    const description = localize(product.summary, locale);
    const image = product.images[0];

    return {
        title: name,
        description,
        alternates: buildAlternates(locale, `/shop/${slug}`),
        openGraph: {
            type: 'website',
            title: name,
            description,
            images: [
                {
                    url: image.src,
                    width: image.width,
                    height: image.height,
                    alt: localize(image.alt, locale)
                }
            ]
        },
        twitter: { card: 'summary_large_image', title: name, description, images: [image.src] }
    };
}

export default async function ProductPage({ params }: Props) {
    const { locale: rawLocale, slug } = await params;
    setRequestLocale(rawLocale);
    const locale = rawLocale as Locale;

    const product = await getProduct(slug);
    if (!product) notFound();

    const t = await getTranslations('ProductPage');
    const tn = await getTranslations('Nav');

    const [crafts, artisans, related, reviews] = await Promise.all([
        api.getCrafts(),
        api.getArtisans(),
        api.getRelatedProducts(slug, 4),
        api.getProductReviews(slug, 6)
    ]);

    const craft = crafts.find((c) => c.id === product.craftId);
    const artisan = artisans.find((a) => a.id === product.artisanId);

    const artisanProducts = artisan
        ? (await api.getProducts({ artisan: artisan.slug, pageSize: 5 })).items
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
        : [];

    const name = localize(product.name, locale);
    const returnDays = product.returnDays ?? DEFAULT_RETURN_DAYS;
    const compareAt = product.compareAtPrice;
    const hasDiscount = compareAt !== undefined && compareAt > product.price;
    const discount = hasDiscount ? Math.round((1 - product.price / compareAt) * 100) : 0;
    const available = product.madeToOrder || product.stock > 0;

    const crumbs = [
        { label: tn('home'), href: '/' },
        { label: tn('shop'), href: '/shop' },
        ...(craft
            ? [{ label: localize(craft.name, locale), href: `/shop?craft=${craft.slug}` }]
            : []),
        { label: name }
    ];

    const productJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        image: product.images.map((image) => absolute(image.src)),
        description: localize(product.description, locale),
        sku: product.sku ?? product.id,
        brand: { '@type': 'Brand', name: SITE_NAME[locale] },
        ...(artisan
            ? { manufacturer: { '@type': 'Person', name: localize(artisan.name, locale) } }
            : {}),
        material: product.materials.map((m) => localize(m, locale)).join(', '),
        offers: {
            '@type': 'Offer',
            url: `${SITE_URL}/${locale}/shop/${slug}`,
            priceCurrency: product.currency,
            price: product.price,
            availability: available
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            hasMerchantReturnPolicy: {
                '@type': 'MerchantReturnPolicy',
                applicableCountry: 'EG',
                returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                merchantReturnDays: returnDays
            }
        },
        ...(product.reviewCount >= 3
            ? {
                  aggregateRating: {
                      '@type': 'AggregateRating',
                      ratingValue: product.rating,
                      reviewCount: product.reviewCount
                  }
              }
            : {})
    };

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

    return (
        <div className="pb-20 lg:pb-0">
            <JsonLd data={productJsonLd} />
            <JsonLd data={breadcrumbJsonLd} />

            <section className="relative isolate overflow-hidden px-4 pt-28 pb-12 sm:px-8">
                <AmbientBackground tone="light" />

                <div className="mx-auto max-w-6xl">
                    <Breadcrumbs items={crumbs} label={t('breadcrumb')} />

                    <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-12">
                        <div className="lg:col-span-7">
                            <div className="lg:sticky lg:top-28">
                                <Gallery images={product.images} name={name} />
                            </div>
                        </div>

                        <div className="lg:col-span-5">
                            <div className="glass rounded-[1.75rem] p-5 sm:p-7">
                                <ul className="flex flex-wrap gap-2 text-xs font-semibold">
                                    {craft && (
                                        <li>
                                            <Link
                                                href={`/shop?craft=${craft.slug}`}
                                                className="btn-glass inline-flex min-h-9 items-center px-4"
                                            >
                                                {localize(craft.name, locale)}
                                            </Link>
                                        </li>
                                    )}
                                    <li className="inline-flex min-h-9 items-center rounded-full border border-line px-4">
                                        {localize(product.governorate.name, locale)}
                                    </li>
                                </ul>

                                <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
                                    {name}
                                </h1>

                                {product.reviewCount > 0 && (
                                    <a
                                        href="#reviews"
                                        className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-muted transition hover:text-fg"
                                    >
                                        <StarIcon className="size-4 text-gold" />
                                        <span className="font-semibold text-fg">
                                            {product.rating.toFixed(1)}
                                        </span>
                                        <span>
                                            {t('reviewsCount', { count: product.reviewCount })}
                                        </span>
                                    </a>
                                )}

                                <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                    <span className="font-display text-4xl font-bold">
                                        {formatPrice(product.price, locale)}
                                    </span>
                                    {hasDiscount && (
                                        <>
                                            <s className="text-lg text-muted">
                                                {formatPrice(compareAt, locale)}
                                            </s>
                                            <span className="rounded-full bg-brand px-3 py-0.5 text-sm font-bold text-on-brand">
                                                {t('discountBadge', { percent: discount })}
                                            </span>
                                        </>
                                    )}
                                </p>

                                <p className="mt-4 leading-relaxed text-fg/90">
                                    {localize(product.summary, locale)}
                                </p>

                                <PurchasePanel product={product} />
                            </div>

                            <ProductAccordion
                                product={product}
                                locale={locale}
                                returnDays={returnDays}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {artisan && (
                <ArtisanStory
                    artisan={artisan}
                    otherProducts={artisanProducts}
                    crafts={crafts}
                    locale={locale}
                />
            )}

            {reviews && <Reviews reviews={reviews} locale={locale} />}

            {related.length > 0 && (
                <div className="px-4 pb-24 sm:px-8">
                    <div className="mx-auto max-w-6xl">
                        <RecommendedProducts
                            title={t('relatedTitle')}
                            products={related}
                            locale={locale}
                            crafts={crafts}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
