import { CartDrawer } from '@/components/cart/cart-drawer';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { JsonLd } from '@/components/seo/json-ld';
import { localeDir, routing } from '@/i18n/routing';
import { IS_PRODUCTION, LOGO, OG_LOCALE, SITE_NAME, SITE_URL, THEME_COLOR } from '@/lib/site';
import type { Metadata, Viewport } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
    Aref_Ruqaa,
    Cormorant_Garamond,
    IBM_Plex_Sans_Arabic,
    Inter,
    Reem_Kufi
} from 'next/font/google';
import { notFound } from 'next/navigation';
import '../globals.css';

const reemKufi = Reem_Kufi({
    subsets: ['arabic', 'latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-reem-kufi',
    display: 'swap'
});

const arefRuqaa = Aref_Ruqaa({
    subsets: ['arabic', 'latin'],
    weight: ['400', '700'],
    variable: '--font-aref-ruqaa',
    display: 'swap'
});

const plexArabic = IBM_Plex_Sans_Arabic({
    subsets: ['arabic', 'latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-plex-arabic',
    display: 'swap'
});

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    style: ['normal', 'italic'],
    variable: '--font-cormorant',
    display: 'swap'
});

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap'
});

type LocaleParams = { params: Promise<{ locale: string }> };

export const viewport: Viewport = {
    themeColor: THEME_COLOR
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
    const { locale: rawLocale } = await params;
    const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;
    const t = await getTranslations({ locale, namespace: 'Metadata' });

    return {
        metadataBase: new URL(SITE_URL),
        title: { default: t('title'), template: `%s | ${t('siteName')}` },
        description: t('description'),
        applicationName: t('siteName'),
        openGraph: {
            type: 'website',
            siteName: t('siteName'),
            title: t('title'),
            description: t('description'),
            locale: OG_LOCALE[locale],
            alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l])
        },
        twitter: {
            card: 'summary_large_image',
            title: t('title'),
            description: t('description')
        },
        robots: IS_PRODUCTION ? { index: true, follow: true } : { index: false, follow: false }
    };
}

export default async function LocaleLayout({
    children,
    params
}: LocaleParams & { children: React.ReactNode }) {
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    setRequestLocale(locale);
    const tc = await getTranslations('Common');

    const otherLocale = locale === 'ar' ? 'en' : 'ar';

    const organizationJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME[locale],
        alternateName: SITE_NAME[otherLocale],
        url: SITE_URL,
        logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}${LOGO.path}`,
            width: LOGO.width,
            height: LOGO.height
        }
    };

    const websiteJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME[locale],
        inLanguage: locale,
        publisher: { '@id': `${SITE_URL}/#organization` }
    };

    return (
        <html
            lang={locale}
            dir={localeDir[locale]}
            className={`${reemKufi.variable} ${arefRuqaa.variable} ${plexArabic.variable} ${cormorant.variable} ${inter.variable}`}
        >
            <body className="flex min-h-dvh flex-col antialiased">
                <JsonLd data={organizationJsonLd} />
                <JsonLd data={websiteJsonLd} />
                <NextIntlClientProvider>
                    <a
                        href="#main-content"
                        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-on-brand"
                    >
                        {tc('skipToContent')}
                    </a>
                    <SiteHeader />
                    <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
                        {children}
                    </main>
                    <SiteFooter />
                    <CartDrawer />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
