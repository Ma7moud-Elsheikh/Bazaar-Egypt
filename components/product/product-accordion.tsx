import { ChevronIcon } from '@/components/ui/icons';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import type { Product } from '@/lib/schemas/catalog';
import { localize } from '@/lib/utils/format';
import { getTranslations } from 'next-intl/server';

type Props = { product: Product; locale: Locale; returnDays: number };

function Section({
    title,
    open,
    children
}: {
    title: string;
    open?: boolean;
    children: React.ReactNode;
}) {
    return (
        <details open={open} className="group border-b border-line">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-lg font-bold [&::-webkit-details-marker]:hidden">
                {title}
                <ChevronIcon className="size-5 shrink-0 text-muted transition duration-300 group-open:rotate-90 rtl:-scale-x-100" />
            </summary>
            <div className="pb-5 leading-relaxed text-fg/90">{children}</div>
        </details>
    );
}

export async function ProductAccordion({ product, locale, returnDays }: Props) {
    const t = await getTranslations('ProductPage');

    const paragraphs = localize(product.description, locale)
        .split(/\n{2,}/)
        .filter(Boolean);
    const dims = product.dimensions;
    const grams = dims?.weightGrams;

    return (
        <div className="mt-8 border-t border-line">
            <Section title={t('descriptionTitle')} open>
                <div className="space-y-3">
                    {paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                    ))}
                </div>
            </Section>

            <Section title={t('detailsTitle')}>
                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                    {product.materials.length > 0 && (
                        <>
                            <dt className="font-semibold text-muted">{t('materials')}</dt>
                            <dd>{product.materials.map((m) => localize(m, locale)).join('، ')}</dd>
                        </>
                    )}
                    {dims && (
                        <>
                            <dt className="font-semibold text-muted">{t('size')}</dt>
                            <dd>
                                {dims.depthCm
                                    ? t('dimensions3', {
                                          w: dims.widthCm,
                                          h: dims.heightCm,
                                          d: dims.depthCm
                                      })
                                    : t('dimensions2', { w: dims.widthCm, h: dims.heightCm })}
                            </dd>
                        </>
                    )}
                    {grams && (
                        <>
                            <dt className="font-semibold text-muted">{t('weight')}</dt>
                            <dd>
                                {grams >= 1000
                                    ? t('weightKg', { value: (grams / 1000).toFixed(1) })
                                    : t('weightGrams', { value: grams })}
                            </dd>
                        </>
                    )}
                    <dt className="font-semibold text-muted">{t('madeIn')}</dt>
                    <dd>{localize(product.governorate.name, locale)}</dd>
                </dl>
            </Section>

            <Section title={t('shippingTitle')}>
                <p>{t('shippingText')}</p>
                <p className="mt-2">{t('returnText', { days: returnDays })}</p>
                <Link
                    href="/returns"
                    className="mt-3 inline-flex min-h-11 items-center font-semibold text-accent underline-offset-4 hover:underline"
                >
                    {t('returnsLink')}
                </Link>
            </Section>

            {product.careInstructions && (
                <Section title={t('careTitle')}>
                    <p>{localize(product.careInstructions, locale)}</p>
                </Section>
            )}
        </div>
    );
}
