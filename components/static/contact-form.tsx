'use client';

import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';

type Props = { whatsappNumber: string };

const TOPICS = ['order', 'custom', 'product', 'other'] as const;
type Topic = (typeof TOPICS)[number];

const fieldClass = 'w-full border bg-surface/70 text-sm';

export function ContactForm({ whatsappNumber }: Props) {
    const t = useTranslations('Pages');
    const uid = useId();

    const [name, setName] = useState('');
    const [topic, setTopic] = useState<Topic>('order');
    const [order, setOrder] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState<{ name?: boolean; message?: boolean }>({});

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const next = {
            name: name.trim().length < 2,
            message: message.trim().length < 10
        };
        setErrors(next);

        if (next.name) {
            document.getElementById(`${uid}-name`)?.focus();
            return;
        }
        if (next.message) {
            document.getElementById(`${uid}-message`)?.focus();
            return;
        }

        const lines = [
            t('contact.greeting'),
            `${t('contact.topicLabel')}: ${t(`contact.topics.${topic}`)}`,
            `${t('contact.nameLabel')}: ${name.trim()}`,
            ...(order.trim() ? [`${t('contact.orderLabel')}: ${order.trim()}`] : []),
            `${t('contact.messageLabel')}: ${message.trim()}`
        ];

        window.open(
            `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`,
            '_blank',
            'noopener,noreferrer'
        );
    }

    return (
        <form noValidate onSubmit={onSubmit} className="space-y-4">
            <div>
                <label htmlFor={`${uid}-name`} className="mb-1.5 block text-sm font-semibold">
                    {t('contact.nameLabel')}
                </label>
                <input
                    id={`${uid}-name`}
                    type="text"
                    autoComplete="name"
                    value={name}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? `${uid}-name-error` : undefined}
                    onChange={(event) => setName(event.target.value)}
                    className={`${fieldClass} h-12 rounded-full px-5 ${errors.name ? 'border-clay' : 'border-line'}`}
                />
                {errors.name && (
                    <p
                        id={`${uid}-name-error`}
                        role="alert"
                        className="mt-1.5 text-sm font-medium text-clay"
                    >
                        {t('contact.errors.name')}
                    </p>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor={`${uid}-topic`} className="mb-1.5 block text-sm font-semibold">
                        {t('contact.topicLabel')}
                    </label>
                    <select
                        id={`${uid}-topic`}
                        value={topic}
                        onChange={(event) => setTopic(event.target.value as Topic)}
                        className={`${fieldClass} h-12 rounded-full border-line px-5`}
                    >
                        {TOPICS.map((key) => (
                            <option key={key} value={key}>
                                {t(`contact.topics.${key}`)}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor={`${uid}-order`} className="mb-1.5 block text-sm font-semibold">
                        {t('contact.orderLabel')}
                    </label>
                    <input
                        id={`${uid}-order`}
                        type="text"
                        dir="ltr"
                        value={order}
                        placeholder="BZ-XXXXXXXX"
                        onChange={(event) => setOrder(event.target.value)}
                        className={`${fieldClass} h-12 rounded-full border-line px-5`}
                    />
                </div>
            </div>

            <div>
                <label htmlFor={`${uid}-message`} className="mb-1.5 block text-sm font-semibold">
                    {t('contact.messageLabel')}
                </label>
                <textarea
                    id={`${uid}-message`}
                    rows={5}
                    value={message}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? `${uid}-message-error` : undefined}
                    onChange={(event) => setMessage(event.target.value)}
                    className={`${fieldClass} rounded-2xl px-5 py-3 ${errors.message ? 'border-clay' : 'border-line'}`}
                />
                {errors.message && (
                    <p
                        id={`${uid}-message-error`}
                        role="alert"
                        className="mt-1.5 text-sm font-medium text-clay"
                    >
                        {t('contact.errors.message')}
                    </p>
                )}
            </div>

            {whatsappNumber ? (
                <button
                    type="submit"
                    className="btn-primary flex h-12 w-full items-center justify-center text-sm font-semibold sm:w-auto sm:px-10"
                >
                    {t('contact.submit')}
                </button>
            ) : (
                <p role="status" className="text-sm text-muted">
                    {t('contact.noWhatsapp')}
                </p>
            )}
        </form>
    );
}
