import { routing, type Locale } from "@/i18n/routing";

export function buildAlternates(locale: Locale, path: string, search = "") {
  const clean = path === "/" ? "" : path;

  return {
    canonical: `/${locale}${clean}${search}`,
    languages: {
      ...Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}${clean}${search}`]),
      ),
      "x-default": `/${routing.defaultLocale}${clean}${search}`,
    },
  };
}
