import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { GIFT_OCCASIONS } from '@/lib/home-config';
import type { Craft } from '@/lib/schemas/catalog';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

type Props = { crafts: Craft[]; locale: Locale };

export async function GiftGuide({ crafts }: Props) {
    const t = await getTranslations('Home');

    const cards = GIFT_OCCASIONS.flatMap((occasion) => {
        const craft = crafts.find((c) => c.slug === occasion.craft);
        return craft ? [{ occasion, craft }] : [];
    });

    if (cards.length === 0) return null;

    return (
        <section
            id="gifts"
            aria-labelledby="gifts-title"
            className="scroll-mt-28 px-4 py-16 sm:px-8 sm:py-24"
        >
            <div className="mx-auto max-w-6xl">
                <p className="text-sm font-semibold text-accent">{t('giftsEyebrow')}</p>
                <h2 id="gifts-title" className="mt-2 font-display text-3xl font-bold sm:text-4xl">
                    {t('giftsTitle')}
                </h2>
                <p className="mt-2 max-w-2xl text-muted">{t('giftsSubtitle')}</p>

                <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                    {cards.map(({ occasion, craft }) => (
                        <li key={occasion.key}>
                            <Link
                                href={`/shop?craft=${craft.slug}&sort=popular`}
                                className="group relative block aspect-[4/5] overflow-hidden rounded-card shadow-[0_10px_30px_rgb(43_29_20/0.12)]"
                            >
                                <Image
                                    src={craft.cover.src}
                                    alt=""
                                    fill
                                    sizes="(min-width: 1024px) 25vw, 50vw"
                                    className="object-cover transition duration-700 ease-craft group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                                />
                                <div
                                    data-theme="dark"
                                    className="glass-smoke-strong absolute inset-x-2 bottom-2 rounded-2xl p-3 sm:inset-x-3 sm:bottom-3 sm:p-4"
                                >
                                    <h3 className="font-display text-base font-bold sm:text-lg">
                                        {t(`occasions.${occasion.key}.title`)}
                                    </h3>
                                    <p className="mt-1 text-xs text-fg/80 sm:text-sm">
                                        {t(`occasions.${occasion.key}.text`)}
                                    </p>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
