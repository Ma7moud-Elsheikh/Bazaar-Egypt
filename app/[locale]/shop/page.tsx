import { JsonLd } from '@/components/seo/json-ld';
import { ProductCard } from '@/components/shop/product-card';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { SearchIcon } from '@/components/ui/icons';
import { Pagination } from '@/components/ui/pagination';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { api } from '@/lib/api';
import { buildAlternates } from '@/lib/seo';
import { SITE_URL } from '@/lib/site';
import { localize } from '@/lib/utils/format';
import {
    SORT_OPTIONS,
    buildShopQuery,
    isFiltered,
    parseShopSearchParams
} from '@/lib/utils/shop-url';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Form from 'next/form';
import { notFound } from 'next/navigation';

// للتجربة مع 6 منتجات: غيّره مؤقتًا لـ 2 عشان تشوف الصفحات
const PAGE_SIZE = 12;

type Props = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const inputClass =
    'h-11 w-full rounded-full border border-line bg-surface/70 px-4 text-sm text-fg placeholder:text-muted transition';

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { locale: rawLocale } = await params;
    const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;
    const t = await getTranslations({ locale, namespace: 'Shop' });
    const filters = parseShopSearchParams(await searchParams);

    return {
        title: filters.page > 1 ? `${t('metaTitle')} (${filters.page})` : t('metaTitle'),
        description: t('metaDescription'),
        alternates: buildAlternates(
            locale,
            '/shop',
            filters.page > 1 ? `?page=${filters.page}` : ''
        ),
        // صفحات الفلاتر والترتيب مش بتتفهرس، بس الروابط جواها بتتتبّع
        robots: isFiltered(filters) ? { index: false, follow: true } : undefined
    };
}

