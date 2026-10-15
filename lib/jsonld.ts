import { SITE_URL } from '@/lib/site';

export type Crumb = {
    name: string;
    /** المسار من غير اللغة (مثال: "/about"). فاضي = مفيش رابط (الصفحة الحالية) */
    path?: string;
};

export function breadcrumbJsonLd(locale: string, crumbs: Crumb[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            ...(crumb.path !== undefined
                ? { item: `${SITE_URL}/${locale}${crumb.path === '/' ? '' : crumb.path}` }
                : {})
        }))
    };
}
