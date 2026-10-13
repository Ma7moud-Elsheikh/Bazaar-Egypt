import { NoResults } from '@/components/search/no-results';
import { ProductCard } from '@/components/shop/product-card';
import { RecommendedProducts } from '@/components/shop/recommended-products';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { SearchIcon } from '@/components/ui/icons';
import { Pagination } from '@/components/ui/pagination';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { api } from '@/lib/api';
import { buildAlternates } from '@/lib/seo';
import { localize } from '@/lib/utils/format';
import { SEARCH_SORT_OPTIONS, buildSearchQuery, parseSearchParams } from '@/lib/utils/search-url';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Form from 'next/form';
import { notFound } from 'next/navigation';

const PAGE_SIZE = 12;

type Props = {
    params: Promise<{ locale: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const inputClass =
    'h-12 w-full rounded-full border border-line bg-surface/70 px-5 text-sm text-fg placeholder:text-muted transition';

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { locale: rawLocale } = await params;
    const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;
    const t = await getTranslations({ locale, namespace: 'Search' });
    const { q } = parseSearchParams(await searchParams);

    return {
        title: q ? t('metaTitle', { q }) : t('metaTitleEmpty'),
        // صفحات البحث الداخلية ما بتتفهرسش
        robots: { index: false, follow: true },
        alternates: buildAlternates(locale, '/search')
    };
}

export default async function SearchPage({ params, searchParams }: Props) {
    const { locale: rawLocale } = await params;
    setRequestLocale(rawLocale);
    const locale = rawLocale as Locale;

    const t = await getTranslations('Search');
    const filters = parseSearchParams(await searchParams);
    const hasQuery = filters.q.length > 0;

    const [crafts, result, idleRecommended] = await Promise.all([
        api.getCrafts(),
        hasQuery
            ? api.search({
                  q: filters.q,
                  craft: filters.craft,
                  sort: filters.sort,
                  page: filters.page,
                  pageSize: PAGE_SIZE
              })
            : Promise.resolve(null),
        hasQuery ? Promise.resolve([]) : api.getRecommended({ limit: 8 })
    ]);

    if (result && result.items.length === 0 && result.total > 0) notFound();

    const hasResults = result !== null && result.total > 0;
    const noMatchesAtAll = result !== null && result.total === 0 && !filters.craft;
    const emptyForCraft = result !== null && result.total === 0 && Boolean(filters.craft);
    const isLastPage = result ? result.page >= result.totalPages : true;
    const formKey = `${filters.q}|${filters.sort}`;

    return (
        <>
            <section className="relative isolate overflow-hidden px-4 pt-28 pb-10 sm:px-8">
                <AmbientBackground tone="light" />

                <div className="mx-auto max-w-6xl">
                    <p className="text-sm text-accent">{t('eyebrow')}</p>
                    <h1 className="mt-2 font-display text-3xl font-bold sm:text-5xl">
                        {hasQuery ? t('title', { q: filters.q }) : t('titleEmpty')}
                    </h1>
                    {!hasQuery && <p className="mt-3 max-w-2xl text-muted">{t('subtitleEmpty')}</p>}

                    <Form
                        key={formKey}
                        action={`/${locale}/search`}
                        role="search"
                        className="glass mt-8 rounded-[1.75rem] p-4 sm:p-5"
                    >
                        <label htmlFor="search-q" className="sr-only">
                            {t('inputLabel')}
                        </label>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <SearchIcon className="pointer-events-none absolute inset-y-0 start-4 my-auto size-5 text-muted" />
                                <input
                                    id="search-q"
                                    name="q"
                                    type="search"
                                    defaultValue={filters.q}
                                    placeholder={t('placeholder')}
                                    className={`${inputClass} ps-12`}
                                />
                            </div>

                            {hasResults && (
                                <div className="sm:w-56">
                                    <label htmlFor="search-sort" className="sr-only">
                                        {t('sortLabel')}
                                    </label>
                                    <select
                                        id="search-sort"
                                        name="sort"
                                        defaultValue={filters.sort}
                                        className={inputClass}
                                    >
                                        {SEARCH_SORT_OPTIONS.map((option) => (
                                            <option key={option} value={option}>
                                                {t(`sort.${option}`)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn-primary inline-flex h-12 items-center justify-center px-8 text-sm font-semibold"
                            >
                                {t('submit')}
                            </button>
                        </div>
                    </Form>

                    {result?.correctedQuery && (
                        <p
                            role="status"
                            className="glass mt-4 rounded-2xl px-4 py-3 text-sm font-medium"
                        >
                            {t('correctedNotice', {
                                corrected: result.correctedQuery,
                                original: filters.q
                            })}
                        </p>
                    )}
                </div>
            </section>

            <section aria-labelledby="results-title" className="px-4 pb-24 pt-16 sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <h2 id="results-title" className="sr-only">
                        {t('listLabel')}
                    </h2>

                    {/* بدون بحث: بداية مقترحة */}
                    {!hasQuery && (
                        <>
                            <nav aria-label={t('browseCrafts')} className="flex flex-wrap gap-2">
                                {crafts.map((craft) => (
                                    <Link
                                        key={craft.id}
                                        href={`/shop?craft=${craft.slug}`}
                                        className="btn-glass inline-flex h-11 items-center px-5 text-sm font-semibold"
                                    >
                                        {localize(craft.name, locale)}
                                    </Link>
                                ))}
                            </nav>
                            <RecommendedProducts
                                title={t('idleRecommended')}
                                products={idleRecommended}
                                locale={locale}
                                crafts={crafts}
                            />
                        </>
                    )}

                    {/* نتايج */}
                    {result && hasResults && (
                        <>
                            {(result.relatedCrafts.length > 1 || filters.craft) && (
                                <nav
                                    aria-label={t('refineByCraft')}
                                    className="flex flex-wrap gap-2"
                                >
                                    <Link
                                        href={`/search${buildSearchQuery(filters, { craft: undefined, page: 1 })}`}
                                        aria-current={filters.craft ? undefined : 'true'}
                                        className={`inline-flex h-11 items-center px-5 text-sm font-semibold ${
                                            filters.craft ? 'btn-glass' : 'btn-primary'
                                        }`}
                                    >
                                        {t('allResults')}
                                    </Link>
                                    {result.relatedCrafts.map((craft) => {
                                        const active = filters.craft === craft.slug;
                                        return (
                                            <Link
                                                key={craft.id}
                                                href={`/search${buildSearchQuery(filters, { craft: craft.slug, page: 1 })}`}
                                                aria-current={active ? 'true' : undefined}
                                                className={`inline-flex h-11 items-center px-5 text-sm font-semibold ${
                                                    active ? 'btn-primary' : 'btn-glass'
                                                }`}
                                            >
                                                {localize(craft.name, locale)}
                                            </Link>
                                        );
                                    })}
                                </nav>
                            )}

                            <p aria-live="polite" className="mt-6 text-sm text-muted">
                                {t('resultsCount', { count: result.total })}
                            </p>

                            <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                                {result.items.map((product, index) => (
                                    <li key={product.id}>
                                        <ProductCard
                                            product={product}
                                            locale={locale}
                                            eager={index < 4}
                                        />
                                    </li>
                                ))}
                            </ul>

                            <Pagination
                                page={result.page}
                                totalPages={result.totalPages}
                                getHref={(page) => `/search${buildSearchQuery(filters, { page })}`}
                            />

                            {isLastPage && (
                                <RecommendedProducts
                                    title={t('recommendedTitle')}
                                    products={result.recommended}
                                    locale={locale}
                                    crafts={crafts}
                                />
                            )}
                        </>
                    )}

                    {/* فلتر الحرفة ما رجّعش حاجة */}
                    {result && emptyForCraft && (
                        <>
                            <div className="glass mt-6 rounded-[1.75rem] p-6 sm:p-8">
                                <p className="font-display text-xl font-bold">
                                    {t('emptyForCraft')}
                                </p>
                                <Link
                                    href={`/search${buildSearchQuery(filters, { craft: undefined, page: 1 })}`}
                                    className="btn-primary mt-4 inline-flex h-11 items-center px-6 text-sm font-semibold"
                                >
                                    {t('allResults')}
                                </Link>
                            </div>
                            <RecommendedProducts
                                title={t('recommendedTitle')}
                                products={result.recommended}
                                locale={locale}
                                crafts={crafts}
                            />
                        </>
                    )}

                    {/* مفيش نتايج خالص */}
                    {result && noMatchesAtAll && (
                        <>
                            <NoResults
                                query={filters.q}
                                suggestions={result.suggestions}
                                crafts={result.relatedCrafts}
                                locale={locale}
                            />
                            <RecommendedProducts
                                title={t('noResultsRecommended')}
                                products={result.recommended}
                                locale={locale}
                                crafts={crafts}
                            />
                        </>
                    )}
                </div>
            </section>
        </>
    );
}
