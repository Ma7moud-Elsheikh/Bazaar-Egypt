'use client';

import { CloseIcon, SearchIcon } from '@/components/ui/icons';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { SearchBox } from './search-box';

export function SearchDialog() {
    const t = useTranslations('SearchBox');
    const dialogRef = useRef<HTMLDialogElement>(null);
    // بيتغيّر بعد كل قفل عشان الحقل والاقتراحات يبدأوا من الأول
    const [resetKey, setResetKey] = useState(0);

    const open = () => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        dialog.showModal();
        // التركيز في نفس الضغطة عشان لوحة المفاتيح تفتح على iOS
        dialog.querySelector('input')?.focus();
    };

    const close = () => dialogRef.current?.close();

    return (
        <>
            <button
                type="button"
                aria-haspopup="dialog"
                aria-label={t('open')}
                onClick={open}
                className="btn-glass inline-flex size-11 items-center justify-center lg:hidden"
            >
                <SearchIcon className="size-5" />
            </button>

            <dialog
                ref={dialogRef}
                data-theme="dark"
                aria-label={t('label')}
                onClose={() => setResetKey((key) => key + 1)}
                className="fixed inset-0 isolate m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-espresso/95 p-0 text-fg backdrop-blur-xl backdrop:bg-transparent open:animate-fade-in"
            >
                <div className="flex h-full flex-col px-4 py-4">
                    <div className="flex justify-end pb-3">
                        <button
                            type="button"
                            aria-label={t('close')}
                            onClick={close}
                            className="btn-glass inline-flex size-11 items-center justify-center"
                        >
                            <CloseIcon className="size-5" />
                        </button>
                    </div>

                    <SearchBox key={resetKey} variant="dialog" onNavigate={close} />
                </div>
            </dialog>
        </>
    );
}
