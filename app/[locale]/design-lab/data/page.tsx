import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import type { Locale } from '@/i18n/routing';
import { api } from '@/lib/api';
import { formatPrice, localize } from '@/lib/utils/format';
import { setRequestLocale } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export default async function DataTestPage({ params }: Props) {
    const { locale: rawLocale } = await params;
    setRequestLocale(rawLocale);
    const locale = rawLocale as Locale;

    const searchTerm = locale === 'ar' ? 'نحاس' : 'copper';

    const [crafts, artisans, newest, search] = await Promise.all([
        api.getCrafts(),
        api.getArtisans(),
        api.getProducts({ pageSize: 6, sort: 'newest' }),
        api.getProducts({ q: searchTerm })
    ]);

    const craftName = new Map(crafts.map((c) => [c.id, localize(c.name, locale)]));

    const stats = [
        { label: locale === 'ar' ? 'الحرف' : 'Crafts', value: crafts.length },
        { label: locale === 'ar' ? 'الحرفيين' : 'Artisans', value: artisans.length },
        { label: locale === 'ar' ? 'المنتجات' : 'Products', value: newest.total },
        {
            label: `${locale === 'ar' ? 'بحث' : 'Search'}: ${searchTerm}`,
            value: search.total
        }
    ];

    return (
        <div className="mx-auto max-w-5xl px-6 pt-28 pb-12">
            <h1 className="text-3xl font-bold">Data layer test</h1>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {stats.map((s) => (
                    <div key={s.label} className="rounded-card border border-line p-5">
                        <p className="text-sm text-muted">{s.label}</p>
                        <p className="mt-1 text-3xl font-semibold">{s.value}</p>
                    </div>
                ))}
            </div>

            <ul className="mt-10 divide-y divide-line rounded-card border border-line">
                {newest.items.map((p) => (
                    <li
                        key={p.id}
                        className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                    >
                        <div>
                            <p className="font-semibold">{localize(p.name, locale)}</p>
                            <p className="text-sm text-muted">
                                {craftName.get(p.craftId)} · {localize(p.governorate.name, locale)}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="font-semibold">{formatPrice(p.price, locale)}</span>
                            <AddToCartButton product={p} />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
