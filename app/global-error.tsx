'use client';

import './globals.css';

type Props = {
    error: Error & { digest?: string };
    reset: () => void;
};

// بيظهر لما الـ layout نفسه يقع. من غير ترجمة ولا خطوط (الـ provider مش شغال)، فالنص بلغتين
export default function GlobalError({ reset }: Props) {
    return (
        <html lang="ar" dir="rtl">
            <body className="grid min-h-dvh place-items-center bg-surface px-6 text-center text-fg">
                <div role="alert" className="glass max-w-md rounded-[1.75rem] p-8">
                    <h1 className="text-3xl font-bold">حصلت مشكلة غير متوقعة</h1>
                    <p className="mt-3 text-muted">Something went wrong. Please try again.</p>
                    <button
                        type="button"
                        onClick={reset}
                        className="btn-primary mt-6 inline-flex h-12 items-center justify-center px-8 text-sm font-semibold"
                    >
                        حاول تاني · Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
