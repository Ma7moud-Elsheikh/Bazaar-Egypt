import { Breadcrumbs } from '@/components/product/breadcrumbs';
import { CashIcon, ChatIcon } from '@/components/product/icons';
import { JsonLd } from '@/components/seo/json-ld';
import { ContactForm } from '@/components/static/contact-form';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { Reveal } from '@/components/ui/reveal';
import { routing } from '@/i18n/routing';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { buildAlternates } from '@/lib/seo';
import { CONTACT_EMAIL, CONTACT_PHONE, WHATSAPP_NUMBER, whatsappLink } from '@/lib/site';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale: rawLocale } = await params;
    const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale;
    const t = await getTranslations({ locale, namespace: 'Pages' });

    return {
        title: t('contact.metaTitle'),
        description: t('contact.metaDescription'),
        alternates: buildAlternates(locale, '/contact')
    };
}

export default async function ContactPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    const t = await getTranslations('Pages');
    const tn = await getTranslations('Nav');

    const whatsapp = whatsappLink(t('contact.greeting'));

    const channels = [
        ...(whatsapp
            ? [
                  {
                      key: 'whatsapp',
                      icon: ChatIcon,
                      title: t('contact.whatsapp'),
                      text: t('contact.whatsappText'),
                      href: whatsapp,
                      external: true
                  }
              ]
            : []),
        ...(CONTACT_EMAIL
            ? [
                  {
                      key: 'email',
                      icon: ChatIcon,
                      title: t('contact.email'),
                      text: CONTACT_EMAIL,
                      href: `mailto:${CONTACT_EMAIL}`,
                      external: false
                  }
              ]
            : []),
        ...(CONTACT_PHONE
            ? [
                  {
                      key: 'phone',
                      icon: CashIcon,
                      title: t('contact.phone'),
                      text: CONTACT_PHONE,
                      href: `tel:${CONTACT_PHONE.replace(/[^\d+]/g, '')}`,
                      external: false
                  }
              ]
            : [])
    ];

    return (
        <>
            <JsonLd
                data={breadcrumbJsonLd(locale, [
                    { name: tn('home'), path: '/' },
                    { name: t('contact.title') }
                ])}
            />

            <section className="relative isolate overflow-hidden px-4 pt-28 pb-8 sm:px-8">
                <AmbientBackground tone="light" />
                <div className="mx-auto max-w-6xl">
                    <Breadcrumbs
                        items={[{ label: tn('home'), href: '/' }, { label: t('contact.title') }]}
                        label={t('common.breadcrumb')}
                    />
                    <p className="mt-6 text-sm font-semibold text-accent">{t('contact.eyebrow')}</p>
                    <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
                        {t('contact.title')}
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg text-fg/85">{t('contact.subtitle')}</p>
                </div>
            </section>

            <section className="px-4 pb-24 sm:px-8">
                <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                        <h2 className="font-display text-2xl font-bold">
                            {t('contact.channelsTitle')}
                        </h2>

                        {channels.length > 0 ? (
                            <ul className="mt-4 space-y-3">
                                {channels.map(
                                    ({ key, icon: Icon, title, text, href, external }, index) => (
                                        <Reveal
                                            as="li"
                                            key={key}
                                            delay={Math.min(index, 6) * 60}
                                        >
                                            <a
                                                href={href}
                                                {...(external
                                                    ? {
                                                          target: '_blank',
                                                          rel: 'noopener noreferrer'
                                                      }
                                                    : {})}
                                                className="glass flex min-h-16 items-center gap-4 rounded-2xl p-4 transition duration-300 ease-craft hover:-translate-y-0.5"
                                            >
                                                <Icon className="size-6 shrink-0 text-accent" />
                                                <span>
                                                    <span className="block font-semibold">
                                                        {title}
                                                    </span>
                                                    <span
                                                        className="block text-sm text-muted"
                                                        dir="auto"
                                                    >
                                                        {text}
                                                    </span>
                                                </span>
                                            </a>
                                        </Reveal>
                                    )
                                )}
                            </ul>
                        ) : (
                            <p className="mt-4 text-muted">{t('contact.noChannels')}</p>
                        )}
                    </div>

                    <div className="glass rounded-[1.75rem] p-6 sm:p-8 lg:col-span-7">
                        <h2 className="font-display text-2xl font-bold">
                            {t('contact.formTitle')}
                        </h2>
                        <p className="mt-2 mb-6 text-muted">{t('contact.formIntro')}</p>
                        <ContactForm whatsappNumber={WHATSAPP_NUMBER} />
                    </div>
                </div>
            </section>
        </>
    );
}
