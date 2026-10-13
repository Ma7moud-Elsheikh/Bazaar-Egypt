import { AmbientBackground } from '@/components/ui/ambient-background';
import { SearchIcon } from '@/components/ui/icons';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { Craft, Product } from '@/lib/schemas/catalog';
import { localize } from '@/lib/utils/format';
import { getTranslations } from 'next-intl/server';
import Form from 'next/form';
import Image from 'next/image';

type Props = { locale: Locale; crafts: Craft[]; collage: Product[] };

const COLLAGE_POSITIONS = [
    'end-6 top-0 w-56 rotate-3',
    'start-0 top-28 w-52 -rotate-6',
    'end-16 bottom-0 w-60 rotate-2'
];

export async function Hero({ locale, crafts, collage }: Props) {
    const t = await getTranslations('Home');
    const rawPopular: unknown = t.raw('popularList');
    const popular = Array.isArray(rawPopular) ? (rawPopular as string[]) : [];

    return (
        <section
            data-theme="dark"
            className="relative isolate overflow-hidden px-4 pt-32 pb-24 sm:px-8 lg:pt-40 lg:pb-32"
        >
            <AmbientBackground pattern />

            <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12">
                <div className="lg:col-span-7">
                    <p className="text-sm font-semibold text-accent">{t('heroEyebrow')}</p>
                    <h1 className="mt-3 font-display text-5xl font-bold sm:text-6xl lg:text-7xl">
                        {t('heroTitle')}
                    </h1>
                    <p className="mt-5 max-w-xl text-lg text-fg/85">{t('heroSubtitle')}</p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            href="/shop"
                            className="btn-primary inline-flex h-12 items-center justify-center px-8 text-sm font-semibold"
                        >
                            {t('ctaShop')}
                        </Link>
                        <a
                            href="#gifts"
                            className="btn-glass inline-flex h-12 items-center justify-center px-8 text-sm font-semibold"
                        >
                            {t('ctaGifts')}
                        </a>
                    </div>

                    <Form
                        action={`/${locale}/search`}
                        role="search"
                        className="glass mt-8 flex max-w-xl items-center gap-2 rounded-full p-2 ps-5 focus-within:ring-2 focus-within:ring-accent"
                    >
                        <SearchIcon className="size-5 shrink-0 text-fg/70" />
                        <label htmlFor="hero-q" className="sr-only">
                            {t('searchLabel')}
                        </label>
                        <input
                            id="hero-q"
                            name="q"
                            type="search"
                            autoComplete="off"
                            placeholder={t('searchPlaceholder')}
                            className="h-12 min-w-0 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-fg/60"
                        />
                        <button
                            type="submit"
                            className="btn-primary inline-flex h-12 shrink-0 items-center px-6 text-sm font-semibold"
                        >
                            {t('searchCta')}
                        </button>
                    </Form>

                    {popular.length > 0 && (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <span className="text-sm text-fg/75">{t('popularLabel')}</span>
                            {popular.map((term) => (
                                <Link
                                    key={term}
                                    href={`/search?q=${encodeURIComponent(term)}`}
                                    className="btn-glass inline-flex h-11 items-center px-4 text-sm font-medium"
                                >
                                    {term}
                                </Link>
                            ))}
                        </div>
                    )}

                    {crafts.length > 0 && (
                        <div className="mt-10">
                            <p className="mb-3 text-sm font-semibold text-fg/80">
                                {t('craftsLabel')}
                            </p>
                            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                                {crafts.map((craft) => (
                                    <li key={craft.id}>
                                        <Link
                                            href={`/shop?craft=${craft.slug}`}
                                            className="glass flex h-full flex-col items-center gap-2 rounded-2xl p-3 text-center transition duration-300 ease-craft hover:-translate-y-0.5"
                                        >
                                            <Image
                                                src={craft.cover.src}
                                                alt=""
                                                width={56}
                                                height={56}
                                                className="size-14 rounded-full object-cover"
                                            />
                                            <span className="text-xs font-semibold sm:text-sm">
                                                {localize(craft.name, locale)}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {collage.length >= 3 && (
                    <div aria-hidden className="relative hidden h-[34rem] lg:col-span-5 lg:block">
                        {collage.slice(0, 3).map((product, index) => (
                            <div
                                key={product.id}
                                className={`glass absolute rounded-3xl p-2 ${COLLAGE_POSITIONS[index]}`}
                            >
                                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                                    <Image
                                        src={product.images[0].src}
                                        alt=""
                                        fill
                                        sizes="240px"
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
