'use client';

import { Link } from '@/i18n/navigation';
import { useId, useRef, useState } from 'react';

export type TabItem = {
    id: string;
    label: string;
    panel: React.ReactNode;
    cta?: { href: string; label: string };
};

type Props = { tabs: TabItem[]; label: string };

export function Tabs({ tabs, label }: Props) {
    const uid = useId();
    const [active, setActive] = useState(0);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const focusTab = (index: number) => {
        setActive(index);
        tabRefs.current[index]?.focus();
    };

    function onKeyDown(event: React.KeyboardEvent, index: number) {
        const rtl = document.documentElement.dir === 'rtl';
        const next = rtl ? 'ArrowLeft' : 'ArrowRight';
        const previous = rtl ? 'ArrowRight' : 'ArrowLeft';

        if (event.key === next) {
            event.preventDefault();
            focusTab((index + 1) % tabs.length);
        } else if (event.key === previous) {
            event.preventDefault();
            focusTab((index - 1 + tabs.length) % tabs.length);
        } else if (event.key === 'Home') {
            event.preventDefault();
            focusTab(0);
        } else if (event.key === 'End') {
            event.preventDefault();
            focusTab(tabs.length - 1);
        }
    }

    return (
        <div>
            <div role="tablist" aria-label={label} className="flex gap-2 overflow-x-auto p-2">
                {tabs.map((tab, index) => (
                    <button
                        key={tab.id}
                        ref={(el) => {
                            tabRefs.current[index] = el;
                        }}
                        type="button"
                        role="tab"
                        id={`${uid}-tab-${tab.id}`}
                        aria-selected={index === active}
                        aria-controls={`${uid}-panel-${tab.id}`}
                        tabIndex={index === active ? 0 : -1}
                        onClick={() => setActive(index)}
                        onKeyDown={(event) => onKeyDown(event, index)}
                        className={`inline-flex h-11 shrink-0 items-center px-6 text-sm font-semibold ${
                            index === active ? 'btn-primary' : 'btn-glass'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {tabs.map((tab, index) => (
                <div
                    key={tab.id}
                    role="tabpanel"
                    id={`${uid}-panel-${tab.id}`}
                    aria-labelledby={`${uid}-tab-${tab.id}`}
                    hidden={index !== active}
                    className="mt-6"
                >
                    {tab.panel}

                    {tab.cta && (
                        <div className="mt-8 text-center">
                            {tab.cta.href.startsWith('#') ? (
                                <a
                                    href={tab.cta.href}
                                    className="btn-glass inline-flex h-12 items-center justify-center px-8 text-sm font-semibold"
                                >
                                    {tab.cta.label}
                                </a>
                            ) : (
                                <Link
                                    href={tab.cta.href}
                                    className="btn-glass inline-flex h-12 items-center justify-center px-8 text-sm font-semibold"
                                >
                                    {tab.cta.label}
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
