import { ArtisanStories } from '@/components/home/artisan-stories';
import { FaqSupport } from '@/components/home/faq-support';
import { GiftGuide } from '@/components/home/gift-guide';
import { Governorates } from '@/components/home/governorates';
import { Hero } from '@/components/home/hero';
import { ProductShelves } from '@/components/home/product-shelves';
import { TrustStrip } from '@/components/home/trust-strip';
import { routing, type Locale } from '@/i18n/routing';
import { api } from '@/lib/api';
import { HOME_LIMITS } from '@/lib/home-config';
import { buildAlternates } from '@/lib/seo';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale: rawLocale } = await params;
    const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;

    // العنوان والوصف بيجوا من الـ layout
    return { alternates: buildAlternates(locale, '/') };
}

export default async function HomePage({ params }: Props) {
    const { locale: rawLocale } = await params;
    setRequestLocale(rawLocale);
    const locale = rawLocale as Locale;

    const [crafts, artisans, catalog, shipping] = await Promise.all([
        api.getCrafts(),
        api.getArtisans(),
        api.getProducts({ pageSize: 48, sort: 'popular' }),
        api.getShippingConfig()
    ]);

    // الأرفف الثلاثة بتتشتق من استدعاء واحد (مرتّب بالأكثر طلبًا)
    const popular = catalog.items;
    const bestsellers = [
        ...popular.filter((p) => p.badges.includes('bestseller')),
        ...popular.filter((p) => !p.badges.includes('bestseller'))
    ].slice(0, HOME_LIMITS.shelf);
    const newest = [...popular]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, HOME_LIMITS.shelf);
    const gifts = popular.filter((p) => p.badges.includes('giftable')).slice(0, HOME_LIMITS.shelf);

    return (
        <>
            <Hero locale={locale} crafts={crafts} collage={bestsellers.slice(0, 3)} />
            <TrustStrip returnDays={shipping.returnDays} />
            <ProductShelves
                locale={locale}
                crafts={crafts}
                bestsellers={bestsellers}
                newest={newest}
                gifts={gifts}
            />
            <ArtisanStories artisans={artisans} crafts={crafts} locale={locale} />
            <GiftGuide crafts={crafts} locale={locale} />
            <Governorates products={popular} locale={locale} />
            <FaqSupport returnDays={shipping.returnDays} />
        </>
    );
}
