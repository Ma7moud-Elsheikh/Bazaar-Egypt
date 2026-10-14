import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { Craft } from '@/lib/schemas/catalog';
import { localize } from '@/lib/utils/format';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

type Props = {
    craft: Craft;
    productsCount: number;
    artisansCount: number;
    locale: Locale;
};

export async function CraftCard({ craft, productsCount, artisansCount, locale }: Props) {
    const t = await getTranslations('Crafts');
    const name = localize(craft.name, locale);

    return (
        <Link
            href={`/crafts/${craft.slug}`}
            className="group relative block aspect-[4/5] overflow-hidden rounded-card shadow-[0_10px_30px_rgb(43_29_20/0.12)]"
        >
            <Image
                src={craft.cover.src}
                alt={localize(craft.cover.alt, locale)}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-700 ease-craft group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <div
                data-theme="dark"
                className="glass-smoke-strong absolute inset-x-2 bottom-2 rounded-2xl p-3 sm:inset-x-3 sm:bottom-3 sm:p-4"
            >
                <h2 className="font-display text-base font-bold sm:text-lg">{name}</h2>
                <p className="mt-1 text-xs text-fg/80 sm:text-sm">
                    {localize(craft.tagline, locale)}
                </p>
                <p className="mt-2 text-xs text-fg/70">
                    {t('productsCount', { count: productsCount })}
                    {' · '}
                    {t('artisansCount', { count: artisansCount })}
                </p>
            </div>
        </Link>
    );
}
