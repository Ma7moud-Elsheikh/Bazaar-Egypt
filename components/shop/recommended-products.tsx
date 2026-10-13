import { ProductCard } from "@/components/shop/product-card";
import type { Locale } from "@/i18n/routing";
import type { Craft, Product } from "@/lib/schemas/catalog";
import { localize } from "@/lib/utils/format";

type Props = {
  title: string;
  products: Product[];
  locale: Locale;
  crafts?: Craft[];
};

export function RecommendedProducts({ title, products, locale, crafts = [] }: Props) {
  if (products.length === 0) return null;

  const craftName = new Map(crafts.map((c) => [c.id, localize(c.name, locale)]));

  return (
    <section aria-labelledby="recommended-title" className="mt-16">
      <h2 id="recommended-title" className="font-display text-2xl font-bold sm:text-3xl">
        {title}
      </h2>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard
              product={product}
              locale={locale}
              craftName={craftName.get(product.craftId)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
