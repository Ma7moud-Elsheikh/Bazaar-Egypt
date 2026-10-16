import { ProductCard } from '@/components/shop/product-card';
import { Reveal } from '@/components/ui/reveal';
import { Tabs, type TabItem } from '@/components/ui/tabs';
import type { Locale } from '@/i18n/routing';
import type { Craft, Product } from '@/lib/schemas/catalog';
import { localize } from '@/lib/utils/format';
import { getTranslations } from 'next-intl/server';

type Props = {
    locale: Locale;
    crafts: Craft[];
    bestsellers: Product[];
    newest: Product[];
    gifts: Product[];
};

export async function ProductShelves({ locale, crafts, bestsellers, newest, gifts }: Props) {
    const t = await getTranslations('Home');
    const craftName = new Map(crafts.map((c) => [c.id, localize(c.name, locale)]));

    const grid = (products: Product[]) => (
        <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {products.map((product, index) => (
                <Reveal as="li" key={product.id} delay={Math.min(index, 6) * 60}>
                    <ProductCard
                        product={product}
                        locale={locale}
                        craftName={craftName.get(product.craftId)}
                    />
                </Reveal>
            ))}
        </ul>
    );

    const tabs: TabItem[] = [];

    if (bestsellers.length > 0) {
        tabs.push({
            id: 'bestsellers',
            label: t('tabBestsellers'),
            panel: grid(bestsellers),
            cta: { href: '/shop?sort=popular', label: t('viewAll') }
        });
    }
    if (newest.length > 0) {
        tabs.push({
            id: 'new',
            label: t('tabNew'),
            panel: grid(newest),
            cta: { href: '/shop?sort=newest', label: t('viewAll') }
        });
    }
    if (gifts.length > 0) {
        tabs.push({
            id: 'gifts',
            label: t('tabGifts'),
            panel: grid(gifts),
            cta: { href: '#gifts', label: t('seeGiftGuide') }
        });
    }

    if (tabs.length === 0) return null;

    return (
        <section aria-labelledby="shelves-title" className="px-4 py-16 sm:px-8 sm:py-24">
            <div className="mx-auto max-w-6xl">
                <Reveal>
                    <h2 id="shelves-title" className="font-display text-3xl font-bold sm:text-4xl">
                        {t('shelvesTitle')}
                    </h2>
                    <p className="mt-2 max-w-2xl text-muted">{t('shelvesSubtitle')}</p>
                </Reveal>

                <div className="mt-8">
                    <Tabs tabs={tabs} label={t('shelvesLabel')} />
                </div>
            </div>
        </section>
    );
}
