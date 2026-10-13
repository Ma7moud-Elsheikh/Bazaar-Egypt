'use client';

import type { Locale } from '@/i18n/routing';
import type { CartItem } from '@/lib/schemas/cart';
import type { CartTotals } from '@/lib/shipping/totals';
import { formatPrice, localize } from '@/lib/utils/format';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

type Props = { items: CartItem[]; totals: CartTotals; locale: Locale };

export function OrderSummary({ items, totals, locale }: Props) {
    const t = useTranslations('Checkout');
    const tc = useTranslations('Cart');
    const tp = useTranslations('Purchase');

    return (
        <div>
            <h2 className="font-display text-xl font-bold">{t('summaryTitle')}</h2>

            <ul className="mt-4 divide-y divide-line">
                {items.map((item) => {
                    const name = localize(item.name, locale);
                    const customization = item.customization
                        ? Object.values(item.customization).join(' · ')
                        : '';

                    return (
                        <li key={item.lineId} className="flex gap-3 py-3">
                            <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                                <Image
                                    src={item.image.src}
                                    alt=""
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                />
                            </div>
                            <div className="min-w-0 flex-1 text-sm">
                                <p className="font-semibold leading-snug">{name}</p>
                                {customization && (
                                    <p className="text-xs text-muted">{customization}</p>
                                )}
                                {item.gift?.wrap && (
                                    <p className="text-xs text-muted">{tc('giftLabel')}</p>
                                )}
                                <p className="text-xs text-muted">
                                    {t('itemQty', {
                                        quantity: item.quantity,
                                        price: formatPrice(item.price, locale)
                                    })}
                                </p>
                            </div>
                            <p className="shrink-0 text-sm font-semibold">
                                {formatPrice(item.price * item.quantity, locale)}
                            </p>
                        </li>
                    );
                })}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
                <div className="flex justify-between gap-4">
                    <dt className="text-muted">{tc('subtotal')}</dt>
                    <dd>{formatPrice(totals.subtotal, locale)}</dd>
                </div>

                {totals.giftTotal > 0 && (
                    <div className="flex justify-between gap-4">
                        <dt className="text-muted">{tc('giftLine')}</dt>
                        <dd>{formatPrice(totals.giftTotal, locale)}</dd>
                    </div>
                )}

                <div className="flex justify-between gap-4">
                    <dt className="text-muted">{tc('shippingLine')}</dt>
                    <dd>
                        {totals.shippingFee === null
                            ? tc('pickGovernorate')
                            : totals.shippingFee === 0
                              ? tp('shippingFree')
                              : formatPrice(totals.shippingFee, locale)}
                    </dd>
                </div>

                <div className="flex justify-between gap-4 border-t border-line pt-3 text-lg font-bold">
                    <dt>
                        {totals.shippingFee === null ? tc('totalBeforeShipping') : tc('totalLine')}
                    </dt>
                    <dd>{formatPrice(totals.total, locale)}</dd>
                </div>
            </dl>
        </div>
    );
}
