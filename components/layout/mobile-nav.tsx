'use client';

import { AmbientBackground } from '@/components/ui/ambient-background';
import { CloseIcon, MenuIcon } from '@/components/ui/icons';
import { Link, usePathname } from '@/i18n/navigation';
import { isActivePath } from '@/lib/utils/nav';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { LocaleSwitcher } from './locale-switcher';

type Props = { items: { href: string; label: string }[] };

export function MobileNav({ items }: Props) {
    const t = useTranslations('Nav');
    const locale = useLocale();
    const pathname = usePathname();
    const dialogRef = useRef<HTMLDialogElement>(null);

    const close = () => dialogRef.current?.close();

    useEffect(() => {
        dialogRef.current?.close();
    }, [locale, pathname]);

    return (
        <>
            <button
                type="button"
                aria-label={t('openMenu')}
                aria-haspopup="dialog"
                onClick={() => dialogRef.current?.showModal()}
                className="btn-glass inline-flex size-11 items-center justify-center lg:hidden"
            >
                <MenuIcon className="size-6" />
            </button>

            <dialog
                ref={dialogRef}
                data-theme="dark"
                aria-label={t('mainNavigation')}
                onClick={(event) => {
                    if (event.target === event.currentTarget) close();
                }}
                className="fixed inset-0 isolate m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-espresso/90 p-0 text-fg backdrop-blur-xl backdrop:bg-transparent open:animate-fade-in"
            >
                <AmbientBackground />

                <div className="flex h-full flex-col px-6 py-5">
                    <div className="flex justify-end">
                        <button
                            type="button"
                            aria-label={t('closeMenu')}
                            onClick={close}
                            className="btn-glass inline-flex size-11 items-center justify-center"
                        >
                            <CloseIcon className="size-6" />
                        </button>
                    </div>

                    <nav
                        aria-label={t('mainNavigation')}
                        className="mt-8 flex flex-1 flex-col gap-2"
                    >
                        {items.map((item) => {
                            const active = isActivePath(pathname, item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={close}
                                    aria-current={active ? 'page' : undefined}
                                    className={`rounded-2xl px-4 py-4 font-display text-3xl transition hover:bg-fg/10 ${
                                        active ? 'text-accent' : 'text-fg'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div>
                        <LocaleSwitcher />
                    </div>
                </div>
            </dialog>
        </>
    );
}
