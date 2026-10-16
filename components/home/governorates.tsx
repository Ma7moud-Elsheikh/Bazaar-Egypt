import { Reveal } from '@/components/ui/reveal';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { HOME_LIMITS } from '@/lib/home-config';
import type { LocalizedText, Product } from '@/lib/schemas/catalog';
import { localize } from '@/lib/utils/format';
import { getTranslations } from 'next-intl/server';

type Props = { products: Product[]; locale: Locale };

export async function Governorates({ products, locale }: Props) {
    const t = await getTranslations('Home');

    const counts = new Map<string, { name: LocalizedText; count: number }>();
    for (const product of products) {
        const entry = counts.get(product.governorate.slug);
        if (entry) entry.count += 1;
        else counts.set(product.governorate.slug, { name: product.governorate.name, count: 1 });
    }

    const list = [...counts]
        .map(([slug, value]) => ({ slug, ...value }))
        .sort(
            (a, b) =>
                b.count - a.count ||
                localize(a.name, locale).localeCompare(localize(b.name, locale), locale)
        )
        .slice(0, HOME_LIMITS.governorates);

    if (list.length === 0) return null;

    return (
        <section
            aria-labelledby="gov-title"
            className="bg-surface-2/50 px-4 py-16 sm:px-8 sm:py-20"
        >
            <div className="mx-auto max-w-6xl">
                <Reveal>
                    <p className="text-sm font-semibold text-accent">{t('govEyebrow')}</p>
                    <h2 id="gov-title" className="mt-2 font-display text-3xl font-bold sm:text-4xl">
                        {t('govTitle')}
                    </h2>
                    <p className="mt-2 max-w-2xl text-muted">{t('govSubtitle')}</p>
                </Reveal>

                <ul className="mt-8 flex flex-wrap gap-3">
                    {list.map((governorate) => (
                        <li key={governorate.slug}>
                            <Link
                                href={`/shop?governorate=${governorate.slug}`}
                                className="btn-glass inline-flex h-11 items-center gap-2 px-5 text-sm font-semibold"
                            >
                                {localize(governorate.name, locale)}
                                <span className="text-xs font-normal text-muted">
                                    ({governorate.count})
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
