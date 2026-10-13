'use client';

import { BagIcon } from '@/components/ui/icons';
import { cartActions, useCart } from '@/lib/cart/cart-store';
import { useTranslations } from 'next-intl';

export function CartButton() {
    const t = useTranslations('Cart');
    const { count } = useCart();

    return (
        <button
            type="button"
            aria-haspopup="dialog"
            aria-label={count > 0 ? t('openWithCount', { count }) : t('open')}
            onClick={cartActions.open}
            className="btn-glass relative inline-flex size-11 cursor-pointer items-center justify-center"
        >
            <BagIcon className="size-6" />
            {count > 0 && (
                <span
                    aria-hidden
                    className="absolute -top-1 -inset-e-1 cursor-pointer grid min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold leading-5 text-white shadow-md"
                >
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </button>
    );
}
