'use client';

import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { useCart } from '@/lib/cart/cart-store';
import { estimateDelivery } from '@/lib/shipping/estimate';
import { useSelectedGovernorate } from '@/lib/shipping/selected-governorate';
import { computeTotals } from '@/lib/shipping/totals';
import { useShippingConfig } from '@/lib/shipping/use-shipping-config';
import { formatPrice, localize } from '@/lib/utils/format';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useState } from 'react';

type Props = {
    variant?: 'drawer' | 'page';
    /** بيتنادى بعد الضغط على أي رابط (لقفل الـ drawer) */
    onNavigate?: () => void;
};

export function CartSummary({ variant = 'page', onNavigate }: Props) {
    const t = useTranslations('Cart');
    const tp = useTranslations('Purchase');
    const locale = useLocale() as Locale;
    const selectId = useId();

    const { items } = useCart();
    const shipping = useShippingConfig();
    const [governorate, setGovernorate] = useSelectedGovernorate();
    const [today, setToday] = useState<Date | null>(null);

    // التاريخ بعد الـ mount بس (عشان مفيش اختلاف بين السيرفر والمتصفح)
    useEffect(() => {
        setToday(new Date());
    }, []);

    const config = shipping.status === 'ready' ? shipping.config : null;
    const totals = computeTotals(items, config, governorate);

    // أطول مدة تجهيز في السلة
    const prepDays = items.reduce(
        (max, item) => Math.max(max, item.madeToOrder ? Math.max(item.leadTimeDays ?? 1, 1) : 1),
        1
    );
    const estimate =
        config && governorate && today
            ? estimateDelivery(
                  config,
                  governorate,
                  { madeToOrder: true, leadTimeDays: prepDays },
                  today
              )
            : null;

    const formatDate = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    });

    const governorates = config
        ? [...config.governorates].sort((a, b) =>
              localize(a.name, locale).localeCompare(localize(b.name, locale), locale)
          )
        : [];

    const progress = config ? Math.min(totals.subtotal / totals.freeShippingThreshold, 1) : 0;
    const reached = config !== null && totals.freeShippingRemaining === 0;
    const compact = variant === 'drawer';

    return (
        <div className={compact ? 'space-y-3 text-sm' : 'space-y-4 text-sm'}>
            {config && (
                <div>
                    <p className="font-medium">
                        {reached
                            ? t('freeShippingReached')
                            : t('freeShippingProgress', {
                                  amount: formatPrice(totals.freeShippingRemaining, locale)
                              })}
                    </p>
                    <div
                        role="progressbar"
                        aria-label={t('freeShippingBar')}
                        aria-valuemin={0}
                        aria-valuemax={totals.freeShippingThreshold}
                        aria-valuenow={Math.min(totals.subtotal, totals.freeShippingThreshold)}
                        className="mt-2 h-2 overflow-hidden rounded-full bg-fg/15"
                    >
                        <div
                            className="h-full origin-left rounded-full bg-brand transition-transform duration-500 ease-craft rtl:origin-right motion-reduce:transition-none"
                            style={{ transform: `scaleX(${progress})` }}
                        />
                    </div>
                </div>
            )}

            {config && (
                <div>
                    <label
                        htmlFor={selectId}
                        className="mb-1.5 block text-xs font-medium text-muted"
                    >
                        {tp('governorateLabel')}
                    </label>
                    <select
                        id={selectId}
                        value={governorate ?? ''}
                        onChange={(event) => setGovernorate(event.target.value || null)}
                        className="h-11 w-full rounded-full border border-line bg-surface/70 px-4 text-sm"
                    >
                        <option value="">{tp('governoratePlaceholder')}</option>
                        {governorates.map((g) => (
                            <option key={g.slug} value={g.slug}>
                                {localize(g.name, locale)}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <dl className="space-y-2">
                <div className="flex justify-between gap-4">
                    <dt className="text-muted">{t('subtotal')}</dt>
                    <dd>{formatPrice(totals.subtotal, locale)}</dd>
                </div>

                {totals.giftTotal > 0 && (
                    <div className="flex justify-between gap-4">
                        <dt className="text-muted">{t('giftLine')}</dt>
                        <dd>{formatPrice(totals.giftTotal, locale)}</dd>
                    </div>
                )}

                <div className="flex justify-between gap-4">
                    <dt className="text-muted">{t('shippingLine')}</dt>
                    <dd>
                        {totals.shippingFee === null
                            ? t('pickGovernorate')
                            : totals.shippingFee === 0
                              ? tp('shippingFree')
                              : formatPrice(totals.shippingFee, locale)}
                    </dd>
                </div>

                <div className="flex justify-between gap-4 border-t border-line pt-3 text-base font-bold">
                    <dt>
                        {totals.shippingFee === null ? t('totalBeforeShipping') : t('totalLine')}
                    </dt>
                    <dd>{formatPrice(totals.total, locale)}</dd>
                </div>
            </dl>

            {estimate && (
                <p aria-live="polite" className="text-xs text-muted">
                    {t('deliveryEstimate', {
                        from: formatDate.format(estimate.from),
                        to: formatDate.format(estimate.to)
                    })}
                    {' · '}
                    {t('deliveryDisclaimer')}
                </p>
            )}

            <div className="space-y-2 pt-1">
                <Link
                    href="/checkout"
                    onClick={onNavigate}
                    className="btn-primary flex h-12 w-full items-center justify-center text-sm font-semibold"
                >
                    {t('checkout')}
                </Link>

                {compact ? (
                    <Link
                        href="/cart"
                        onClick={onNavigate}
                        className="btn-glass flex h-11 w-full items-center justify-center text-sm font-semibold"
                    >
                        {t('viewCart')}
                    </Link>
                ) : (
                    <Link
                        href="/shop"
                        className="flex h-11 w-full items-center justify-center text-sm font-semibold text-muted transition hover:text-fg"
                    >
                        {t('continueShopping')}
                    </Link>
                )}
            </div>
        </div>
    );
}
