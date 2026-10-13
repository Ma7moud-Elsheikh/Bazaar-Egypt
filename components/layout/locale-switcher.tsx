'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';

export function LocaleSwitcher() {
    const locale = useLocale() as Locale;
    const t = useTranslations('Common');
    const pathname = usePathname();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const nextLocale: Locale = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale;

    return (
        <button
            type="button"
            lang={nextLocale}
            aria-label={t('switchLanguageLabel')}
            disabled={isPending}
            onClick={() =>
                startTransition(() => {
                    router.replace(pathname, { locale: nextLocale });
                })
            }
            className="btn-glass inline-flex h-11 items-center cursor-pointer justify-center px-5 text-sm font-semibold"
        >
            {t('switchLanguage')}
        </button>
    );
}
