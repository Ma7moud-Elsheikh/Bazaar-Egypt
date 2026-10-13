type Props = {
    /** النقش الهندسي: للـ hero والفوتر بس */
    pattern?: boolean;
    /** light = لصفحات المتجر الفاتحة */
    tone?: 'dark' | 'light';
    className?: string;
};

const BLOBS = {
    dark: ['bg-copper/55', 'bg-clay/65', 'bg-gold/35'],
    light: ['bg-copper-light/45', 'bg-clay/25', 'bg-gold/30']
} as const;

/** الأب لازم يكون: relative isolate overflow-hidden */
export function AmbientBackground({ pattern = false, tone = 'dark', className = '' }: Props) {
    const [a, b, c] = BLOBS[tone];

    return (
        <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
        >
            <div className={`absolute -top-32 -start-32 size-[34rem] rounded-full blur-2xl ${a}`} />
            <div className={`absolute top-1/3 -end-40 size-[30rem] rounded-full blur-2xl ${b}`} />
            <div
                className={`absolute -bottom-40 start-1/4 size-[26rem] rounded-full blur-2xl ${c}`}
            />
            {pattern && <div className="absolute inset-0 bg-lattice mask-fade opacity-10" />}
        </div>
    );
}
