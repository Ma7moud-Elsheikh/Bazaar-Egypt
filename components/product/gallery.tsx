'use client';

import { ChevronIcon, CloseIcon } from '@/components/ui/icons';
import type { Locale } from '@/i18n/routing';
import type { ImageAsset } from '@/lib/schemas/catalog';
import { localize } from '@/lib/utils/format';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

type Props = { images: ImageAsset[]; name: string };

const MAIN_SIZES = '(min-width: 1024px) 58vw, 100vw';

const arrowClass =
    'glass-smoke-strong absolute inset-y-0 my-auto inline-flex size-11 items-center justify-center rounded-full text-fg transition duration-300 ease-craft hover:scale-105 active:scale-95';

export function Gallery({ images, name }: Props) {
    const t = useTranslations('ProductPage');
    const locale = useLocale() as Locale;
    const total = images.length;

    const trackRef = useRef<HTMLUListElement>(null);
    const slideRefs = useRef<(HTMLLIElement | null)[]>([]);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [index, setIndex] = useState(0);
    const [zoomIndex, setZoomIndex] = useState(0);

    // تتبّع الصورة الظاهرة بـ IntersectionObserver (شغال صح مع RTL)
    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    const i = Number((entry.target as HTMLElement).dataset.index);
                    if (!Number.isNaN(i)) setIndex(i);
                }
            },
            { root: track, threshold: 0.6 }
        );

        slideRefs.current.forEach((el) => {
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [total]);

    const goTo = useCallback(
        (i: number) => {
            const target = Math.min(Math.max(i, 0), total - 1);
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            slideRefs.current[target]?.scrollIntoView({
                behavior: reduce ? 'auto' : 'smooth',
                inline: 'center',
                block: 'nearest'
            });
        },
        [total]
    );

    const moveZoom = useCallback(
        (delta: number) => setZoomIndex((current) => (current + delta + total) % total),
        [total]
    );

    const openZoom = (i: number) => {
        setZoomIndex(i);
        dialogRef.current?.showModal();
    };

    const onZoomKeyDown = (event: React.KeyboardEvent) => {
        const rtl = document.documentElement.dir === 'rtl';
        if (event.key === 'ArrowRight') moveZoom(rtl ? -1 : 1);
        if (event.key === 'ArrowLeft') moveZoom(rtl ? 1 : -1);
    };

    return (
        <div role="region" aria-roledescription="carousel" aria-label={t('galleryLabel', { name })}>
            <div className="relative">
                <ul
                    ref={trackRef}
                    className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-card [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    {images.map((image, i) => (
                        <li
                            key={`${image.src}-${i}`}
                            ref={(el) => {
                                slideRefs.current[i] = el;
                            }}
                            data-index={i}
                            role="group"
                            aria-roledescription="slide"
                            aria-label={t('imageOf', { current: i + 1, total })}
                            className="relative aspect-[4/5] w-full shrink-0 snap-center bg-surface-2"
                        >
                            <button
                                type="button"
                                aria-label={t('zoom')}
                                onClick={() => openZoom(i)}
                                className="absolute inset-0 cursor-zoom-in"
                            >
                                <Image
                                    src={image.src}
                                    alt={localize(image.alt, locale)}
                                    fill
                                    sizes={MAIN_SIZES}
                                    preload={i === 0}
                                    className="object-cover"
                                />
                            </button>

                            {image.kind === 'scale' && (
                                <span
                                    data-theme="dark"
                                    className="glass-smoke-strong pointer-events-none absolute start-3 bottom-3 rounded-full px-3 py-1 text-xs font-semibold"
                                >
                                    {t('scaleBadge')}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>

                {total > 1 && (
                    <>
                        <span
                            aria-hidden
                            data-theme="dark"
                            className="glass-smoke-strong pointer-events-none absolute end-3 top-3 rounded-full px-3 py-1 text-xs font-semibold"
                        >
                            {index + 1} / {total}
                        </span>

                        <button
                            type="button"
                            data-theme="dark"
                            aria-label={t('previousImage')}
                            disabled={index === 0}
                            onClick={() => goTo(index - 1)}
                            className={`${arrowClass} start-3 max-sm:hidden disabled:opacity-40`}
                        >
                            <ChevronIcon className="size-5 -scale-x-100 rtl:scale-x-100" />
                        </button>
                        <button
                            type="button"
                            data-theme="dark"
                            aria-label={t('nextImage')}
                            disabled={index === total - 1}
                            onClick={() => goTo(index + 1)}
                            className={`${arrowClass} end-3 max-sm:hidden disabled:opacity-40`}
                        >
                            <ChevronIcon className="size-5 rtl:-scale-x-100" />
                        </button>
                    </>
                )}
            </div>

            {total > 1 && (
                <ul className="mt-3 flex gap-2 overflow-x-auto pb-1 max-sm:hidden">
                    {images.map((image, i) => (
                        <li key={`thumb-${image.src}-${i}`} className="shrink-0">
                            <button
                                type="button"
                                aria-label={t('imageOf', { current: i + 1, total })}
                                aria-current={i === index}
                                onClick={() => goTo(i)}
                                className={`block overflow-hidden rounded-xl transition duration-300 ${
                                    i === index
                                        ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface'
                                        : 'opacity-70 hover:opacity-100'
                                }`}
                            >
                                <Image
                                    src={image.src}
                                    alt=""
                                    width={72}
                                    height={90}
                                    className="h-[90px] w-[72px] object-cover"
                                />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <dialog
                ref={dialogRef}
                data-theme="dark"
                aria-label={t('galleryLabel', { name })}
                onKeyDown={onZoomKeyDown}
                className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-espresso/95 p-0 text-fg backdrop:bg-transparent open:animate-fade-in"
            >
                <div className="relative flex h-full flex-col">
                    <div className="flex items-center justify-between p-4">
                        <span className="text-sm text-fg/80">
                            {zoomIndex + 1} / {total}
                        </span>
                        <button
                            type="button"
                            aria-label={t('close')}
                            onClick={() => dialogRef.current?.close()}
                            className="btn-glass inline-flex size-11 items-center justify-center"
                        >
                            <CloseIcon className="size-5" />
                        </button>
                    </div>

                    <div className="relative min-h-0 flex-1">
                        <Image
                            key={zoomIndex}
                            src={images[zoomIndex].src}
                            alt={localize(images[zoomIndex].alt, locale)}
                            fill
                            sizes="100vw"
                            className="object-contain"
                        />
                    </div>

                    {total > 1 && (
                        <>
                            <button
                                type="button"
                                aria-label={t('previousImage')}
                                onClick={() => moveZoom(-1)}
                                className={`${arrowClass} start-4`}
                            >
                                <ChevronIcon className="size-5 -scale-x-100 rtl:scale-x-100" />
                            </button>
                            <button
                                type="button"
                                aria-label={t('nextImage')}
                                onClick={() => moveZoom(1)}
                                className={`${arrowClass} end-4`}
                            >
                                <ChevronIcon className="size-5 rtl:-scale-x-100" />
                            </button>
                        </>
                    )}
                </div>
            </dialog>
        </div>
    );
}
