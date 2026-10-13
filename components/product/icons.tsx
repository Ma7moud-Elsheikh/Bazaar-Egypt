type IconProps = { className?: string };

const base = {
    viewBox: '0 0 24 24',
    width: 24,
    height: 24,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false
};

export function CheckCircleIcon({ className }: IconProps) {
    return (
        <svg {...base} className={className}>
            <circle cx="12" cy="12" r="9" />
            <path d="M8.5 12.5l2.5 2.5 4.5-5" />
        </svg>
    );
}

export function TruckIcon({ className }: IconProps) {
    return (
        <svg {...base} className={className}>
            <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
            <circle cx="7" cy="17.5" r="1.8" />
            <circle cx="17" cy="17.5" r="1.8" />
        </svg>
    );
}

export function ReturnIcon({ className }: IconProps) {
    return (
        <svg {...base} className={className}>
            <path d="M4 12a8 8 0 1 0 2.5-5.8" />
            <path d="M4 4v4h4" />
        </svg>
    );
}

export function HandmadeIcon({ className }: IconProps) {
    return (
        <svg {...base} className={className}>
            <circle cx="12" cy="9" r="5" />
            <path d="M8.5 13.5L7 21l5-2.5 5 2.5-1.5-7.5" />
        </svg>
    );
}

export function ChatIcon({ className }: IconProps) {
    return (
        <svg {...base} className={className}>
            <path d="M4 5h16v11H9l-5 4z" />
        </svg>
    );
}

export function GiftIcon({ className }: IconProps) {
    return (
        <svg {...base} className={className}>
            <rect x="4" y="9" width="16" height="11" rx="1.5" />
            <path d="M12 9v11M4 13h16M12 9c-1-3-5-3.5-5-1s3 1 5 1zm0 0c1-3 5-3.5 5-1s-3 1-5 1z" />
        </svg>
    );
}

export function CashIcon({ className }: IconProps) {
    return (
        <svg {...base} className={className}>
            <rect x="3" y="7" width="18" height="10" rx="2" />
            <circle cx="12" cy="12" r="2.5" />
        </svg>
    );
}
