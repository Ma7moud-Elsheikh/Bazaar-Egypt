import { IS_PRODUCTION, SITE_URL } from '@/lib/site';
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    // أي بيئة غير الإنتاج (تطوير أو preview): ممنوع الفهرسة بالكامل
    if (!IS_PRODUCTION) {
        return { rules: { userAgent: '*', disallow: '/' } };
    }

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/*/cart',
                    '/*/checkout',
                    '/*/order/',
                    '/*/wishlist',
                    '/*/search'
                ]
            }
        ],
        sitemap: `${SITE_URL}/sitemap.xml`
    };
}
