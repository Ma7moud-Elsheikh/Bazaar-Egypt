import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { Artisan } from '@/lib/schemas/catalog';
import { localize } from '@/lib/utils/format';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

type Props = {
    artisan: Artisan;
    craftName: string;
    locale: Locale;
};

export async function ArtisanCard({ artisan, craftName, locale }: Props) {
    const t = await getTranslations('Artisans');
    const name = localize(artisan.name, locale);

    return (
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
                    {t('meta', {
                        craft: craftName,
                        governorate: localize(artisan.governorate.name, locale)
                    })}
                </p>
                <p className="mt-3 line-clamp-3 text-sm text-fg/85">{localize(artisan.bio, locale)}</p>

                <div className="mt-auto pt-4">
                    <Link
                        href={`/artisans/${artisan.slug}`}
                        className="btn-glass inline-flex h-11 items-center justify-center px-6 text-sm font-semibold"
                    >
                        {t('cta')}
                    </Link>
                </div>
            </div>
        </article>
    );
}
