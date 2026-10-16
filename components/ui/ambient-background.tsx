type Props = {
    /** النقش الهندسي: للـ hero والفوتر بس */
    pattern?: boolean;
    /** light = لصفحات المتجر الفاتحة */
    tone?: 'dark' | 'light';
    className?: string;
};

const BLOBS = {
    dark: [
        'bg-[radial-gradient(closest-side,rgb(184_115_51/0.55),transparent)]',
        'bg-[radial-gradient(closest-side,rgb(165_73_47/0.65),transparent)]',
        'bg-[radial-gradient(closest-side,rgb(217_164_65/0.35),transparent)]'
    ],
    light: [
        'bg-[radial-gradient(closest-side,rgb(215_154_91/0.45),transparent)]',
        'bg-[radial-gradient(closest-side,rgb(165_73_47/0.25),transparent)]',
        'bg-[radial-gradient(closest-side,rgb(217_164_65/0.3),transparent)]'
    ]
} as const;

/** الأب لازم يكون: relative isolate overflow-hidden */
export function AmbientBackground({ pattern = false, tone = 'dark', className = '' }: Props) {
    const [a, b, c] = BLOBS[tone];

    return (
        <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
        >
            <div className={`absolute -top-48 -start-48 size-[44rem] rounded-full ${a}`} />
            <div className={`absolute top-1/4 -end-56 size-[40rem] rounded-full ${b}`} />
            <div className={`absolute -bottom-56 start-1/4 size-[34rem] rounded-full ${c}`} />
            {pattern && <div className="absolute inset-0 bg-lattice mask-fade opacity-20" />}
        </div>
    );
}
