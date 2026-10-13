'use client';

import { CloseIcon } from '@/components/ui/icons';
import { cartActions, useCart } from '@/lib/cart/cart-store';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { CartLine } from './cart-line';
import { CartSummary } from './cart-summary';

export function CartDrawer() {
    const t = useTranslations('Cart');
    const { items, isOpen, count } = useCart();
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (isOpen && !dialog.open) dialog.showModal();
        if (!isOpen && dialog.open) dialog.close();
    }, [isOpen]);

    useEffect(() => {
        document.documentElement.style.overflow = isOpen ? 'hidden' : '';
        return () => {
            document.documentElement.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <dialog
            ref={dialogRef}
            data-theme="dark"
            aria-labelledby="cart-title"
            onClose={cartActions.close}
            onClick={(event) => {
                if (event.target === event.currentTarget) cartActions.close();
            }}
            className="glass fixed inset-y-0 end-0 start-auto m-0 h-dvh max-h-none w-full max-w-md overflow-hidden p-0 text-fg backdrop:bg-espresso/60 backdrop:backdrop-blur-sm open:animate-drawer-in"
        >
            <div className="flex h-full flex-col">
                <header className="flex items-center justify-between border-b border-line px-6 py-4">
                    <h2 id="cart-title" className="font-display text-xl font-bold">
                        {t('title')}
                        {count > 0 && (
                            <span className="ms-2 text-base font-normal text-muted">({count})</span>
                        )}
                    </h2>
                    <button
                        type="button"
                        aria-label={t('close')}
                        onClick={cartActions.close}
                        className="btn-glass inline-flex size-11 items-center justify-center"
                    >
                        <CloseIcon className="size-5" />
                    </button>
                </header>

                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
                        <p className="font-display text-2xl font-bold">{t('emptyTitle')}</p>
                        <p className="text-muted">{t('emptyText')}</p>
                        <button
                            type="button"
                            onClick={cartActions.close}
                            className="btn-glass mt-2 inline-flex h-11 items-center justify-center px-6 text-sm font-semibold"
                        >
                            {t('continueShopping')}
                        </button>
                    </div>
                ) : (
                    <>
                        <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto px-6">
                            {items.map((item) => (
                                <li key={item.lineId}>
                                    <CartLine item={item} onNavigate={cartActions.close} />
                                </li>
                            ))}
                        </ul>

                        <footer className="max-h-[60dvh] overflow-y-auto border-t border-line px-6 py-5">
                            <CartSummary variant="drawer" onNavigate={cartActions.close} />
                        </footer>
                    </>
                )}
            </div>
        </dialog>
    );
}
