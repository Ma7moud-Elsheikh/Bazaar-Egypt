'use client';

import { Link, useRouter } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { submitOrder } from '@/lib/actions/submit-order';
import { cartActions, useCart } from '@/lib/cart/cart-store';
import { saveLastOrder } from '@/lib/orders/last-order';
import type { OrderInput } from '@/lib/schemas/order';
import type { PaymentMethod } from '@/lib/schemas/payment';
import type { ShippingConfig } from '@/lib/schemas/shipping';
import { estimateDelivery } from '@/lib/shipping/estimate';
import { useSelectedGovernorate } from '@/lib/shipping/selected-governorate';
import { computeTotals } from '@/lib/shipping/totals';
import { formatPrice, localize } from '@/lib/utils/format';
import { normalizeEgyptPhone } from '@/lib/utils/phone';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useState, useTransition } from 'react';
import { OrderSummary } from './order-summary';

type Props = { paymentMethods: PaymentMethod[]; config: ShippingConfig };

type FieldName = 'fullName' | 'phone' | 'email' | 'governorate' | 'city' | 'address' | 'terms';
type ErrorKey = 'name' | 'phone' | 'email' | 'required' | 'address' | 'terms';

type Values = {
    fullName: string;
    phone: string;
    email: string;
    governorate: string;
    city: string;
    address: string;
    landmark: string;
    notes: string;
    paymentMethod: PaymentMethod['id'];
    terms: boolean;
};

const FIELD_ORDER: FieldName[] = [
    'fullName',
    'phone',
    'email',
    'governorate',
    'city',
    'address',
    'terms'
];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(field: FieldName, values: Values, governorate: string): ErrorKey | undefined {
    switch (field) {
        case 'fullName':
            return values.fullName.trim().length >= 3 ? undefined : 'name';
        case 'phone':
            return normalizeEgyptPhone(values.phone) ? undefined : 'phone';
        case 'email':
            return !values.email.trim() || EMAIL.test(values.email.trim()) ? undefined : 'email';
        case 'governorate':
            return governorate ? undefined : 'required';
        case 'city':
            return values.city.trim().length >= 2 ? undefined : 'required';
        case 'address':
            return values.address.trim().length >= 8 ? undefined : 'address';
        case 'terms':
            return values.terms ? undefined : 'terms';
    }
}

type TextFieldProps = {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: string;
    hint?: string;
    type?: string;
    autoComplete?: string;
    inputMode?: 'text' | 'numeric' | 'tel' | 'email';
    dir?: 'ltr' | 'rtl';
    placeholder?: string;
    multiline?: boolean;
};

function TextField({
    id,
    label,
    value,
    onChange,
    onBlur,
    error,
    hint,
    type = 'text',
    autoComplete,
    inputMode,
    dir,
    placeholder,
    multiline = false
}: TextFieldProps) {
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    const describedBy =
        [hint && !error ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') ||
        undefined;
    const shared = {
        id,
        value,
        placeholder,
        autoComplete,
        dir,
        'aria-invalid': Boolean(error),
        'aria-describedby': describedBy,
        onBlur
    };
    const border = error ? 'border-clay' : 'border-line';

    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
                {label}
            </label>

            {multiline ? (
                <textarea
                    {...shared}
                    rows={3}
                    onChange={(event) => onChange(event.target.value)}
                    className={`w-full rounded-2xl border bg-surface/70 px-4 py-3 text-sm ${border}`}
                />
            ) : (
                <input
                    {...shared}
                    type={type}
                    inputMode={inputMode}
                    onChange={(event) => onChange(event.target.value)}
                    className={`h-12 w-full rounded-full border bg-surface/70 px-5 text-sm ${border}`}
                />
            )}

            {hint && !error && (
                <p id={hintId} className="mt-1 text-xs text-muted">
                    {hint}
                </p>
            )}
            {error && (
                <p id={errorId} role="alert" className="mt-1.5 text-sm font-medium text-clay">
                    {error}
                </p>
            )}
        </div>
    );
}

