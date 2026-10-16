import { BrandLogo } from '@/components/brand/brand-logo';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { Reveal } from '@/components/ui/reveal';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

const COLUMNS = [
    {
        titleKey: 'shopTitle',
        links: [
            { href: '/shop', key: 'shopAll' },
            { href: '/crafts', key: 'crafts' },
            { href: '/artisans', key: 'artisans' }
        ]
    },
    {
        titleKey: 'supportTitle',
        links: [
            { href: '/shipping', key: 'shipping' },
            { href: '/returns', key: 'returns' },
            { href: '/faq', key: 'faq' },
            { href: '/contact', key: 'contact' }
        ]
    },
    {
        titleKey: 'legalTitle',
        links: [
            { href: '/privacy', key: 'privacy' },
            { href: '/terms', key: 'terms' }
        ]
    }
] as const;

export async function SiteFooter() {
    const t = await getTranslations('Footer');
    const tc = await getTranslations('Common');

    return (
        <footer
            data-theme="dark"
            className="relative isolate overflow-hidden px-4 pt-24 pb-6 sm:px-8"
        >
            <AmbientBackground pattern />

            <div className="mx-auto max-w-6xl">
                <Reveal className="glass rounded-4xl p-8 sm:p-12">
                    <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <Link href="/" aria-label={tc('brand')} className="inline-block">
                                <BrandLogo
                                    size={56}
                                    textClassName="font-display text-3xl font-bold"
                                />
                            </Link>
                            <p className="mt-4 max-w-xs text-fg/80">{t('tagline')}</p>
                            <p className="mt-6 font-accent text-2xl text-accent">{t('quote')}</p>
                        </div>

                        {COLUMNS.map((column) => (
                            <nav key={column.titleKey} aria-label={t(column.titleKey)}>
                                <h2 className="font-display text-lg font-bold">
                                    {t(column.titleKey)}
                                </h2>
                                <ul className="mt-4 space-y-1">
                                    {column.links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="inline-flex min-h-11 items-center text-fg/75 transition hover:text-fg"
                                            >
                                                {t(link.key)}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        ))}
                    </div>
                </Reveal>

                <div className="mt-6 flex flex-col gap-2 px-2 text-sm text-fg/70 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        © {new Date().getFullYear()} {tc('brand')}. {t('rights')}
                    </p>
                    <p>
                        {t('builtBy')} <span dir="ltr">Mahmoud Elsheikh</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}
