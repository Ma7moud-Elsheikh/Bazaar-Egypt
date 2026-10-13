const btnPrimary =
    'btn-primary inline-flex h-11 items-center justify-center px-6 text-sm font-semibold';
const btnGhost =
    'btn-glass inline-flex h-11 items-center justify-center px-6 text-sm font-semibold';

const palette = [
    { name: 'cream', hex: '#F6EEE2', cls: 'bg-cream' },
    { name: 'sand', hex: '#E8D5B7', cls: 'bg-sand' },
    { name: 'parchment', hex: '#EBDCC3', cls: 'bg-parchment' },
    { name: 'clay', hex: '#A5492F', cls: 'bg-clay' },
    { name: 'copper', hex: '#B87333', cls: 'bg-copper' },
    { name: 'copper-deep', hex: '#8A5320', cls: 'bg-copper-deep' },
    { name: 'copper-light', hex: '#D79A5B', cls: 'bg-copper-light' },
    { name: 'gold', hex: '#D9A441', cls: 'bg-gold' },
    { name: 'olive', hex: '#5E6B3A', cls: 'bg-olive' },
    { name: 'ink', hex: '#2B1D14', cls: 'bg-ink' },
    { name: 'espresso', hex: '#1A1410', cls: 'bg-espresso' },
    { name: 'espresso-2', hex: '#2A2019', cls: 'bg-espresso-2' }
];

const fonts = [
    { name: 'Reem Kufi', sample: 'بازار مصر — حرفة وهوية', cssVar: '--font-reem-kufi', rtl: true },
    {
        name: 'Aref Ruqaa',
        sample: 'الحرفة ليست مهنة، هي هوية',
        cssVar: '--font-aref-ruqaa',
        rtl: true
    },
    {
        name: 'IBM Plex Sans Arabic',
        sample: 'كل قطعة تحمل حكاية صانعها',
        cssVar: '--font-plex-arabic',
        rtl: true
    },
    {
        name: 'Cormorant Garamond',
        sample: 'Handmade in Egypt',
        cssVar: '--font-cormorant',
        rtl: false
    },
    {
        name: 'Inter',
        sample: 'Free shipping on orders over EGP 1,500',
        cssVar: '--font-inter',
        rtl: false
    }
];

const priceFormats = [
    { label: 'ar-EG (أرقام شرقية)', locale: 'ar-EG', rtl: true },
    { label: 'ar-EG (أرقام لاتينية)', locale: 'ar-EG-u-nu-latn', rtl: true },
    { label: 'en', locale: 'en', rtl: false }
];

function formatPrice(locale: string) {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EGP',
        maximumFractionDigits: 0
    }).format(1200);
}

