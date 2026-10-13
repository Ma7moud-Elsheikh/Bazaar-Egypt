'use client';

import { PlusIcon } from '@/components/ui/icons';
import type { Locale } from '@/i18n/routing';
import { cartActions } from '@/lib/cart/cart-store';
import type { Product } from '@/lib/schemas/catalog';
import { localize } from '@/lib/utils/format';
import { useLocale, useTranslations } from 'next-intl';

type Props = { product: Product; className?: string };

export function QuickAddButton({ product, className = '' }: Props) {
    const t = useTranslations('Cart');
    const locale = useLocale() as Locale;
    const name = localize(product.name, locale);

    return (
        <button
            type="button"
            aria-label={t('addNamedToCart', { name })}
            onClick={() => cartActions.add({ product })}
            className={`btn-primary inline-flex size-11 shrink-0 items-center justify-center ${className}`}
        >
            <PlusIcon className="size-5" />
        </button>
    );
}
