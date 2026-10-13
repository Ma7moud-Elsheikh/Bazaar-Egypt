import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { Craft } from '@/lib/schemas/catalog';
import { whatsappLink } from '@/lib/site';
import { localize } from '@/lib/utils/format';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

type Props = {
    query: string;
    suggestions: string[];
    crafts: Craft[];
    locale: Locale;
};

export async function NoResults({ query, suggestions, crafts, locale }: Props) {
    const t = await getTranslations('Search');
    const whatsapp = whatsappLink(t('whatsappMessage', { q: query }));

    return (
        <div className="mt-6 space-y-6">
            <div className="glass rounded-[1.75rem] p-6 sm:p-8">
                <h2 className="font-display text-2xl font-bold sm:text-3xl">
                    {t('noResultsTitle', { q: query })}
                </h2>
                <p className="mt-2 text-muted">{t('noResultsText')}</p>

                {suggestions.length > 0 && (
                    <div className="mt-6">
                        <p className="text-sm font-semibold">{t('didYouMean')}</p>
                        <ul className="mt-3 flex flex-wrap gap-2">
                            {suggestions.map((suggestion) => (
                                <li key={suggestion}>
                                    <Link
                                        href={`/search?q=${encodeURIComponent(suggestion)}`}
                                        className="btn-glass inline-flex h-11 items-center px-5 text-sm font-semibold"
                                    >
                                        {suggestion}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {crafts.length > 0 && (
                <div>
                    <p className="text-sm font-semibold">{t('browseCrafts')}</p>
                    <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {crafts.map((craft) => (
                            <li key={craft.id}>
                                <Link
                                    href={`/shop?craft=${craft.slug}`}
                                    className="glass flex items-center gap-3 rounded-2xl p-2 pe-4 transition duration-300 ease-craft hover:-translate-y-0.5"
                                >
                                    <Image
                                        src={craft.cover.src}
                                        alt=""
                                        width={48}
                                        height={48}
                                        className="size-12 shrink-0 rounded-xl object-cover"
                                    />
                                    <span className="font-semibold">
                                        {localize(craft.name, locale)}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {whatsapp && (
                <div className="glass flex flex-col gap-4 rounded-[1.75rem] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                    <div>
                        <h3 className="font-display text-xl font-bold">{t('customTitle')}</h3>
                        <p className="mt-1 text-muted">{t('customText')}</p>
                    </div>
                    <a
                        href={whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex h-12 shrink-0 items-center justify-center px-7 text-sm font-semibold"
                    >
                        {t('customCta')}
                    </a>
                </div>
            )}
        </div>
    );
}
