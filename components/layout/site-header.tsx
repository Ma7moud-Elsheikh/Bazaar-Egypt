import { BrandLogo } from '@/components/brand/brand-logo';
import { CartButton } from '@/components/cart/cart-button';
import { SearchBox } from '@/components/search/search-box';
import { SearchDialog } from '@/components/search/search-dialog';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { LocaleSwitcher } from './locale-switcher';
import { MobileNav } from './mobile-nav';
import { NavLink } from './nav-link';
import { WishlistLink } from './wishlist-link';

const NAV = [
    { href: '/', key: 'home' },
    { href: '/shop', key: 'shop' },
    { href: '/crafts', key: 'crafts' },
    { href: '/artisans', key: 'artisans' },
    { href: '/about', key: 'about' }
] as const;

export async function SiteHeader() {
    const t = await getTranslations('Nav');
    const tc = await getTranslations('Common');

    const items = NAV.map((item) => ({ href: item.href, label: t(item.key) }));
    // قايمة الموبايل فيها المفضلة كمان (على الديسكتوب ليها أيقونة)
    const mobileItems = [...items, { href: '/wishlist', label: t('wishlist') }];
    // على الديسكتوب الشعار هو رابط الرئيسية، و«عن بازار مصر» من 1280px
    const desktopItems = NAV.filter((item) => item.href !== '/');

    return (
        <header className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
            <div
                data-theme="dark"
                className="glass-smoke mx-auto flex h-16 max-w-7xl items-center gap-3 rounded-full ps-4 pe-2.5"
            >
                <Link href="/" aria-label={tc('brand')} className="shrink-0 rounded-full">
                    <BrandLogo size={36} priority />
                </Link>

                <nav
                    aria-label={t('mainNavigation')}
                    className="hidden shrink-0 items-center gap-1 lg:flex"
                >
                    {desktopItems.map((item) => (
                        <NavLink
                            key={item.href}
                            href={item.href}
                            className={`rounded-full px-3 py-2 text-sm font-medium transition hover:bg-fg/10 data-[active=true]:bg-fg/10 data-[active=true]:text-accent xl:px-4 ${
                                item.href === '/about' ? 'max-xl:hidden' : ''
                            }`}
                        >
                            {t(item.key)}
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden min-w-0 flex-1 lg:block">
                    <SearchBox />
                </div>
                <div className="flex-1 lg:hidden" />

                <div className="flex shrink-0 items-center gap-2">
                    <SearchDialog />
                    <div className="hidden lg:block">
                        <LocaleSwitcher />
                    </div>
                    <WishlistLink />
                    <CartButton />
                    <MobileNav items={mobileItems} />
                </div>
            </div>
        </header>
    );
}
