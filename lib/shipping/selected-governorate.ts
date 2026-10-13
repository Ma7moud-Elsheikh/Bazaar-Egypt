import { useCallback, useSyncExternalStore } from 'react';

const KEY = 'bazaar-egypt:governorate';

let value: string | null = null;
let hydrated = false;
let bound = false;
const listeners = new Set<() => void>();

function read(): string | null {
    try {
        const raw = window.localStorage.getItem(KEY);
        return raw && /^[a-z0-9-]+$/.test(raw) ? raw : null;
    } catch {
        return null;
    }
}

function ensureHydrated() {
    if (hydrated || typeof window === 'undefined') return;
    hydrated = true;
    value = read();
}

function emit() {
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    if (!bound) {
        bound = true;
        window.addEventListener('storage', (event) => {
            if (event.key !== KEY) return;
            value = read();
            emit();
        });
    }
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function useSelectedGovernorate(): [string | null, (slug: string | null) => void] {
    const current = useSyncExternalStore(
        subscribe,
        () => {
            ensureHydrated();
            return value;
        },
        () => null
    );

    const set = useCallback((slug: string | null) => {
        ensureHydrated();
        value = slug;
        try {
            if (slug) window.localStorage.setItem(KEY, slug);
            else window.localStorage.removeItem(KEY);
        } catch {
            // التخزين ممنوع: الاختيار يفضل في الذاكرة
        }
        emit();
    }, []);

    return [current, set];
}
