import { QuickAddButton } from '@/components/cart/quick-add-button';
import { WishlistButton } from '@/components/shop/wishlist-button';
import { ChevronIcon, StarIcon } from '@/components/ui/icons';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { Product } from '@/lib/schemas/catalog';
import { formatPrice, localize } from '@/lib/utils/format';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

type Props = {
    product: Product;
    locale: Locale;
    /** اسم الحرفة: بيتقري للـ screen readers بس */
    craftName?: string;
    /** true = تحميل فوري لصور الصف الأول */
    eager?: boolean;
};

const SIZES = '(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw';
const BADGE_ORDER = ['bestseller', 'new', 'limited', 'giftable'] as const;

export async function ProductCard({ product, locale, craftName, eager = false }: Props) {
    const t = await getTranslations('Product');
    const [primary, secondary] = product.images;
    const name = localize(product.name, locale);
    const href = `/shop/${product.slug}`;

    const soldOut = !product.madeToOrder && product.stock < 1;
    const compareAt = product.compareAtPrice;
    const hasDiscount = compareAt !== undefined && compareAt > product.price;
    const discount = hasDiscount ? Math.round((1 - product.price / compareAt) * 100) : 0;

    // شارتين بالأولوية: نفدت الكمية > خصم > الأكثر مبيعًا/جديد/كمية محدودة/هدايا
    const chips = [
        ...(soldOut ? [{ label: t('soldOut'), highlight: false }] : []),
        ...(hasDiscount ? [{ label: t('discount', { percent: discount }), highlight: true }] : []),
        ...BADGE_ORDER.filter((badge) => product.badges.includes(badge)).map((badge) => ({
            label: t(`badges.${badge}`),
            highlight: false
        }))
    ].slice(0, 2);

    const showRating = product.reviewCount >= 3;
    const showLeadTime = product.madeToOrder && product.leadTimeDays > 0;
    const canQuickAdd = !soldOut && !product.customizable;

    return (
        <article className="group relative isolate overflow-hidden rounded-card bg-surface-2 shadow-[0_10px_30px_rgb(43_29_20/0.12)] transition duration-500 ease-craft hover:-translate-y-1 hover:shadow-[0_18px_44px_rgb(43_29_20/0.2)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
            <div className="relative aspect-[4/5]">
                <Image
                    src={primary.src}
                    alt={localize(primary.alt, locale)}
                    fill
                    sizes={SIZES}
                    loading={eager ? 'eager' : 'lazy'}
                    className={`object-cover transition duration-700 ease-craft group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${
                        soldOut ? 'opacity-70 saturate-50' : ''
                    }`}
                />
                {secondary && (
                    <Image
                        src={secondary.src}
                        alt=""
                        fill
                        sizes={SIZES}
                        className="object-cover opacity-0 transition duration-500 ease-craft group-hover:opacity-100 max-sm:hidden motion-reduce:transition-none"
                    />
                )}
            </div>

            {/* الكارت كله قابل للضغط بالماوس. الكيبورد والـ screen readers بيستخدموا رابط العنوان */}
            <Link href={href} tabIndex={-1} aria-hidden="true" className="absolute inset-0 z-[1]" />

            {chips.length > 0 && (
                <ul className="pointer-events-none absolute start-2 top-2 z-[2] flex max-w-[calc(100%-3.5rem)] flex-wrap gap-1.5 sm:start-3 sm:top-3 sm:max-w-[calc(100%-4.5rem)] sm:gap-2">
                    {chips.map((chip) => (
                        <li
                            key={chip.label}
                            data-theme="dark"
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold sm:px-3 sm:py-1 sm:text-xs ${
                                chip.highlight
                                    ? 'bg-brand font-bold text-on-brand'
                                    : 'glass-smoke-strong'
                            }`}
                        >
                            {chip.label}
                        </li>
                    ))}
                </ul>
            )}

            <div className="absolute end-2 top-2 z-[3] sm:end-3 sm:top-3">
                <WishlistButton productId={product.id} name={name} />
            </div>

            <div
                data-theme="dark"
                className="glass-smoke-strong pointer-events-none absolute inset-x-2 bottom-2 z-[2] rounded-2xl p-2.5 sm:inset-x-3 sm:bottom-3 sm:p-3.5"
            >
                {craftName && <p className="sr-only">{craftName}</p>}

                <h3 className="line-clamp-1 font-display text-[13px] leading-snug font-bold sm:line-clamp-2 sm:text-base">
                    <Link href={href} className="pointer-events-auto">
                        {name}
                    </Link>
                </h3>

                <div className="mt-1.5 flex items-end justify-between gap-2 sm:mt-2.5">
                    <div className="min-w-0">
                        <p className="flex flex-wrap items-baseline gap-x-2 text-sm font-bold sm:text-base">
                            <span>{formatPrice(product.price, locale)}</span>
                            {hasDiscount && (
                                <s className="text-xs font-normal text-fg/75">
                                    {formatPrice(compareAt, locale)}
                                </s>
                            )}
                        </p>

                        {(showRating || showLeadTime) && (
                            <p className="mt-0.5 hidden items-center gap-1.5 text-xs text-fg/75 sm:flex">
                                {showRating && (
                                    <span className="inline-flex items-center gap-1">
                                        <StarIcon className="size-3.5 text-gold" />
                                        <span aria-hidden>
                                            {product.rating.toFixed(1)} ({product.reviewCount})
                                        </span>
                                        <span className="sr-only">
                                            {t('rating', {
                                                rating: product.rating.toFixed(1),
                                                count: product.reviewCount
                                            })}
                                        </span>
                                    </span>
                                )}
                                {showRating && showLeadTime && <span aria-hidden>·</span>}
                                {showLeadTime && (
                                    <span>{t('leadTime', { days: product.leadTimeDays })}</span>
                                )}
                            </p>
                        )}
                    </div>

                    {canQuickAdd ? (
                        <QuickAddButton product={product} className="pointer-events-auto" />
                    ) : (
                        <Link
                            href={href}
                            aria-label={
                                soldOut
                                    ? t('viewProduct', { name })
                                    : t('chooseOptionsFor', { name })
                            }
                            className={`pointer-events-auto inline-flex size-11 shrink-0 items-center justify-center ${
                                soldOut ? 'btn-glass' : 'btn-primary'
                            }`}
                        >
                            <ChevronIcon className="size-5 rtl:-scale-x-100" />
                        </Link>
                    )}
                </div>
            </div>
        </article>
    );
}
