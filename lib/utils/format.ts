import type { Locale } from "@/i18n/routing";
import type { LocalizedText } from "@/lib/schemas/catalog";

// false = أرقام لاتينية (1,200) | true = أرقام شرقية (١٬٢٠٠)
const USE_ARABIC_INDIC_DIGITS = false;

export function localize(text: LocalizedText, locale: Locale): string {
  return text[locale];
}

export function formatPrice(amount: number, locale: Locale): string {
  const tag =
    locale === "ar"
      ? USE_ARABIC_INDIC_DIGITS
        ? "ar-EG"
        : "ar-EG-u-nu-latn"
      : "en";

  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(amount);
}
