import { ProductCard } from '@/components/shop/product-card';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { Artisan, Craft, Product } from '@/lib/schemas/catalog';
import { localize } from '@/lib/utils/format';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

type Props = {
    artisan: Artisan;
    otherProducts: Product[];
    crafts: Craft[];
    locale: Locale;
};

export async function ArtisanStory({ artisan, otherProducts, crafts, locale }: Props) {
    const t = await getTranslations('ProductPage');
    const name = localize(artisan.name, locale);
    const craftName = new Map(crafts.map((c) => [c.id, localize(c.name, locale)]));

    return (
        <section
            data-theme="dark"
            aria-labelledby="artisan-title"
            className="relative isolate overflow-hidden px-4 py-16 sm:px-8 sm:py-24"
        >
            <AmbientBackground pattern />

            <div className="mx-auto max-w-6xl">
                <div className="grid items-center gap-10 lg:grid-cols-12">
                    <div className="lg:col-span-4">
                        <div className="glass mx-auto w-full max-w-sm rounded-[2rem] p-2">
                            <div className="relative aspect-square overflow-hidden rounded-[1.5rem]">
                                <Image
                                    src={artisan.portrait.src}
                                    alt={localize(artisan.portrait.alt, locale)}
                                    fill
                                    sizes="(min-width: 1024px) 30vw, 80vw"
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8">
                        <p className="text-sm font-semibold text-accent">{t('artisanEyebrow')}</p>
                        <h2
                            id="artisan-title"
                            className="mt-2 font-display text-3xl font-bold sm:text-4xl"
                        >
                            {t('artisanTitle', { name })}
                        </h2>

                        <ul className="mt-4 flex flex-wrap gap-2 text-sm">
                            <li className="glass rounded-full px-4 py-1.5">
                                {t('artisanFrom', {
                                    governorate: localize(artisan.governorate.name, locale)
                                })}
                            </li>
                            <li className="glass rounded-full px-4 py-1.5">
                                {t('artisanExperience', { years: artisan.yearsOfExperience })}
                            </li>
                        </ul>

                        <p className="mt-5 max-w-2xl text-fg/85">{localize(artisan.bio, locale)}</p>

                        <blockquote
                            className={`mt-6 max-w-2xl border-s-2 border-accent ps-5 font-accent text-2xl leading-relaxed text-fg ${
                                locale === 'en' ? 'italic' : ''
                            }`}
                        >
                            {localize(artisan.story, locale)}
                        </blockquote>

                        <Link
                            href={`/artisans/${artisan.slug}`}
                            className="btn-glass mt-8 inline-flex h-12 items-center justify-center px-7 text-sm font-semibold"
                        >
                            {t('artisanCta', { name })}
                        </Link>
                    </div>
                </div>

                {otherProducts.length > 0 && (
                    <div className="mt-16">
                        <h3 className="font-display text-2xl font-bold">
                            {t('moreFromArtisan', { name })}
                        </h3>
                        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                            {otherProducts.map((product) => (
                                <li key={product.id}>
                                    <ProductCard
                                        product={product}
                                        locale={locale}
                                        craftName={craftName.get(product.craftId)}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </section>
    );
}
