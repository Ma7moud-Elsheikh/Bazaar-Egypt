'use client';

import { WishlistButton } from '@/components/shop/wishlist-button';
import { MinusIcon, PlusIcon } from '@/components/ui/icons';
import { useRouter } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { cartActions } from '@/lib/cart/cart-store';
import type { Product } from '@/lib/schemas/catalog';
import { estimateDelivery, shippingFee } from '@/lib/shipping/estimate';
import { useSelectedGovernorate } from '@/lib/shipping/selected-governorate';
import { useShippingConfig } from '@/lib/shipping/use-shipping-config';
import { whatsappLink } from '@/lib/site';
import { DEFAULT_GIFT_WRAP_PRICE, DEFAULT_RETURN_DAYS } from '@/lib/store-config';
import { formatPrice, localize } from '@/lib/utils/format';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CustomizationForm } from './customization-form';
import { DeliveryEstimate } from './delivery-estimate';
import { CashIcon, ChatIcon, GiftIcon, HandmadeIcon, ReturnIcon } from './icons';

type Props = { product: Product };

export function PurchasePanel({ product }: Props) {
    const t = useTranslations('Purchase');
    const tg = useTranslations('ProductPage');
    const tp = useTranslations('Product');
    const tc = useTranslations('Cart');
    const locale = useLocale() as Locale;
    const router = useRouter();

    const [quantity, setQuantity] = useState(1);
    const [values, setValues] = useState<Record<string, string>>({});
    const [invalid, setInvalid] = useState<ReadonlySet<string>>(new Set());
    const [giftWrap, setGiftWrap] = useState(false);
    const [giftMessage, setGiftMessage] = useState('');
    const [barVisible, setBarVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [today, setToday] = useState<Date | null>(null);
    const [governorate, setGovernorate] = useSelectedGovernorate();
    const shipping = useShippingConfig();

    const ctaRef = useRef<HTMLDivElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);

    // التاريخ والـ portal بعد الـ mount بس (عشان مفيش اختلاف بين السيرفر والمتصفح)
    useEffect(() => {
        setMounted(true);
        setToday(new Date());
    }, []);

    // الشريط الثابت يظهر لما أزرار الشراء الأساسية تطلع من الشاشة
    useEffect(() => {
        const el = ctaRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => setBarVisible(!entry.isIntersecting),
            { threshold: 0.1 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const name = localize(product.name, locale);
    const config = shipping.status === 'ready' ? shipping.config : null;

    const soldOut = !product.madeToOrder && product.stock < 1;
    const max = product.madeToOrder ? 20 : Math.min(product.stock, 20);
    const lowStock = !product.madeToOrder && product.stock > 0 && product.stock <= 3;

    const giftOption = product.giftWrap ?? {
        available: true,
        price: config?.giftWrapPrice ?? DEFAULT_GIFT_WRAP_PRICE
    };
    const returnDays = product.returnDays ?? config?.returnDays ?? DEFAULT_RETURN_DAYS;

    const subtotal = product.price * quantity;
    const giftCost = giftWrap && giftOption.available ? giftOption.price : 0;
    const estimate =
        config && governorate && today
            ? estimateDelivery(config, governorate, product, today)
            : null;
    const fee = config && estimate ? shippingFee(config, estimate.zone, subtotal) : null;
    const total = subtotal + giftCost + (fee ?? 0);

    const whatsapp = whatsappLink(t(soldOut ? 'whatsappSoldOut' : 'whatsappMessage', { name }));

    let status = tg('inStock');
    if (soldOut) status = tp('soldOut');
    else if (product.madeToOrder) {
        status =
            product.leadTimeDays > 0
                ? `${tp('madeToOrder')} · ${tp('leadTime', { days: product.leadTimeDays })}`
                : tp('madeToOrder');
    } else if (lowStock) status = tg('lowStock', { count: product.stock });

    function changeOption(key: string, value: string) {
        setValues((current) => ({ ...current, [key]: value }));
        if (invalid.has(key)) {
            setInvalid((current) => {
                const next = new Set(current);
                next.delete(key);
                return next;
            });
        }
    }

    function submit(mode: 'add' | 'buy') {
        if (soldOut) return;

        const missing = product.customizationOptions
            .filter((option) => option.required && !(values[option.key] ?? '').trim())
            .map((option) => option.key);

        if (missing.length > 0) {
            setInvalid(new Set(missing));
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            optionsRef.current?.scrollIntoView({
                behavior: reduce ? 'auto' : 'smooth',
                block: 'center'
            });
            return;
        }

        setInvalid(new Set());
        cartActions.add({
            product,
            quantity,
            customization: values,
            gift: giftWrap ? { wrap: true, message: giftMessage } : undefined,
            openDrawer: mode === 'add'
        });
        if (mode === 'buy') router.push('/checkout');
    }

    const addLabel = soldOut ? tp('soldOut') : tc('addToCart');

    const stickyBar = (
        <div
            inert={!barVisible}
            className={`fixed inset-x-0 bottom-0 z-40 transition duration-300 ease-craft lg:hidden ${
                barVisible ? 'translate-y-0' : 'translate-y-full'
            }`}
        >
            <div
                data-theme="dark"
                className="glass-smoke-strong mx-3 mb-3 flex items-center gap-3 rounded-2xl p-3"
            >
                <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-fg/75">{name}</p>
                    <p className="font-bold">{formatPrice(product.price, locale)}</p>
                </div>
                <button
                    type="button"
                    disabled={soldOut}
                    onClick={() => submit('add')}
                    className="btn-primary inline-flex h-11 shrink-0 items-center justify-center px-6 text-sm font-semibold"
                >
                    {addLabel}
                </button>
            </div>
        </div>
    );

    return (
        <div className="mt-6 space-y-5">
            <p role="status" className="flex items-center gap-2 text-sm font-medium">
                <span
                    aria-hidden
                    className={`size-2.5 rounded-full ${soldOut ? 'bg-clay' : 'bg-olive'}`}
                />
                {status}
            </p>

            {product.customizationOptions.length > 0 && (
                <div ref={optionsRef}>
                    <CustomizationForm
                        options={product.customizationOptions}
                        values={values}
                        invalid={invalid}
                        onChange={changeOption}
                    />
                </div>
            )}

            {!soldOut && (
                <div className="flex items-center gap-3">
                    <span id="quantity-label" className="text-sm font-medium text-muted">
                        {tg('quantity')}
                    </span>
                    <div
                        role="group"
                        aria-labelledby="quantity-label"
                        className="btn-glass inline-flex items-center"
                    >
                        <button
                            type="button"
                            aria-label={tg('decreaseQuantity')}
                            disabled={quantity <= 1}
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            className="grid size-11 place-items-center rounded-full transition hover:bg-fg/10 disabled:opacity-40"
                        >
                            <MinusIcon className="size-4" />
                        </button>
                        <span
                            aria-live="polite"
                            className="min-w-10 text-center text-sm font-semibold"
                        >
                            {quantity}
                        </span>
                        <button
                            type="button"
                            aria-label={tg('increaseQuantity')}
                            disabled={quantity >= max}
                            onClick={() => setQuantity((q) => Math.min(max, q + 1))}
                            className="grid size-11 place-items-center rounded-full transition hover:bg-fg/10 disabled:opacity-40"
                        >
                            <PlusIcon className="size-4" />
                        </button>
                    </div>
                </div>
            )}

            {!soldOut && giftOption.available && (
                <div className="rounded-2xl border border-line p-4">
                    <label className="flex min-h-11 cursor-pointer items-center gap-3">
                        <input
                            type="checkbox"
                            checked={giftWrap}
                            onChange={(event) => setGiftWrap(event.target.checked)}
                            className="size-5 accent-[var(--brand)]"
                        />
                        <GiftIcon className="size-5 text-accent" />
                        <span className="flex-1 text-sm font-semibold">{t('giftToggle')}</span>
                        <span className="text-sm text-muted">
                            {giftOption.price > 0
                                ? t('giftPrice', { price: formatPrice(giftOption.price, locale) })
                                : t('giftFree')}
                        </span>
                    </label>

                    {giftWrap && (
                        <div className="mt-3">
                            <label
                                htmlFor="gift-message"
                                className="mb-1.5 block text-sm font-semibold"
                            >
                                {t('giftMessageLabel')}
                            </label>
                            <textarea
                                id="gift-message"
                                rows={3}
                                maxLength={200}
                                value={giftMessage}
                                placeholder={t('giftMessagePlaceholder')}
                                onChange={(event) => setGiftMessage(event.target.value)}
                                className="w-full rounded-2xl border border-line bg-surface/70 px-4 py-3 text-sm"
                            />
                            <p className="mt-1 text-end text-xs text-muted">
                                {t('charCount', { current: giftMessage.length, max: 200 })}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {!soldOut && (
                <DeliveryEstimate
                    state={shipping}
                    governorate={governorate}
                    onChange={setGovernorate}
                    estimate={estimate}
                    fee={fee}
                />
            )}

            {!soldOut && (
                <dl className="space-y-1.5 rounded-2xl bg-fg/5 p-4 text-sm">
                    <div className="flex justify-between gap-4">
                        <dt className="text-muted">{t('subtotal')}</dt>
                        <dd>{formatPrice(subtotal, locale)}</dd>
                    </div>
                    {giftCost > 0 && (
                        <div className="flex justify-between gap-4">
                            <dt className="text-muted">{t('giftLine')}</dt>
                            <dd>{formatPrice(giftCost, locale)}</dd>
                        </div>
                    )}
                    <div className="flex justify-between gap-4">
                        <dt className="text-muted">{t('shippingLine')}</dt>
                        <dd>
                            {fee === null
                                ? t('pickGovernorate')
                                : fee === 0
                                  ? t('shippingFree')
                                  : formatPrice(fee, locale)}
                        </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-line pt-2 text-base font-bold">
                        <dt>{fee === null ? t('totalBeforeShipping') : t('totalLine')}</dt>
                        <dd>{formatPrice(total, locale)}</dd>
                    </div>
                </dl>
            )}

            <div ref={ctaRef} className="space-y-3">
                <div className="flex gap-3">
                    <button
                        type="button"
                        disabled={soldOut}
                        onClick={() => submit('add')}
                        className="btn-primary flex h-12 flex-1 items-center justify-center text-base font-semibold"
                    >
                        {addLabel}
                    </button>
                    <WishlistButton variant="inline" productId={product.id} name={name} />
                </div>

                {!soldOut && (
                    <button
                        type="button"
                        onClick={() => submit('buy')}
                        className="btn-glass flex h-12 w-full items-center justify-center text-base font-semibold"
                    >
                        {t('buyNow')}
                    </button>
                )}

                {soldOut && whatsapp && (
                    <a
                        href={whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-glass flex h-12 w-full items-center justify-center text-base font-semibold"
                    >
                        {t('askWhatsapp')}
                    </a>
                )}
            </div>

            <ul className="grid grid-cols-2 gap-3 border-t border-line pt-5 text-xs sm:text-sm">
                <li className="flex items-center gap-2">
                    <CashIcon className="size-5 shrink-0 text-accent" />
                    {t('trustCod')}
                </li>
                <li className="flex items-center gap-2">
                    <ReturnIcon className="size-5 shrink-0 text-accent" />
                    {t('trustReturns', { days: returnDays })}
                </li>
                <li className="flex items-center gap-2">
                    <HandmadeIcon className="size-5 shrink-0 text-accent" />
                    {t('trustHandmade')}
                </li>
                {whatsapp && (
                    <li>
                        <a
                            href={whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex min-h-11 items-center gap-2 transition hover:text-accent"
                        >
                            <ChatIcon className="size-5 shrink-0 text-accent" />
                            {t('trustWhatsapp')}
                        </a>
                    </li>
                )}
            </ul>

            {/* في portal لأن اللوح الزجاجي (backdrop-filter) بيخلي أي عنصر fixed جواه نسبي ليه مش للشاشة */}
            {mounted && createPortal(stickyBar, document.body)}
        </div>
    );
}
