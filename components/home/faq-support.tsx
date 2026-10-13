import { ChevronIcon } from '@/components/ui/icons';
import { Link } from '@/i18n/navigation';
import { whatsappLink } from '@/lib/site';
import { getTranslations } from 'next-intl/server';

type Props = { returnDays: number };

const FAQ_KEYS = ['delivery', 'cod', 'returns', 'custom'] as const;

export async function FaqSupport({ returnDays }: Props) {
    const t = await getTranslations('Home');
    const whatsapp = whatsappLink(t('whatsappMessage'));

    return (
        <section aria-labelledby="faq-title" className="px-4 py-16 sm:px-8 sm:py-24">
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-12">
                <div className="lg:col-span-7">
                    <h2 id="faq-title" className="font-display text-3xl font-bold sm:text-4xl">
                        {t('faqTitle')}
                    </h2>

                    <div className="mt-6 border-t border-line">
                        {FAQ_KEYS.map((key) => (
                            <details key={key} className="group border-b border-line">
                                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-lg font-bold [&::-webkit-details-marker]:hidden">
                                    {t(`faq.${key}.q`)}
                                    <ChevronIcon className="size-5 shrink-0 text-muted transition duration-300 group-open:rotate-90 rtl:-scale-x-100" />
                                </summary>
                                <p className="pb-5 leading-relaxed text-fg/90">
                                    {t(`faq.${key}.a`, { days: returnDays })}
                                </p>
                            </details>
                        ))}
                    </div>

                    <Link
                        href="/faq"
                        className="mt-5 inline-flex min-h-11 items-center font-semibold text-accent underline-offset-4 hover:underline"
                    >
                        {t('faqAll')}
                    </Link>
                </div>

                <aside className="glass h-fit rounded-[1.75rem] p-6 sm:p-8 lg:col-span-5">
                    <h3 className="font-display text-2xl font-bold">{t('supportTitle')}</h3>
                    <p className="mt-2 text-muted">{t('supportText')}</p>
                    {whatsapp && (
                        <a
                            href={whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary mt-6 inline-flex h-12 items-center justify-center px-8 text-sm font-semibold"
                        >
                            {t('supportCta')}
                        </a>
                    )}
                </aside>
            </div>
        </section>
    );
}
