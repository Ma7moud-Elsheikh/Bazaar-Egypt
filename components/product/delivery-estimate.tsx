'use client';

import type { Locale } from '@/i18n/routing';
import type { DeliveryEstimate as Estimate } from '@/lib/shipping/estimate';
import type { ShippingState } from '@/lib/shipping/use-shipping-config';
import { formatPrice, localize } from '@/lib/utils/format';
import { useLocale, useTranslations } from 'next-intl';
import { useId } from 'react';
import { TruckIcon } from './icons';

type Props = {
    state: ShippingState;
    governorate: string | null;
    onChange: (slug: string | null) => void;
    estimate: Estimate | null;
    /** null = لسه المحافظة ما اتحددتش */
    fee: number | null;
};

export function DeliveryEstimate({ state, governorate, onChange, estimate, fee }: Props) {
    const t = useTranslations('Purchase');
    const locale = useLocale() as Locale;
    const selectId = useId();

    const formatDate = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    });

    const governorates =
        state.status === 'ready'
            ? [...state.config.governorates].sort((a, b) =>
                  localize(a.name, locale).localeCompare(localize(b.name, locale), locale)
              )
            : [];

    return (
        <div className="rounded-2xl border border-line p-4">
            <p className="flex items-center gap-2 font-display text-lg font-bold">
                <TruckIcon className="size-5 text-accent" />
                {t('deliveryTitle')}
            </p>

            {state.status === 'loading' && (
                <p className="mt-2 text-sm text-muted">{t('deliveryLoading')}</p>
            )}

            {state.status === 'error' && (
                <p className="mt-2 text-sm text-muted">{t('deliveryUnavailable')}</p>
            )}

            {state.status === 'ready' && (
                <>
                    <label
                        htmlFor={selectId}
                        className="mt-3 mb-1.5 block text-xs font-medium text-muted"
                    >
                        {t('governorateLabel')}
                    </label>
                    <select
                        id={selectId}
                        value={governorate ?? ''}
                        onChange={(event) => onChange(event.target.value || null)}
                        className="h-11 w-full rounded-full border border-line bg-surface/70 px-4 text-sm"
                    >
                        <option value="">{t('governoratePlaceholder')}</option>
                        {governorates.map((g) => (
                            <option key={g.slug} value={g.slug}>
                                {localize(g.name, locale)}
                            </option>
                        ))}
                    </select>

                    <div aria-live="polite" className="mt-3 space-y-1 text-sm">
                        {estimate && (
                            <>
                                <p className="font-semibold">
                                    {formatDate.format(estimate.from) ===
                                    formatDate.format(estimate.to)
                                        ? t('deliverySingle', {
                                              date: formatDate.format(estimate.from)
                                          })
                                        : t('deliveryRange', {
                                              from: formatDate.format(estimate.from),
                                              to: formatDate.format(estimate.to)
                                          })}
                                </p>
                                <p className="text-muted">
                                    {fee === 0
                                        ? t('shippingFree')
                                        : t('shippingFee', {
                                              fee: formatPrice(fee ?? estimate.zone.fee, locale)
                                          })}
                                    {' · '}
                                    {t('deliveryNote')}
                                </p>
                            </>
                        )}
                        <p className="text-xs text-muted">
                            {t('freeShippingHint', {
                                threshold: formatPrice(state.config.freeShippingThreshold, locale)
                            })}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
