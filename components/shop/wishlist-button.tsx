'use client';

import { useIsWishlisted, wishlistActions } from '@/lib/wishlist/wishlist-store';
import { useTranslations } from 'next-intl';

type Props = {
    productId: string;
    name: string;
    /** overlay = فوق الصور (كروت) | inline = جنب الأزرار (صفحة المنتج) */
    variant?: 'overlay' | 'inline';
    className?: string;
};

export function WishlistButton({ productId, name, variant = 'overlay', className = '' }: Props) {
    const t = useTranslations('Wishlist');
    const active = useIsWishlisted(productId);
    const overlay = variant === 'overlay';

    return (
        <button
            type="button"
            data-theme={overlay ? 'dark' : undefined}
            aria-pressed={active}
            aria-label={active ? t('remove', { name }) : t('add', { name })}
            onClick={() => wishlistActions.toggle(productId)}
            className={`inline-flex items-center justify-center rounded-full transition duration-300 ease-craft active:scale-90 ${
                overlay ? 'glass-smoke-strong size-11 text-fg' : 'btn-glass size-12'
            } ${className}`}
        >
            <svg
                viewBox="0 0 24 24"
                aria-hidden
                focusable="false"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`size-5 transition-colors duration-300 ${
                    active
                        ? overlay
                            ? 'fill-copper-light stroke-copper-light'
                            : 'fill-clay stroke-clay'
                        : 'fill-transparent stroke-current'
                }`}
            >
                <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z" />
            </svg>
        </button>
    );
}
