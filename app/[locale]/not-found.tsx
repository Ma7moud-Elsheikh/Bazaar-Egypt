import { AmbientBackground } from '@/components/ui/ambient-background';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function NotFound() {
    const t = useTranslations('NotFound');

    return (
        <section
            data-theme="dark"
            className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-6 pt-28 pb-16"
        >
            <AmbientBackground />

            <div className="glass w-full max-w-xl rounded-4xl p-8 text-center sm:p-14">
                <p
                    aria-hidden
                    className="font-display text-[7rem] leading-none font-bold text-accent sm:text-[10rem]"
                >
                    404
                </p>
                <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{t('title')}</h1>
                <p className="mt-3 text-fg/80">{t('text')}</p>
                <Link
                    href="/"
                    className="btn-primary mt-8 inline-flex h-12 items-center justify-center px-7 text-sm font-semibold"
                >
                    {t('home')}
                </Link>
            </div>
        </section>
    );
}
