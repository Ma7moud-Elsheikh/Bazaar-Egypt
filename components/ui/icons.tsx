type IconProps = { className?: string };

const base = {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false
};

export function BagIcon({ className }: IconProps) {
    return (
        <svg {...base} className={className}>
            <path d="M6 8h12l-1 12H7L6 8Z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
    );
}

export function MenuIcon({ className }: IconProps) {
    return (
        <svg {...base} className={className}>
            <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
    );
}

export function CloseIcon({ className }: IconProps) {
    return (
        <svg {...base} className={className}>
            <path d="M6 6l12 12M18 6L6 18" />
        </svg>
    );
}

export function PlusIcon({ className }: IconProps) {
    return (
        <svg {...base} className={className}>
            <path d="M12 5v14M5 12h14" />
        </svg>
    );
}

export function MinusIcon({ className }: IconProps) {
    return (
        <svg {...base} className={className}>
            <path d="M5 12h14" />
        </svg>
    );
}

export function TrashIcon({ className }: IconProps) {
    return (
        <svg {...base} className={className}>
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
        </svg>
    );
}

/** يشاور لليمين. اقلبه بـ rtl:-scale-x-100 حسب الاتجاه */
export function ChevronIcon({ className }: IconProps) {
    return (
        <svg {...base} className={className}>
            <path d="M9 6l6 6-6 6" />
        </svg>
    );
}

export function StarIcon({ className }: IconProps) {
    return (
        <svg {...base} fill="currentColor" strokeWidth={0} className={className}>
            <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9-4.3-4.1 5.9-.8L12 3.5Z" />
        </svg>
    );
}

export function SearchIcon({ className }: IconProps) {
    return (
        <svg {...base} className={className}>
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16l4.5 4.5" />
        </svg>
    );
}
