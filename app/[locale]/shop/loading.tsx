import { ProductCardSkeleton } from '@/components/shop/product-card-skeleton';
import { AmbientBackground } from '@/components/ui/ambient-background';

export default function ShopLoading() {
    return (
        <>
            <section className="relative isolate overflow-hidden px-4 pt-28 pb-10 sm:px-8">
                <AmbientBackground tone="light" />
                <div aria-hidden className="mx-auto max-w-6xl">
                    <div className="h-4 w-20 rounded-full bg-fg/10" />
                    <div className="mt-3 h-10 w-2/3 rounded-2xl bg-fg/10 sm:h-12" />
                    <div className="glass mt-8 h-44 rounded-[1.75rem]" />
                </div>
            </section>

            <section aria-busy="true" className="px-4 pb-24 sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 8 }, (_, index) => (
                            <li key={index}>
                                <ProductCardSkeleton />
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </>
    );
}
