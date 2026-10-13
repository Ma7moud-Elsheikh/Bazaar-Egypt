'use client';

import { ChevronIcon, CloseIcon, SearchIcon } from '@/components/ui/icons';
import { useRouter } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { addRecent, clearRecent, readRecent } from '@/lib/search/recent';
import type { SuggestPayload } from '@/lib/search/suggest-payload';
import { formatPrice, localize } from '@/lib/utils/format';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';

type Props = {
    variant?: 'inline' | 'dialog';
    /** بيتنادى بعد أي انتقال (لقفل لوح الموبايل) */
    onNavigate?: () => void;
};

type TextKind = 'query' | 'recent' | 'popular';

type Item =
    | { kind: TextKind; label: string; href: string }
    | { kind: 'all'; label: string; href: string }
    | { kind: 'craft'; label: string; href: string; image: string }
    | {
          kind: 'product';
          label: string;
          href: string;
          image: string;
          alt: string;
          price: string;
      };

type Group = { id: string; title: string; items: Item[] };

const searchHref = (q: string) => `/search?q=${encodeURIComponent(q)}`;

function Highlight({ text, query }: { text: string; query: string }) {
    const needle = query.trim();
    if (!needle) return <>{text}</>;

    const index = text.toLowerCase().indexOf(needle.toLowerCase());
    if (index < 0) return <>{text}</>;

    return (
        <>
            {text.slice(0, index)}
            <strong className="font-bold">{text.slice(index, index + needle.length)}</strong>
            {text.slice(index + needle.length)}
        </>
    );
}

