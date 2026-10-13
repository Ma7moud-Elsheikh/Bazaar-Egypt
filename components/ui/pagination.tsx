import { ChevronIcon } from '@/components/ui/icons';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

type Props = {
    page: number;
    totalPages: number;
    getHref: (page: number) => string;
};

function getWindow(page: number, total: number): (number | 'gap')[] {
    const wanted = new Set([1, total, page - 1, page, page + 1]);
    const pages = [...wanted].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

    const result: (number | 'gap')[] = [];
    pages.forEach((p, i) => {
        if (i > 0 && p - pages[i - 1] > 1) result.push('gap');
        result.push(p);
    });
    return result;
}

const item = 'inline-flex size-11 items-center justify-center text-sm font-semibold';

export async function Pagination({ page, totalPages, getHref }: Props) {
    if (totalPages <= 1) return null;

    const t = await getTranslations('Pagination');
    const items = getWindow(page, totalPages);

    return (
        <nav
            aria-label={t('label')}
            className="mt-12 flex flex-wrap items-center justify-center gap-2"
        >
            {page > 1 ? (
                <Link
                    href={getHref(page - 1)}
                    aria-label={t('previous')}
                    className={`btn-glass ${item}`}
                >
                    <ChevronIcon className="size-5 -scale-x-100 rtl:scale-x-100" />
                </Link>
            ) : (
                <span aria-hidden className={`btn-glass ${item} opacity-40`}>
                    <ChevronIcon className="size-5 -scale-x-100 rtl:scale-x-100" />
                </span>
            )}

            {items.map((entry, index) =>
                entry === 'gap' ? (
                    <span key={`gap-${index}`} aria-hidden className="px-1 text-muted">
                        …
                    </span>
                ) : entry === page ? (
                    <span
                        key={entry}
                        aria-current="page"
                        aria-label={t('currentPage', { page: entry })}
                        className={`btn-primary ${item}`}
                    >
                        {entry}
                    </span>
                ) : (
                    <Link
                        key={entry}
                        href={getHref(entry)}
                        aria-label={t('page', { page: entry })}
                        className={`btn-glass ${item}`}
                    >
                        {entry}
                    </Link>
                )
            )}

            {page < totalPages ? (
                <Link
                    href={getHref(page + 1)}
                    aria-label={t('next')}
                    className={`btn-glass ${item}`}
                >
                    <ChevronIcon className="size-5 rtl:-scale-x-100" />
                </Link>
            ) : (
                <span aria-hidden className={`btn-glass ${item} opacity-40`}>
                    <ChevronIcon className="size-5 rtl:-scale-x-100" />
                </span>
            )}
        </nav>
    );
}
