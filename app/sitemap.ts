import { routing } from '@/i18n/routing';
import { api } from '@/lib/api';
import type { Product } from '@/lib/schemas/catalog';
import { SITE_URL } from '@/lib/site';
import type { MetadataRoute } from 'next';

// الـ sitemap بيتجدّد كل ساعة لو الـ API حقيقي
export const revalidate = 3600;

const STATIC_PAGES = [
    { path: '', priority: 1 },
    { path: '/shop', priority: 0.9 },
    { path: '/crafts', priority: 0.8 },
    { path: '/artisans', priority: 0.7 },
    { path: '/about', priority: 0.5 },
    { path: '/faq', priority: 0.5 },
    { path: '/contact', priority: 0.5 },
    { path: '/shipping', priority: 0.4 },
    { path: '/returns', priority: 0.4 },
    { path: '/privacy', priority: 0.3 },
    { path: '/terms', priority: 0.3 }
] as const;

async function loadAllProducts(): Promise<Product[]> {
    const all: Product[] = [];
    let page = 1;
    let totalPages = 1;

    do {
        const result = await api.getProducts({ pageSize: 48, page, sort: 'newest' });
        all.push(...result.items);
        totalPages = result.totalPages;
        page += 1;
    } while (page <= totalPages && page <= 200);

    return all;
}

/** كل لغة ليها entry، وكل entry فيه البدائل (hreflang) */
function entries(path: string, priority: number, lastModified?: Date): MetadataRoute.Sitemap {
    const languages = {
        ...Object.fromEntries(
            routing.locales.map((locale) => [locale, `${SITE_URL}/${locale}${path}`])
        ),
        'x-default': `${SITE_URL}/${routing.defaultLocale}${path}`
    };

    return routing.locales.map((locale) => ({
        url: `${SITE_URL}/${locale}${path}`,
        ...(lastModified ? { lastModified } : {}),
        priority,
        alternates: { languages }
    }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [crafts, artisans, products] = await Promise.all([
        api.getCrafts(),
        api.getArtisans(),
        loadAllProducts()
    ]);

    return [
        ...STATIC_PAGES.flatMap((page) => entries(page.path, page.priority)),
        ...crafts.flatMap((craft) => entries(`/crafts/${craft.slug}`, 0.8)),
        ...artisans.flatMap((artisan) => entries(`/artisans/${artisan.slug}`, 0.6)),
        ...products.flatMap((product) =>
            entries(`/shop/${product.slug}`, 0.8, new Date(product.createdAt))
        )
    ];
}
