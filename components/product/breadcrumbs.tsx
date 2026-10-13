import { ChevronIcon } from '@/components/ui/icons';
import { Link } from '@/i18n/navigation';

type Crumb = { label: string; href?: string };
type Props = { items: Crumb[]; label: string };

export function Breadcrumbs({ items, label }: Props) {
    return (
        <nav aria-label={label}>
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
                {items.map((item, index) => (
                    <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                        {index > 0 && (
                            <ChevronIcon className="size-3.5 shrink-0 rtl:-scale-x-100" />
                        )}
                        {item.href ? (
                            <Link href={item.href} className="transition hover:text-fg">
                                {item.label}
                            </Link>
                        ) : (
                            <span
                                aria-current="page"
                                className="max-w-[16rem] truncate font-medium text-fg"
                            >
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