export default function DesignLab() {
    return (
        <main>
            {/* ═════════ قسم غامق: hero + glass-dark ═════════ */}
            <section
                data-theme="dark"
                className="relative isolate overflow-hidden px-6 py-16 sm:px-10"
            >
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-24 -start-24 -z-10 size-96 rounded-full bg-copper/40 blur-3xl"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-32 -inset-e-16 -z-10 size-[28rem] rounded-full bg-clay/50 blur-3xl"
                />

                <div className="mx-auto max-w-6xl">
                    <nav className="glass-dark mb-14 flex items-center justify-between rounded-full px-6 py-3">
                        <span lang="ar" className="font-display text-lg">
                            بازار مصر
                        </span>
                        <span lang="en" dir="ltr" className="font-display text-lg">
                            Bazaar Egypt
                        </span>
                        <span className="text-sm text-muted">Glass navbar</span>
                    </nav>

                    <div className="grid gap-8 lg:grid-cols-2">
                        <article lang="ar" dir="rtl" className="glass-dark rounded-card p-8">
                            <p className="text-sm text-accent">الحرف المصرية</p>
                            <h1 className="mt-2 font-display text-5xl font-bold">بازار مصر</h1>
                            <p className="mt-4 text-muted">
                                منصة تجمع الحرف اليدوية المصرية الأصيلة. كل قطعة تحمل حكاية صانعها
                                وروح مكانها.
                            </p>
                            <p className="mt-6 font-accent text-3xl text-accent">
                                الحرفة ليست مهنة، هي هوية
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <button className={btnPrimary}>تسوّق الآن</button>
                                <button className={btnGhost}>اعرف حكاية الحرفي</button>
                            </div>
                        </article>

                        <article lang="en" dir="ltr" className="glass-dark rounded-card p-8">
                            <p className="text-sm uppercase tracking-[0.2em] text-accent">
                                Egyptian crafts
                            </p>
                            <h1 className="mt-2 font-display text-6xl font-semibold">
                                Bazaar Egypt
                            </h1>
                            <p className="mt-4 text-muted">
                                A marketplace for authentic Egyptian handmade crafts. Every piece
                                carries the story of its maker.
                            </p>
                            <p className="mt-6 font-accent text-3xl italic text-accent">
                                Craft is not a job, it is an identity
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <button className={btnPrimary}>Shop now</button>
                                <button className={btnGhost}>Meet the artisans</button>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            {/* ═════════ قسم فاتح: ألوان + خطوط + glass فاتح ═════════ */}
            <section className="px-6 py-16 sm:px-10">
                <div className="mx-auto max-w-6xl space-y-16">
                    <div>
                        <h2 className="text-3xl font-bold">1) الألوان</h2>
                        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                            {palette.map((p) => (
                                <div key={p.name}>
                                    <div
                                        className={`h-16 rounded-xl border border-line ${p.cls}`}
                                    />
                                    <p className="mt-2 text-sm font-medium">{p.name}</p>
                                    <p dir="ltr" className="text-xs text-muted">
                                        {p.hex}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold">
                            2) الخطوط (لازم كل صف يظهر بخط مختلف)
                        </h2>
                        <div className="mt-6 divide-y divide-line rounded-card border border-line bg-surface-2/40">
                            {fonts.map((f) => (
                                <div
                                    key={f.name}
                                    className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <span dir="ltr" className="text-sm text-muted">
                                        {f.name}
                                    </span>
                                    <p
                                        lang={f.rtl ? 'ar' : 'en'}
                                        dir={f.rtl ? 'rtl' : 'ltr'}
                                        style={{ fontFamily: `var(${f.cssVar})` }}
                                        className="text-2xl"
                                    >
                                        {f.sample}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold">3) تنسيق الأسعار (اختار الأرقام)</h2>
                        <ul className="mt-6 space-y-2">
                            {priceFormats.map((p) => (
                                <li
                                    key={p.locale}
                                    className="flex items-center justify-between rounded-xl border border-line px-5 py-3"
                                >
                                    <span dir="ltr" className="text-sm text-muted">
                                        {p.label}
                                    </span>
                                    <span
                                        lang={p.rtl ? 'ar' : 'en'}
                                        dir={p.rtl ? 'rtl' : 'ltr'}
                                        className="text-xl font-semibold"
                                    >
                                        {formatPrice(p.locale)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold">4) Glass فاتح فوق خلفية ملوّنة</h2>
                        <div className="relative mt-6 overflow-hidden rounded-3xl bg-linear-to-br from-sand via-copper-light/70 to-clay/60 p-6 sm:p-10">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <article
                                    lang="ar"
                                    dir="rtl"
                                    className="glass overflow-hidden rounded-card"
                                >
                                    <div className="aspect-[4/5] bg-linear-to-br from-copper via-clay to-espresso" />
                                    <div className="p-5">
                                        <p className="text-xs text-accent">النحاسيات</p>
                                        <h3 className="mt-1 text-xl font-semibold">
                                            صينية نحاس منقوشة يدويًا
                                        </h3>
                                        <p className="mt-1 text-sm text-muted">
                                            تحتاج 5 أيام تجهيز · صنع يدوي
                                        </p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="font-semibold">
                                                {formatPrice('ar-EG-u-nu-latn')}
                                            </span>
                                            <button className={btnPrimary}>أضف للسلة</button>
                                        </div>
                                    </div>
                                </article>

                                <article
                                    lang="en"
                                    dir="ltr"
                                    className="glass overflow-hidden rounded-card"
                                >
                                    <div className="aspect-[4/5] bg-linear-to-br from-olive via-copper to-ink" />
                                    <div className="p-5">
                                        <p className="text-xs text-accent">Copperware</p>
                                        <h3 className="mt-1 text-xl font-semibold">
                                            Hand-engraved copper tray
                                        </h3>
                                        <p className="mt-1 text-sm text-muted">
                                            Ready in 5 days · Handmade
                                        </p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="font-semibold">
                                                {formatPrice('en')}
                                            </span>
                                            <button className={btnPrimary}>Add to cart</button>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
