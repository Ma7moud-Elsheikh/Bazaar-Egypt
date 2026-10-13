'use client';

import type { ButtonHTMLAttributes } from 'react';

const variantClasses = {
    primary: 'bg-brand text-on-brand hover:brightness-110',
    ghost: 'border border-line text-fg hover:bg-fg/10'
} as const;

export type ButtonVariant = keyof typeof variantClasses;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
};

const baseClasses =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 font-body text-sm font-semibold transition duration-300 ease-craft disabled:pointer-events-none disabled:opacity-60 motion-safe:active:scale-[0.98]';

export function Button({
    variant = 'primary',
    type = 'button',
    className,
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={[baseClasses, variantClasses[variant], className].filter(Boolean).join(' ') + ' cursor-pointer'}
            {...props}
        >
            {children}
        </button>
    );
}
