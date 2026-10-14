'use client';

import { Link } from '@/i18n/navigation';
import { useWishlistCount } from '@/lib/wishlist/wishlist-store';
import { useTranslations } from 'next-intl';

export function WishlistLink() {
    const t = useTranslations('Wishlist');
    const count = useWishlistCount();

    return (
        <Link
            href="/wishlist"
            aria-label={count > 0 ? t('openWithCount', { count }) : t('open')}
            className="btn-glass relative inline-flex size-11 items-center justify-center max-sm:hidden"
        >
            <svg
                viewBox="0 0 24 24"
                aria-hidden
                focusable="false"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6 fill-transparent stroke-current"
            >
                <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z" />
            </svg>
            {count > 0 && (
                <span
                    aria-hidden
                    className="absolute -top-1 -end-1 grid min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold leading-5 text-on-brand shadow-md"
                >
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </Link>
    );
}
