import { AmbientBackground } from '@/components/ui/ambient-background';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { HOME_LIMITS } from '@/lib/home-config';
import type { Artisan, Craft } from '@/lib/schemas/catalog';
import { localize } from '@/lib/utils/format';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

type Props = { artisans: Artisan[]; crafts: Craft[]; locale: Locale };

/** أكتر الحرفيين خبرة، بحرفة مختلفة لكل واحد */
function pickArtisans(list: Artisan[], count: number): Artisan[] {
    const sorted = [...list].sort((a, b) => b.yearsOfExperience - a.yearsOfExperience);
    const seen = new Set<string>();
    const picked: Artisan[] = [];

    for (const artisan of sorted) {
        if (seen.has(artisan.craftId)) continue;
        seen.add(artisan.craftId);
        picked.push(artisan);
        if (picked.length === count) break;
    }

    return picked.length === count ? picked : sorted.slice(0, count);
}

export async function ArtisanStories({ artisans, crafts, locale }: Props) {
    const t = await getTranslations('Home');
    const craftName = new Map(crafts.map((c) => [c.id, localize(c.name, locale)]));
    const picked = pickArtisans(artisans, HOME_LIMITS.artisans);

    if (picked.length === 0) return null;

    return (
        <section
            data-theme="dark"
            aria-labelledby="artisans-title"
            className="relative isolate overflow-hidden px-4 py-16 sm:px-8 sm:py-24"
        >
            <AmbientBackground pattern />

            <div className="mx-auto max-w-6xl">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-accent">{t('artisansEyebrow')}</p>
                        <h2
                            id="artisans-title"
                            className="mt-2 font-display text-3xl font-bold sm:text-4xl"
                        >
                            {t('artisansTitle')}
                        </h2>
                        <p className="mt-2 max-w-xl text-fg/80">{t('artisansSubtitle')}</p>
                    </div>
                    <Link
                        href="/artisans"
                        className="btn-glass inline-flex h-11 items-center px-6 text-sm font-semibold"
                    >
                        {t('allArtisans')}
                    </Link>
                </div>

                <ul className="mt-10 grid gap-5 md:grid-cols-3">
                    {picked.map((artisan) => {
                        const name = localize(artisan.name, locale);

                        return (
                            <li key={artisan.id}>
                                <article className="glass flex h-full flex-col rounded-[1.75rem] p-3">
                                    <div className="relative aspect-square overflow-hidden rounded-[1.25rem]">
                                        <Image
                                            src={artisan.portrait.src}
                                            alt={localize(artisan.portrait.alt, locale)}
                                            fill
                                            sizes="(min-width: 768px) 30vw, 100vw"
                                            className="object-cover"
                                        />
                                    </div>

                                    <div className="flex flex-1 flex-col p-4">
                                        <h3 className="font-display text-xl font-bold">{name}</h3>
                                        <p className="mt-1 text-sm text-accent">
                                            {t('artisanMeta', {
                                                craft: craftName.get(artisan.craftId) ?? '',
                                                governorate: localize(
                                                    artisan.governorate.name,
                                                    locale
                                                )
                                            })}
                                        </p>
                                        <p className="mt-3 line-clamp-3 text-sm text-fg/85">
                                            {localize(artisan.bio, locale)}
                                        </p>

                                        <div className="mt-auto pt-4">
                                            <Link
                                                href={`/artisans/${artisan.slug}`}
                                                className="btn-glass inline-flex h-11 items-center justify-center px-6 text-sm font-semibold"
                                            >
                                                {t('artisanCta')}
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
