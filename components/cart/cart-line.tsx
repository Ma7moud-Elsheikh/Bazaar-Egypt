"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { GiftIcon } from "@/components/product/icons";
import { MinusIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cartActions } from "@/lib/cart/cart-store";
import type { CartItem } from "@/lib/schemas/cart";
import { formatPrice, localize } from "@/lib/utils/format";

type Props = {
  item: CartItem;
  /** بيتنادى لما الزائر يضغط على رابط المنتج (لقفل الـ drawer) */
  onNavigate?: () => void;
  large?: boolean;
};

export function CartLine({ item, onNavigate, large = false }: Props) {
  const t = useTranslations("Cart");
  const tp = useTranslations("Product");
  const locale = useLocale() as Locale;

  const name = localize(item.name, locale);
  const customization = item.customization ? Object.values(item.customization) : [];
  const leadDays =
    item.madeToOrder && (item.leadTimeDays ?? 0) > 0 ? item.leadTimeDays : null;
  const href = `/shop/${item.slug}`;

  return (
    <div className="flex gap-4 py-5">
      <Link
        href={href}
        onClick={onNavigate}
        tabIndex={-1}
        aria-hidden="true"
        className={`relative shrink-0 overflow-hidden rounded-xl bg-surface-2 ${
          large ? "size-28" : "size-24"
        }`}
      >
        <Image
          src={item.image.src}
          alt=""
          fill
          sizes={large ? "112px" : "96px"}
          className="object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={href}
            onClick={onNavigate}
            className="font-semibold leading-snug hover:text-accent"
          >
            {name}
          </Link>
          <button
            type="button"
            aria-label={t("remove", { name })}
            onClick={() => cartActions.remove(item.lineId)}
            className="grid size-11 shrink-0 place-items-center rounded-full text-muted transition hover:bg-fg/10 hover:text-fg"
          >
            <TrashIcon className="size-4" />
          </button>
        </div>

        <p className="text-xs text-muted">{t("unitPrice", { price: formatPrice(item.price, locale) })}</p>

        {customization.length > 0 && (
          <p className="mt-1 text-xs text-muted">
            {t("customized")}: {customization.join(" · ")}
          </p>
        )}

        {item.gift && (
          <p className="mt-1 flex items-start gap-1.5 text-xs text-muted">
            <GiftIcon className="mt-0.5 size-3.5 shrink-0 text-accent" />
            <span>
              {item.gift.wrap ? t("giftLabel") : null}
              {item.gift.wrap && item.gift.message ? " · " : null}
              {item.gift.message ? t("giftWithMessage", { message: item.gift.message }) : null}
            </span>
          </p>
        )}

        {leadDays && (
          <p className="mt-1 text-xs text-muted">{tp("leadTime", { days: leadDays })}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <div className="btn-glass inline-flex items-center">
            <button
              type="button"
              aria-label={t("decrease", { name })}
              disabled={item.quantity <= 1}
              onClick={() => cartActions.setQuantity(item.lineId, item.quantity - 1)}
              className="grid size-11 place-items-center rounded-full transition hover:bg-fg/10 disabled:opacity-40"
            >
              <MinusIcon className="size-4" />
            </button>
            <span aria-live="polite" className="min-w-8 text-center text-sm font-semibold">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label={t("increase", { name })}
              disabled={item.quantity >= item.maxQuantity}
              onClick={() => cartActions.setQuantity(item.lineId, item.quantity + 1)}
              className="grid size-11 place-items-center rounded-full transition hover:bg-fg/10 disabled:opacity-40"
            >
              <PlusIcon className="size-4" />
            </button>
          </div>

          <p className="font-semibold" aria-label={t("lineTotal", { name })}>
            {formatPrice(item.price * item.quantity, locale)}
          </p>
        </div>
      </div>
    </div>
  );
}