export function SearchBox({ variant = 'inline', onNavigate }: Props) {
    const t = useTranslations('SearchBox');
    const locale = useLocale() as Locale;
    const router = useRouter();
    const uid = useId();
    const listboxId = `${uid}-listbox`;

    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [inputValue, setInputValue] = useState('');
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const [data, setData] = useState<SuggestPayload | null>(null);
    const [recent, setRecent] = useState<string[]>([]);

    const typed = query.trim().length >= 2;

    // جلب الاقتراحات: تأخير 150ms وإلغاء الطلب القديم
    useEffect(() => {
        if (query.trim().length < 2) return;

        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/search/suggest?q=${encodeURIComponent(query.trim())}&locale=${locale}`,
                    { signal: controller.signal }
                );
                if (!res.ok) throw new Error('suggest failed');
                setData((await res.json()) as SuggestPayload);
            } catch (error) {
                if ((error as Error).name !== 'AbortError') setData(null);
            }
        }, 150);

        return () => {
            controller.abort();
            window.clearTimeout(timer);
        };
    }, [query, locale]);

    // قفل اللوحة عند الضغط برّه (للمس على الموبايل)
    useEffect(() => {
        if (variant !== 'inline' || !open) return;

        const onPointerDown = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) {
                setOpen(false);
                setActive(-1);
            }
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [open, variant]);

    const groups: Group[] = [];
    if (!typed) {
        const popular = (t.raw('popularList') as string[] | undefined) ?? [];
        if (recent.length > 0) {
            groups.push({
                id: 'recent',
                title: t('recentTitle'),
                items: recent.map((label) => ({
                    kind: 'recent' as const,
                    label,
                    href: searchHref(label)
                }))
            });
        }
        groups.push({
            id: 'popular',
            title: t('popularTitle'),
            items: popular.map((label) => ({
                kind: 'popular' as const,
                label,
                href: searchHref(label)
            }))
        });
    } else {
        if (data && data.queries.length > 0) {
            groups.push({
                id: 'queries',
                title: t('queriesTitle'),
                items: data.queries.map((label) => ({
                    kind: 'query' as const,
                    label,
                    href: searchHref(label)
                }))
            });
        }
        if (data && data.crafts.length > 0) {
            groups.push({
                id: 'crafts',
                title: t('craftsTitle'),
                items: data.crafts.map((craft) => ({
                    kind: 'craft' as const,
                    label: t('inCraft', { name: localize(craft.name, locale) }),
                    href: `/shop?craft=${craft.slug}`,
                    image: craft.cover.src
                }))
            });
        }
        if (data && data.products.length > 0) {
            groups.push({
                id: 'products',
                title: t('productsTitle'),
                items: data.products.map((product) => ({
                    kind: 'product' as const,
                    label: localize(product.name, locale),
                    href: `/shop/${product.slug}`,
                    image: product.image.src,
                    alt: localize(product.image.alt, locale),
                    price: formatPrice(product.price, locale)
                }))
            });
        }
        groups.push({
            id: 'all',
            title: '',
            items: [
                {
                    kind: 'all' as const,
                    label: t('searchAll', { q: query.trim() }),
                    href: searchHref(query.trim())
                }
            ]
        });
    }

    const flat = groups.flatMap((group) => group.items);
    const showPanel = (variant === 'dialog' || open) && flat.length > 0;
    const suggestionCount = flat.filter((item) => item.kind !== 'all').length;

    function go(href: string, remember?: string) {
        if (remember) addRecent(remember);
        setOpen(false);
        setActive(-1);
        inputRef.current?.blur();
        onNavigate?.();
        router.push(href);
    }

    function select(item: Item) {
        if (item.kind === 'product' || item.kind === 'craft') {
            go(item.href);
            return;
        }
        go(item.href, item.kind === 'all' ? query.trim() : item.label);
    }

    function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const item = active >= 0 ? flat[active] : undefined;
        if (item) {
            select(item);
            return;
        }

        const value = inputValue.trim();
        go(value ? searchHref(value) : '/search', value || undefined);
    }

    function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            if (flat.length === 0) return;
            event.preventDefault();
            setOpen(true);

            const next =
                event.key === 'ArrowDown'
                    ? (active + 1) % flat.length
                    : active <= 0
                      ? flat.length - 1
                      : active - 1;
            setActive(next);

            // الاقتراح النشط بيتنسخ في الحقل (الاقتراحات النصية بس)
            const item = flat[next];
            const isText =
                item.kind === 'query' || item.kind === 'recent' || item.kind === 'popular';
            setInputValue(isText ? item.label : query);
            return;
        }

        if (event.key === 'Escape' && variant === 'inline' && open) {
            event.preventDefault();
            setOpen(false);
            setActive(-1);
            setInputValue(query);
        }
    }

    let offset = 0;

    return (
        <div
            ref={rootRef}
            className={variant === 'inline' ? 'relative' : 'flex min-h-0 flex-1 flex-col'}
            onBlur={(event) => {
                if (variant === 'inline' && !event.currentTarget.contains(event.relatedTarget)) {
                    setOpen(false);
                    setActive(-1);
                }
            }}
        >
            <form
                role="search"
                aria-label={t('label')}
                action={`/${locale}/search`}
                onSubmit={onSubmit}
                className={variant === 'dialog' ? 'flex min-h-0 flex-1 flex-col' : undefined}
            >
                <div className="relative">
                    <SearchIcon className="pointer-events-none absolute inset-y-0 start-4 my-auto size-5 text-fg/70" />
                    <input
                        ref={inputRef}
                        name="q"
                        type="text"
                        inputMode="search"
                        enterKeyHint="search"
                        autoComplete="off"
                        spellCheck={false}
                        role="combobox"
                        aria-label={t('label')}
                        aria-expanded={showPanel}
                        aria-controls={listboxId}
                        aria-autocomplete="list"
                        aria-activedescendant={active >= 0 ? `${uid}-opt-${active}` : undefined}
                        value={inputValue}
                        placeholder={t('placeholder')}
                        onChange={(event) => {
                            setInputValue(event.target.value);
                            setQuery(event.target.value);
                            setActive(-1);
                            setOpen(true);
                        }}
                        onFocus={() => {
                            setRecent(readRecent());
                            setOpen(true);
                        }}
                        onKeyDown={onKeyDown}
                        className="h-11 w-full rounded-full border border-line bg-fg/10 ps-12 pe-12 text-sm text-fg placeholder:text-fg/60 transition focus-visible:bg-fg/15"
                    />
                    {inputValue && (
                        <button
                            type="button"
                            aria-label={t('clear')}
                            onClick={() => {
                                setInputValue('');
                                setQuery('');
                                setData(null);
                                setActive(-1);
                                inputRef.current?.focus();
                            }}
                            className="absolute inset-y-0 end-1.5 my-auto grid size-9 place-items-center rounded-full text-fg/70 transition hover:bg-fg/10"
                        >
                            <CloseIcon className="size-4" />
                        </button>
                    )}
                </div>

                {showPanel && (
                    <div
                        data-theme="dark"
                        className={
                            variant === 'inline'
                                ? 'glass-smoke-strong absolute inset-x-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-3xl p-2'
                                : 'mt-4 min-h-0 flex-1 overflow-y-auto'
                        }
                    >
                        <div id={listboxId} role="listbox" aria-label={t('suggestionsLabel')}>
                            {groups.map((group) => {
                                const start = offset;
                                offset += group.items.length;

                                return (
                                    <div
                                        key={group.id}
                                        role="group"
                                        aria-labelledby={
                                            group.title ? `${uid}-${group.id}` : undefined
                                        }
                                        className="py-1"
                                    >
                                        {group.title && (
                                            <div
                                                id={`${uid}-${group.id}`}
                                                role="presentation"
                                                className="px-3 pt-2 pb-1 text-xs font-semibold text-fg/70"
                                            >
                                                {group.title}
                                            </div>
                                        )}

                                        {group.items.map((item, i) => {
                                            const index = start + i;
                                            const isActive = index === active;

                                            return (
                                                <div
                                                    key={`${item.kind}-${item.href}`}
                                                    id={`${uid}-opt-${index}`}
                                                    role="option"
                                                    aria-selected={isActive}
                                                    onMouseDown={(event) => event.preventDefault()}
                                                    onClick={() => select(item)}
                                                    onMouseEnter={() => setActive(index)}
                                                    className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 text-sm transition-colors ${
                                                        isActive ? 'bg-fg/15' : 'hover:bg-fg/10'
                                                    }`}
                                                >
                                                    {item.kind === 'product' && (
                                                        <>
                                                            <Image
                                                                src={item.image}
                                                                alt={item.alt}
                                                                width={44}
                                                                height={44}
                                                                className="size-11 shrink-0 rounded-xl object-cover"
                                                            />
                                                            <span className="min-w-0 flex-1">
                                                                <span className="block truncate font-semibold">
                                                                    {item.label}
                                                                </span>
                                                                <span className="block text-xs text-fg/75">
                                                                    {item.price}
                                                                </span>
                                                            </span>
                                                        </>
                                                    )}

                                                    {item.kind === 'craft' && (
                                                        <>
                                                            <Image
                                                                src={item.image}
                                                                alt=""
                                                                width={32}
                                                                height={32}
                                                                className="size-8 shrink-0 rounded-lg object-cover"
                                                            />
                                                            <span className="font-medium">
                                                                {item.label}
                                                            </span>
                                                        </>
                                                    )}

                                                    {(item.kind === 'query' ||
                                                        item.kind === 'recent' ||
                                                        item.kind === 'popular') && (
                                                        <>
                                                            <SearchIcon className="size-4 shrink-0 text-fg/60" />
                                                            <span className="min-w-0 flex-1 truncate">
                                                                {item.kind === 'query' ? (
                                                                    <Highlight
                                                                        text={item.label}
                                                                        query={query}
                                                                    />
                                                                ) : (
                                                                    item.label
                                                                )}
                                                            </span>
                                                        </>
                                                    )}

                                                    {item.kind === 'all' && (
                                                        <>
                                                            <SearchIcon className="size-4 shrink-0 text-accent" />
                                                            <span className="min-w-0 flex-1 truncate font-semibold text-accent">
                                                                {item.label}
                                                            </span>
                                                            <ChevronIcon className="size-4 shrink-0 text-fg/60 rtl:-scale-x-100" />
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>

                        {typed && !data && (
                            <p className="px-3 py-2 text-xs text-fg/70">{t('noSuggestions')}</p>
                        )}

                        {!typed && recent.length > 0 && (
                            <div className="px-1 pt-1 pb-1">
                                <button
                                    type="button"
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => setRecent(clearRecent())}
                                    className="inline-flex min-h-11 items-center rounded-full px-3 text-xs font-semibold text-fg/75 transition hover:text-fg"
                                >
                                    {t('clearRecent')}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </form>

            <p role="status" className="sr-only">
                {typed && data ? t('resultsAnnounce', { count: suggestionCount }) : ''}
            </p>
        </div>
    );
}
