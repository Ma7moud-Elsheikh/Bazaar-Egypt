'use client';

import { cartActions } from '@/lib/cart/cart-store';
import type { Product } from '@/lib/schemas/catalog';
import { useTranslations } from 'next-intl';

const defaultClassName =
    'btn-primary inline-flex h-11 items-center justify-center px-6 text-sm font-semibold';

type Props = {
    product: Product;
    quantity?: number;
    customization?: Record<string, string>;
    className?: string;
};

export function AddToCartButton({ product, quantity = 1, customization, className }: Props) {
    const t = useTranslations('Cart');
    const soldOut = !product.madeToOrder && product.stock < 1;

    return (
        <button
            type="button"
            disabled={soldOut}
            onClick={() => cartActions.add({ product, quantity, customization })}
            className={className ?? defaultClassName}
        >
            {soldOut ? t('soldOut') : t('addToCart')}
        </button>
    );
}
