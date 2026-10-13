export function ProductCardSkeleton() {
    return (
        <div
            aria-hidden
            className="relative aspect-[4/5] overflow-hidden rounded-card bg-surface-2 motion-safe:animate-pulse"
        >
            <div className="absolute inset-x-2 bottom-2 rounded-2xl bg-fg/10 p-3 sm:inset-x-3 sm:bottom-3 sm:p-4">
                <div className="h-3 w-3/4 rounded-full bg-fg/15" />
                <div className="mt-3 flex items-end justify-between">
                    <div className="h-4 w-1/3 rounded-full bg-fg/15" />
                    <div className="size-11 rounded-full bg-fg/15" />
                </div>
            </div>
        </div>
    );
}