export default async function ShopPage({ params, searchParams }: Props) {
    const { locale: rawLocale } = await params;
    setRequestLocale(rawLocale);
    const locale = rawLocale as Locale;

    const t = await getTranslations('Shop');
    const tn = await getTranslations('Nav');
    const filters = parseShopSearchParams(await searchParams);

    const [crafts, artisans, result] = await Promise.all([
        api.getCrafts(),
        api.getArtisans(),
        api.getProducts({
            q: filters.q,
            craft: filters.craft,
            governorate: filters.governorate,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            sort: filters.sort,
            page: filters.page,
            pageSize: PAGE_SIZE
        })
    ]);

    if (result.items.length === 0 && result.total > 0) notFound();

    const craftName = new Map(crafts.map((c) => [c.id, localize(c.name, locale)]));
    const governorates = [
        ...new Map(artisans.map((a) => [a.governorate.slug, a.governorate])).values()
    ].sort((a, b) => localize(a.name, locale).localeCompare(localize(b.name, locale), locale));

    const hasFilters = isFiltered(filters);
    const formKey = buildShopQuery(filters);
    const getPageHref = (page: number) => `/shop${buildShopQuery(filters, { page })}`;

    const itemListJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: result.items.map((product, index) => ({
            '@type': 'ListItem',
            position: (result.page - 1) * result.pageSize + index + 1,
            url: `${SITE_URL}/${locale}/shop/${product.slug}`,
            name: localize(product.name, locale)
        }))
    };

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
                name: tn('shop'),
                item: `${SITE_URL}/${locale}/shop`
            }
        ]
    };

    return (
        <>
            <JsonLd data={itemListJsonLd} />
            <JsonLd data={breadcrumbJsonLd} />

            <section className="relative isolate overflow-hidden px-4 pt-28 pb-10 sm:px-8">
                <AmbientBackground tone="light" />

                <div className="mx-auto max-w-6xl">
                    <p className="text-sm text-accent">{t('eyebrow')}</p>
                    <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
                        {t('title')}
                    </h1>
                    <p className="mt-3 max-w-2xl text-muted">{t('subtitle')}</p>

                    <Form
                        key={formKey}
                        action={`/${locale}/shop`}
                        className="glass mt-8 rounded-[1.75rem] p-4 sm:p-5"
                    >
                        {filters.craft && (
                            <input type="hidden" name="craft" value={filters.craft} />
                        )}

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
                            <div className="sm:col-span-2 lg:col-span-4">
                                <label
                                    htmlFor="shop-q"
                                    className="mb-1.5 block text-xs font-medium text-muted"
                                >
                                    {t('searchLabel')}
                                </label>
                                <div className="relative">
                                    <SearchIcon className="pointer-events-none absolute inset-y-0 start-4 my-auto size-5 text-muted" />
                                    <input
                                        id="shop-q"
                                        name="q"
                                        type="search"
                                        defaultValue={filters.q}
                                        placeholder={t('searchPlaceholder')}
                                        className={`${inputClass} ps-11`}
                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-2">
                                <label
                                    htmlFor="shop-governorate"
                                    className="mb-1.5 block text-xs font-medium text-muted"
                                >
                                    {t('governorateLabel')}
                                </label>
                                <select
                                    id="shop-governorate"
                                    name="governorate"
                                    defaultValue={filters.governorate ?? ''}
                                    className={inputClass}
                                >
                                    <option value="">{t('allGovernorates')}</option>
                                    {governorates.map((g) => (
                                        <option key={g.slug} value={g.slug}>
                                            {localize(g.name, locale)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="lg:col-span-2">
                                <label
                                    htmlFor="shop-sort"
                                    className="mb-1.5 block text-xs font-medium text-muted"
                                >
                                    {t('sortLabel')}
                                </label>
                                <select
                                    id="shop-sort"
                                    name="sort"
                                    defaultValue={filters.sort}
                                    className={inputClass}
                                >
                                    {SORT_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {t(`sort.${option}`)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="lg:col-span-2">
                                <label
                                    htmlFor="shop-min"
                                    className="mb-1.5 block text-xs font-medium text-muted"
                                >
                                    {t('minPrice')}
                                </label>
                                <input
                                    id="shop-min"
                                    name="minPrice"
                                    type="number"
                                    min={0}
                                    inputMode="numeric"
                                    defaultValue={filters.minPrice}
                                    className={inputClass}
                                />
                            </div>

                            <div className="lg:col-span-2">
                                <label
                                    htmlFor="shop-max"
                                    className="mb-1.5 block text-xs font-medium text-muted"
                                >
                                    {t('maxPrice')}
                                </label>
                                <input
                                    id="shop-max"
                                    name="maxPrice"
                                    type="number"
                                    min={0}
                                    inputMode="numeric"
                                    defaultValue={filters.maxPrice}
                                    className={inputClass}
                                />
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-3 sm:col-span-2 lg:col-span-12">
                                {hasFilters && (
                                    <Link
                                        href="/shop"
                                        className="btn-glass inline-flex h-11 items-center justify-center px-6 text-sm font-semibold"
                                    >
                                        {t('reset')}
                                    </Link>
                                )}
                                <button
                                    type="submit"
                                    className="btn-primary inline-flex h-11 items-center justify-center px-8 text-sm font-semibold"
                                >
                                    {t('apply')}
                                </button>
                            </div>
                        </div>
                    </Form>
                </div>
            </section>

            <section aria-labelledby="results-title" className="px-4 py-20 sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <h2 id="results-title" className="sr-only">
                        {t('listLabel')}
                    </h2>

                    <nav aria-label={t('crafts')} className="flex flex-wrap gap-2">
                        <Link
                            href={`/shop${buildShopQuery(filters, { craft: undefined, page: 1 })}`}
                            aria-current={filters.craft ? undefined : 'true'}
                            className={`inline-flex h-11 items-center justify-center px-5 text-sm font-semibold ${
                                filters.craft ? 'btn-glass' : 'btn-primary'
                            }`}
                        >
                            {t('allCrafts')}
                        </Link>
                        {crafts.map((craft) => {
                            const active = filters.craft === craft.slug;
                            return (
                                <Link
                                    key={craft.id}
                                    href={`/shop${buildShopQuery(filters, { craft: craft.slug, page: 1 })}`}
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
                        {t('resultsCount', { count: result.total })}
                    </p>

                    {result.items.length === 0 ? (
                        <div className="glass mt-6 rounded-[1.75rem] p-10 text-center">
                            <p className="font-display text-2xl font-bold">{t('emptyTitle')}</p>
                            <p className="mt-2 text-muted">{t('emptyText')}</p>
                            <Link
                                href="/shop"
                                className="btn-primary mt-6 inline-flex h-11 items-center justify-center px-6 text-sm font-semibold"
                            >
                                {t('reset')}
                            </Link>
                        </div>
                    ) : (
                        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                            {result.items.map((product, index) => (
                                <li key={product.id}>
                                    <ProductCard
                                        product={product}
                                        craftName={craftName.get(product.craftId) ?? ''}
                                        locale={locale}
                                        eager={index < 4}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}

                    <Pagination
                        page={result.page}
                        totalPages={result.totalPages}
                        getHref={getPageHref}
                    />
                </div>
            </section>
        </>
    );
}