export function CheckoutForm({ paymentMethods, config }: Props) {
    const t = useTranslations('Checkout');
    const tp = useTranslations('Purchase');
    const locale = useLocale() as Locale;
    const router = useRouter();
    const uid = useId();
    const [isPending, startTransition] = useTransition();

    const { items } = useCart();
    const [savedGovernorate, setSavedGovernorate] = useSelectedGovernorate();

    const [mounted, setMounted] = useState(false);
    const [today, setToday] = useState<Date | null>(null);
    const [redirecting, setRedirecting] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<FieldName, ErrorKey>>>({});
    const [submitError, setSubmitError] = useState<{
        code: 'invalid' | 'out_of_stock' | 'unavailable';
        name?: string;
    } | null>(null);

    const [values, setValues] = useState<Values>({
        fullName: '',
        phone: '',
        email: '',
        governorate: '',
        city: '',
        address: '',
        landmark: '',
        notes: '',
        paymentMethod: paymentMethods[0]?.id ?? 'cod',
        terms: false
    });

    // السلة والتاريخ بعد الـ mount بس (عشان مفيش اختلاف بين السيرفر والمتصفح)
    useEffect(() => {
        setMounted(true);
        setToday(new Date());
    }, []);

    // المحافظة: اللي اختارها العميل هنا، وإلا اللي اختارها قبل كده في السلة أو صفحة المنتج
    const governorate = values.governorate || savedGovernorate || '';

    const totals = computeTotals(items, config, governorate || null);
    const prepDays = items.reduce(
        (max, item) => Math.max(max, item.madeToOrder ? Math.max(item.leadTimeDays ?? 1, 1) : 1),
        1
    );
    const estimate =
        governorate && today
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

    const governorates = [...config.governorates].sort((a, b) =>
        localize(a.name, locale).localeCompare(localize(b.name, locale), locale)
    );

    const fieldId = (field: FieldName) => `${uid}-${field}`;
    const errorText = (field: FieldName) => {
        const key = errors[field];
        return key ? t(`errors.${key}`) : undefined;
    };

    function setValue<K extends keyof Values>(key: K, value: Values[K]) {
        setValues((current) => ({ ...current, [key]: value }));
        if (key in errors) {
            setErrors((current) => ({ ...current, [key]: undefined }));
        }
    }

    function blur(field: FieldName) {
        setErrors((current) => ({ ...current, [field]: validate(field, values, governorate) }));
    }

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isPending) return;

        const nextErrors: Partial<Record<FieldName, ErrorKey>> = {};
        for (const field of FIELD_ORDER) {
            const error = validate(field, values, governorate);
            if (error) nextErrors[field] = error;
        }
        setErrors(nextErrors);
        setSubmitError(null);

        const firstInvalid = FIELD_ORDER.find((field) => nextErrors[field]);
        if (firstInvalid) {
            document.getElementById(fieldId(firstInvalid))?.focus();
            return;
        }

        const payload: OrderInput = {
            items: items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                customization: item.customization,
                gift: item.gift
            })),
            customer: {
                fullName: values.fullName.trim(),
                phone: normalizeEgyptPhone(values.phone),
                email: values.email.trim(),
                governorate,
                city: values.city.trim(),
                address: values.address.trim(),
                landmark: values.landmark.trim() || undefined,
                notes: values.notes.trim() || undefined,
                paymentMethod: values.paymentMethod
            },
            locale
        };

        startTransition(async () => {
            const response = await submitOrder(payload);

            if (!response.ok) {
                const product = response.detail
                    ? items.find((item) => item.slug === response.detail)
                    : undefined;
                setSubmitError({
                    code: response.code,
                    name: product ? localize(product.name, locale) : undefined
                });
                return;
            }

            const { result } = response;
            const governorateEntry = config.governorates.find((g) => g.slug === governorate);
            const method = paymentMethods.find((m) => m.id === values.paymentMethod);

            saveLastOrder({
                orderId: result.orderId,
                createdAt: new Date().toISOString(),
                locale,
                items,
                customer: {
                    fullName: payload.customer.fullName,
                    phone: payload.customer.phone,
                    email: payload.customer.email || undefined,
                    governorateName: governorateEntry?.name ?? { ar: governorate, en: governorate },
                    city: payload.customer.city,
                    address: payload.customer.address,
                    landmark: payload.customer.landmark,
                    notes: payload.customer.notes
                },
                paymentMethod: {
                    id: values.paymentMethod,
                    label: method?.label ?? { ar: values.paymentMethod, en: values.paymentMethod }
                },
                totals: {
                    subtotal: result.subtotal ?? totals.subtotal,
                    giftTotal: result.giftTotal ?? totals.giftTotal,
                    shippingFee: result.shippingFee ?? totals.shippingFee ?? 0,
                    total: result.total
                },
                delivery: estimate
                    ? { from: estimate.from.toISOString(), to: estimate.to.toISOString() }
                    : undefined
            });

            setRedirecting(true);
            cartActions.clear();

            if (result.redirectUrl) {
                window.location.assign(result.redirectUrl);
                return;
            }
            router.replace(`/order/${result.orderId}`);
        });
    }

    if (redirecting) {
        return (
            <div role="status" className="glass mt-8 rounded-[1.75rem] p-10 text-center">
                <p className="font-display text-2xl font-bold">{t('redirecting')}</p>
            </div>
        );
    }

    if (!mounted) {
        return (
            <div aria-busy="true" className="mt-8 grid gap-8 lg:grid-cols-12">
                <div className="glass h-96 rounded-[1.75rem] lg:col-span-7 motion-safe:animate-pulse" />
                <div className="glass h-80 rounded-[1.75rem] lg:col-span-5 motion-safe:animate-pulse" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="glass mt-8 rounded-[1.75rem] p-10 text-center">
                <p className="font-display text-2xl font-bold">{t('emptyTitle')}</p>
                <p className="mt-2 text-muted">{t('emptyText')}</p>
                <Link
                    href="/shop"
                    className="btn-primary mt-6 inline-flex h-12 items-center justify-center px-8 text-sm font-semibold"
                >
                    {t('backToShop')}
                </Link>
            </div>
        );
    }

    const submitMessage = submitError
        ? submitError.code === 'out_of_stock'
            ? submitError.name
                ? t('errors.outOfStock', { name: submitError.name })
                : t('errors.outOfStockGeneric')
            : submitError.code === 'invalid'
              ? t('errors.invalid')
              : t('errors.unavailable')
        : null;

    return (
        <form
            noValidate
            onSubmit={onSubmit}
            className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-start"
        >
            <div className="space-y-6 lg:col-span-7">
                <section
                    aria-labelledby={`${uid}-contact`}
                    className="glass space-y-4 rounded-[1.75rem] p-5 sm:p-7"
                >
                    <h2 id={`${uid}-contact`} className="font-display text-xl font-bold">
                        {t('sectionContact')}
                    </h2>

                    <TextField
                        id={fieldId('fullName')}
                        label={t('fullName')}
                        value={values.fullName}
                        onChange={(value) => setValue('fullName', value)}
                        onBlur={() => blur('fullName')}
                        error={errorText('fullName')}
                        autoComplete="name"
                    />

                    <TextField
                        id={fieldId('phone')}
                        label={t('phone')}
                        value={values.phone}
                        onChange={(value) => setValue('phone', value)}
                        onBlur={() => blur('phone')}
                        error={errorText('phone')}
                        hint={t('phoneHint')}
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        dir="ltr"
                        placeholder="01012345678"
                    />

                    <TextField
                        id={fieldId('email')}
                        label={t('email')}
                        value={values.email}
                        onChange={(value) => setValue('email', value)}
                        onBlur={() => blur('email')}
                        error={errorText('email')}
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        dir="ltr"
                    />
                </section>

                <section
                    aria-labelledby={`${uid}-address`}
                    className="glass space-y-4 rounded-[1.75rem] p-5 sm:p-7"
                >
                    <h2 id={`${uid}-address`} className="font-display text-xl font-bold">
                        {t('sectionAddress')}
                    </h2>

                    <div>
                        <label
                            htmlFor={fieldId('governorate')}
                            className="mb-1.5 block text-sm font-semibold"
                        >
                            {t('governorate')}
                        </label>
                        <select
                            id={fieldId('governorate')}
                            value={governorate}
                            aria-invalid={Boolean(errors.governorate)}
                            aria-describedby={
                                errors.governorate ? `${fieldId('governorate')}-error` : undefined
                            }
                            onChange={(event) => {
                                setValue('governorate', event.target.value);
                                setSavedGovernorate(event.target.value || null);
                            }}
                            onBlur={() => blur('governorate')}
                            className={`h-12 w-full rounded-full border bg-surface/70 px-5 text-sm ${
                                errors.governorate ? 'border-clay' : 'border-line'
                            }`}
                        >
                            <option value="">{t('governoratePlaceholder')}</option>
                            {governorates.map((g) => (
                                <option key={g.slug} value={g.slug}>
                                    {localize(g.name, locale)}
                                </option>
                            ))}
                        </select>
                        {errors.governorate && (
                            <p
                                id={`${fieldId('governorate')}-error`}
                                role="alert"
                                className="mt-1.5 text-sm font-medium text-clay"
                            >
                                {errorText('governorate')}
                            </p>
                        )}
                    </div>

                    <TextField
                        id={fieldId('city')}
                        label={t('city')}
                        value={values.city}
                        onChange={(value) => setValue('city', value)}
                        onBlur={() => blur('city')}
                        error={errorText('city')}
                        autoComplete="address-level2"
                    />

                    <TextField
                        id={fieldId('address')}
                        label={t('address')}
                        value={values.address}
                        onChange={(value) => setValue('address', value)}
                        onBlur={() => blur('address')}
                        error={errorText('address')}
                        hint={t('addressHint')}
                        autoComplete="address-line1"
                    />

                    <TextField
                        id={`${uid}-landmark`}
                        label={t('landmark')}
                        value={values.landmark}
                        onChange={(value) => setValue('landmark', value)}
                    />

                    <TextField
                        id={`${uid}-notes`}
                        label={t('notes')}
                        value={values.notes}
                        onChange={(value) => setValue('notes', value)}
                        multiline
                    />

                    <div aria-live="polite" className="rounded-2xl bg-fg/5 p-4 text-sm">
                        <p className="font-semibold">{t('deliveryTitle')}</p>
                        <p className="mt-1 text-muted">
                            {!governorate
                                ? t('deliveryPick')
                                : estimate
                                  ? totals.shippingFee === 0
                                      ? t('deliveryInfoFree', {
                                            from: formatDate.format(estimate.from),
                                            to: formatDate.format(estimate.to)
                                        })
                                      : t('deliveryInfo', {
                                            fee: formatPrice(
                                                totals.shippingFee ?? estimate.zone.fee,
                                                locale
                                            ),
                                            from: formatDate.format(estimate.from),
                                            to: formatDate.format(estimate.to)
                                        })
                                  : null}
                        </p>
                    </div>
                </section>

                <fieldset className="glass space-y-3 rounded-[1.75rem] p-5 sm:p-7">
                    <legend className="px-1 font-display text-xl font-bold">
                        {t('sectionPayment')}
                    </legend>

                    {paymentMethods.length === 0 && (
                        <p role="alert" className="text-sm font-medium text-clay">
                            {t('errors.noPayment')}
                        </p>
                    )}

                    {paymentMethods.map((method) => (
                        <label
                            key={method.id}
                            className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line p-4 transition has-checked:border-accent has-checked:bg-fg/5"
                        >
                            <input
                                type="radio"
                                name={`${uid}-payment`}
                                value={method.id}
                                checked={values.paymentMethod === method.id}
                                onChange={() => setValue('paymentMethod', method.id)}
                                className="mt-1 size-5 accent-[var(--brand)]"
                            />
                            <span>
                                <span className="block font-semibold">
                                    {localize(method.label, locale)}
                                </span>
                                {method.description && (
                                    <span className="mt-0.5 block text-sm text-muted">
                                        {localize(method.description, locale)}
                                    </span>
                                )}
                            </span>
                        </label>
                    ))}
                </fieldset>
            </div>

            <aside className="glass space-y-5 rounded-[1.75rem] p-5 sm:p-6 lg:sticky lg:top-28 lg:col-span-5">
                <OrderSummary items={items} totals={totals} locale={locale} />

                <div>
                    <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm">
                        <input
                            id={fieldId('terms')}
                            type="checkbox"
                            checked={values.terms}
                            aria-invalid={Boolean(errors.terms)}
                            aria-describedby={
                                errors.terms ? `${fieldId('terms')}-error` : undefined
                            }
                            onChange={(event) => setValue('terms', event.target.checked)}
                            className="mt-0.5 size-5 shrink-0 accent-[var(--brand)]"
                        />
                        <span>
                            {t.rich('terms', {
                                termsLink: (chunks) => (
                                    <Link
                                        href="/terms"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold text-accent underline-offset-4 hover:underline"
                                    >
                                        {chunks}
                                    </Link>
                                ),
                                privacyLink: (chunks) => (
                                    <Link
                                        href="/privacy"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold text-accent underline-offset-4 hover:underline"
                                    >
                                        {chunks}
                                    </Link>
                                )
                            })}
                        </span>
                    </label>
                    {errors.terms && (
                        <p
                            id={`${fieldId('terms')}-error`}
                            role="alert"
                            className="mt-1.5 text-sm font-medium text-clay"
                        >
                            {errorText('terms')}
                        </p>
                    )}
                </div>

                {submitMessage && (
                    <p
                        role="alert"
                        className="rounded-2xl border border-clay p-4 text-sm font-medium text-clay"
                    >
                        {submitMessage}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={isPending || paymentMethods.length === 0}
                    className="btn-primary flex h-14 w-full items-center justify-center text-base font-semibold"
                >
                    {isPending ? t('placing') : t('placeOrder')}
                </button>

                <p className="text-center text-xs text-muted">{tp('trustCod')}</p>

                <Link
                    href="/cart"
                    className="flex min-h-11 items-center justify-center text-sm font-semibold text-muted transition hover:text-fg"
                >
                    {t('backToCart')}
                </Link>
            </aside>
        </form>
    );
}
