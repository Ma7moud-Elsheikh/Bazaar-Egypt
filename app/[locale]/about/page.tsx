import { JsonLd } from '@/components/seo/json-ld';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { Reveal } from '@/components/ui/reveal';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { buildAlternates } from '@/lib/seo';
import { toCards, toStrings } from '@/lib/static-content';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale: rawLocale } = await params;
    const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;
    const t = await getTranslations({ locale, namespace: 'Pages' });

    return {
        title: t('about.metaTitle'),
        description: t('about.metaDescription'),
        alternates: buildAlternates(locale, '/about')
    };
}

export default async function AboutPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    const t = await getTranslations('Pages');
    const tn = await getTranslations('Nav');

    const story = toStrings(t.raw('about.story'));
    const how = toCards(t.raw('about.how'));
    const values = toCards(t.raw('about.values'));

    return (
        <>
            <JsonLd
                data={breadcrumbJsonLd(locale, [
                    { name: tn('home'), path: '/' },
                    { name: t('about.title') }
                ])}
            />

            <section
                data-theme="dark"
                className="relative isolate overflow-hidden px-4 pt-32 pb-20 sm:px-8 lg:pt-40 lg:pb-28"
            >
                <AmbientBackground pattern />
                <div className="mx-auto max-w-6xl">
                    <p className="text-sm font-semibold text-accent">{t('about.eyebrow')}</p>
                    <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold sm:text-6xl">
                        {t('about.title')}
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg text-fg/85">{t('about.subtitle')}</p>
                </div>
            </section>

            <section aria-labelledby="story-title" className="px-4 py-16 sm:px-8 sm:py-24">
                <Reveal className="mx-auto max-w-3xl">
                    <h2 id="story-title" className="font-display text-3xl font-bold sm:text-4xl">
                        {t('about.storyTitle')}
                    </h2>
                    <div className="mt-5 space-y-5 text-lg leading-9 text-fg/90">
                        {story.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                        ))}
                    </div>
                </Reveal>
            </section>

            {how.length > 0 && (
                <section
                    aria-labelledby="how-title"
                    className="bg-surface-2/50 px-4 py-16 sm:px-8 sm:py-20"
                >
                    <div className="mx-auto max-w-6xl">
                        <h2 id="how-title" className="font-display text-3xl font-bold sm:text-4xl">
                            {t('about.howTitle')}
                        </h2>
                        <ol className="mt-8 grid gap-5 md:grid-cols-3">
                            {how.map((step, index) => (
                                <Reveal
                                    as="li"
                                    key={step.title}
                                    delay={Math.min(index, 6) * 60}
                                    className="glass rounded-[1.75rem] p-6"
                                >
                                    <span className="grid size-10 place-items-center rounded-full bg-brand font-bold text-on-brand">
                                        {index + 1}
                                    </span>
                                    <h3 className="mt-4 font-display text-xl font-bold">
                                        {step.title}
                                    </h3>
                                    <p className="mt-2 text-fg/85">{step.text}</p>
                                </Reveal>
                            ))}
                        </ol>
                    </div>
                </section>
            )}

            {values.length > 0 && (
                <section aria-labelledby="values-title" className="px-4 py-16 sm:px-8 sm:py-24">
                    <div className="mx-auto max-w-6xl">
                        <h2
                            id="values-title"
                            className="font-display text-3xl font-bold sm:text-4xl"
                        >
                            {t('about.valuesTitle')}
                        </h2>
                        <ul className="mt-8 grid gap-5 md:grid-cols-3">
                            {values.map((value, index) => (
                                <Reveal
                                    as="li"
                                    key={value.title}
                                    delay={Math.min(index, 6) * 60}
                                    className="rounded-[1.75rem] border border-line p-6"
                                >
                                    <h3 className="font-display text-xl font-bold text-accent">
                                        {value.title}
                                    </h3>
                                    <p className="mt-2 text-fg/85">{value.text}</p>
                                </Reveal>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            <section
                data-theme="dark"
                aria-labelledby="cta-title"
                className="relative isolate overflow-hidden px-4 py-16 text-center sm:px-8 sm:py-24"
            >
                <AmbientBackground />
                <Reveal className="mx-auto max-w-2xl">
                    <h2 id="cta-title" className="font-display text-3xl font-bold sm:text-4xl">
                        {t('about.ctaTitle')}
                    </h2>
                    <p className="mt-3 text-fg/85">{t('about.ctaText')}</p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Link
                            href="/shop"
                            className="btn-primary inline-flex h-12 items-center justify-center px-8 text-sm font-semibold"
                        >
                            {t('about.ctaShop')}
                        </Link>
                        <Link
                            href="/contact"
                            className="btn-glass inline-flex h-12 items-center justify-center px-8 text-sm font-semibold"
                        >
                            {t('about.ctaContact')}
                        </Link>
                    </div>
                </Reveal>
            </section>
        </>
    );
}
