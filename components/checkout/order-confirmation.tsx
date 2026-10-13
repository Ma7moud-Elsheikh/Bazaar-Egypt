'use client';

import { CheckCircleIcon } from '@/components/product/icons';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { readLastOrder, type LastOrder } from '@/lib/orders/last-order';
import { whatsappLink } from '@/lib/site';
import { formatPrice, localize } from '@/lib/utils/format';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type Props = { orderId: string };

export function OrderConfirmation({ orderId }: Props) {
    const t = useTranslations('Order');
    const tc = useTranslations('Cart');
    const locale = useLocale() as Locale;

    // undefined = لسه بنقرأ | null = مفيش تفاصيل محفوظة
    const [order, setOrder] = useState<LastOrder | null | undefined>(undefined);

    useEffect(() => {
        setOrder(readLastOrder(orderId));
    }, [orderId]);

    const whatsapp = whatsappLink(t('whatsappMessage', { id: orderId }));

    const formatDate = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG-u-nu-latn' : 'en', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    });

    return (
        <div className="mx-auto max-w-3xl">
            <div className="glass rounded-[1.75rem] p-6 text-center sm:p-10">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-brand text-on-brand">
                    <CheckCircleIcon className="size-9" />
                </span>

                <h1 className="mt-5 font-display text-3xl font-bold sm:text-4xl">{t('title')}</h1>
                <p className="mt-2 text-muted">{t('subtitle')}</p>

                <p className="mt-6 text-sm text-muted">{t('orderNumber')}</p>
                <p dir="ltr" className="font-display text-3xl font-bold tracking-wide select-all">
                    {orderId}
                </p>

                <p className="mx-auto mt-5 max-w-md text-sm">
                    {order
                        ? t('contactNote', { phone: order.customer.phone })
                        : t('contactNoteGeneric')}
                </p>
            </div>

            {order === undefined && (
                <p role="status" className="mt-6 text-center text-sm text-muted">
                    {t('loading')}
                </p>
            )}

            {order === null && (
                <p className="mt-6 text-center text-sm text-muted">{t('missingDetails')}</p>
            )}

            {order && (
                <>
                    <section
                        aria-labelledby="next-title"
                        className="glass mt-6 rounded-[1.75rem] p-6 sm:p-8"
                    >
                        <h2 id="next-title" className="font-display text-xl font-bold">
                            {t('nextTitle')}
                        </h2>
                        <ol className="mt-4 space-y-3 text-sm">
                            <li className="flex gap-3">
                                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-on-brand">
                                    1
                                </span>
                                {t('step1')}
                            </li>
                            <li className="flex gap-3">
                                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-on-brand">
                                    2
                                </span>
                                {order.delivery
                                    ? t('step2', {
                                          from: formatDate.format(new Date(order.delivery.from)),
                                          to: formatDate.format(new Date(order.delivery.to))
                                      })
                                    : t('step2Generic')}
                            </li>
                            <li className="flex gap-3">
                                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-on-brand">
                                    3
                                </span>
                                {order.paymentMethod.id === 'cod'
                                    ? t('step3Cod', {
                                          total: formatPrice(order.totals.total, locale)
                                      })
                                    : t('step3Other', {
                                          method: localize(order.paymentMethod.label, locale)
                                      })}
                            </li>
                        </ol>
                    </section>

                    <section
                        aria-labelledby="summary-title"
                        className="glass mt-6 rounded-[1.75rem] p-6 sm:p-8"
                    >
                        <h2 id="summary-title" className="font-display text-xl font-bold">
                            {t('summaryTitle')}
                        </h2>

                        <ul className="mt-4 divide-y divide-line">
                            {order.items.map((item) => (
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
                                        <p className="font-semibold">
                                            {localize(item.name, locale)}
                                        </p>
                                        <p className="text-xs text-muted">× {item.quantity}</p>
                                    </div>
                                    <p className="shrink-0 text-sm font-semibold">
                                        {formatPrice(item.price * item.quantity, locale)}
                                    </p>
                                </li>
                            ))}
                        </ul>

                        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
                            <div className="flex justify-between gap-4">
                                <dt className="text-muted">{tc('subtotal')}</dt>
                                <dd>{formatPrice(order.totals.subtotal, locale)}</dd>
                            </div>
                            {order.totals.giftTotal > 0 && (
                                <div className="flex justify-between gap-4">
                                    <dt className="text-muted">{tc('giftLine')}</dt>
                                    <dd>{formatPrice(order.totals.giftTotal, locale)}</dd>
                                </div>
                            )}
                            <div className="flex justify-between gap-4">
                                <dt className="text-muted">{tc('shippingLine')}</dt>
                                <dd>{formatPrice(order.totals.shippingFee, locale)}</dd>
                            </div>
                            <div className="flex justify-between gap-4 border-t border-line pt-3 text-lg font-bold">
                                <dt>{tc('totalLine')}</dt>
                                <dd>{formatPrice(order.totals.total, locale)}</dd>
                            </div>
                        </dl>

                        <div className="mt-6 grid gap-4 border-t border-line pt-4 text-sm sm:grid-cols-2">
                            <div>
                                <p className="font-semibold">{t('shipTo')}</p>
                                <p className="mt-1 text-muted">
                                    {order.customer.fullName}
                                    <br />
                                    {order.customer.address}
                                    {order.customer.landmark ? `، ${order.customer.landmark}` : ''}
                                    <br />
                                    {order.customer.city}،{' '}
                                    {localize(order.customer.governorateName, locale)}
                                </p>
                            </div>
                            <div>
                                <p className="font-semibold">{t('payment')}</p>
                                <p className="mt-1 text-muted">
                                    {localize(order.paymentMethod.label, locale)}
                                </p>
                            </div>
                        </div>
                    </section>
                </>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                    href="/shop"
                    className="btn-primary inline-flex h-12 items-center justify-center px-8 text-sm font-semibold"
                >
                    {t('continueShopping')}
                </Link>
                {whatsapp && (
                    <a
                        href={whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-glass inline-flex h-12 items-center justify-center px-8 text-sm font-semibold"
                    >
                        {t('whatsapp')}
                    </a>
                )}
            </div>
        </div>
    );
}
