'use client';

import type { Locale } from '@/i18n/routing';
import type { CustomizationOption } from '@/lib/schemas/catalog';
import { localize } from '@/lib/utils/format';
import { useLocale, useTranslations } from 'next-intl';
import { useId } from 'react';

type Props = {
    options: CustomizationOption[];
    values: Record<string, string>;
    invalid: ReadonlySet<string>;
    onChange: (key: string, value: string) => void;
};

export function CustomizationForm({ options, values, invalid, onChange }: Props) {
    const t = useTranslations('Purchase');
    const locale = useLocale() as Locale;
    const uid = useId();

    return (
        <fieldset className="space-y-5 rounded-2xl border border-line p-4">
            <legend className="px-2 font-display text-lg font-bold">{t('optionsTitle')}</legend>

            {options.map((option) => {
                const id = `${uid}-${option.key}`;
                const label = localize(option.label, locale);
                const value = values[option.key] ?? '';
                const isInvalid = invalid.has(option.key);
                const hint = option.required ? t('requiredHint') : t('optionalHint');

                if (option.type === 'choice') {
                    return (
                        <div key={option.key} role="radiogroup" aria-labelledby={`${id}-label`}>
                            <p id={`${id}-label`} className="mb-2 text-sm font-semibold">
                                {label} <span className="font-normal text-muted">{hint}</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {option.choices?.map((choice) => {
                                    const selected = value === choice.value;
                                    return (
                                        <button
                                            key={choice.value}
                                            type="button"
                                            role="radio"
                                            aria-checked={selected}
                                            onClick={() => onChange(option.key, choice.value)}
                                            className={`inline-flex h-11 items-center px-5 text-sm font-semibold ${
                                                selected ? 'btn-primary' : 'btn-glass'
                                            }`}
                                        >
                                            {localize(choice.label, locale)}
                                        </button>
                                    );
                                })}
                            </div>
                            {isInvalid && (
                                <p role="alert" className="mt-1.5 text-sm font-medium text-clay">
                                    {t('missingChoice', { label })}
                                </p>
                            )}
                        </div>
                    );
                }

                return (
                    <div key={option.key}>
                        <label
                            htmlFor={id}
                            className="mb-1.5 flex items-baseline justify-between gap-2 text-sm font-semibold"
                        >
                            <span>
                                {label} <span className="font-normal text-muted">{hint}</span>
                            </span>
                            {option.maxLength && (
                                <span className="text-xs font-normal text-muted">
                                    {t('charCount', {
                                        current: value.length,
                                        max: option.maxLength
                                    })}
                                </span>
                            )}
                        </label>
                        <input
                            id={id}
                            type="text"
                            value={value}
                            maxLength={option.maxLength}
                            aria-invalid={isInvalid}
                            aria-describedby={isInvalid ? `${id}-error` : undefined}
                            onChange={(event) => onChange(option.key, event.target.value)}
                            className={`h-11 w-full rounded-full border bg-surface/70 px-4 text-sm ${
                                isInvalid ? 'border-clay' : 'border-line'
                            }`}
                        />
                        {isInvalid && (
                            <p
                                id={`${id}-error`}
                                role="alert"
                                className="mt-1.5 text-sm font-medium text-clay"
                            >
                                {t('missingText', { label })}
                            </p>
                        )}

                        <div
                            data-theme="dark"
                            aria-hidden
                            className="glass-smoke-strong mt-3 rounded-2xl px-4 py-5 text-center"
                        >
                            <p className="text-xs text-fg/70">{t('previewTitle')}</p>
                            <p
                                className={`mt-1 min-h-10 break-words font-accent text-3xl text-copper-light ${
                                    value ? '' : 'opacity-50'
                                }`}
                            >
                                {value || t('previewPlaceholder')}
                            </p>
                        </div>
                    </div>
                );
            })}
        </fieldset>
    );
}
