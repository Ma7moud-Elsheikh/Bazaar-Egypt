import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'bazaar-egypt:wishlist';
// قيمة ثابتة لسنابشوت السيرفر (مصفوفة جديدة في كل مرة بتعمل خطأ في React)
const EMPTY: string[] = [];

let ids: string[] = EMPTY;
let hydrated = false;
let storageBound = false;
const listeners = new Set<() => void>();

function read(): string[] {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed)
            ? parsed.filter((value): value is string => typeof value === 'string')
            : [];
    } catch {
        return [];
    }
}

function write(next: string[]) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
        // التخزين ممتلئ أو ممنوع: المفضلة تفضل شغالة في الذاكرة
    }
}

function ensureHydrated() {
    if (hydrated || typeof window === 'undefined') return;
    hydrated = true;
    ids = read();
}

function emit() {
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    if (!storageBound) {
        storageBound = true;
        window.addEventListener('storage', (event) => {
            if (event.key !== STORAGE_KEY) return;
            ids = read();
            emit();
        });
    }
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export const wishlistActions = {
    toggle(productId: string) {
        ensureHydrated();
        ids = ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId];
        write(ids);
        emit();
    },

    remove(productId: string) {
        ensureHydrated();
        if (!ids.includes(productId)) return;
        ids = ids.filter((id) => id !== productId);
        write(ids);
        emit();
    },

    clear() {
        ensureHydrated();
        ids = [];
        write(ids);
        emit();
    }
};

export function useIsWishlisted(productId: string): boolean {
    return useSyncExternalStore(
        subscribe,
        () => {
            ensureHydrated();
            return ids.includes(productId);
        },
        () => false
    );
}

export function useWishlistCount(): number {
    return useSyncExternalStore(
        subscribe,
        () => {
            ensureHydrated();
            return ids.length;
        },
        () => 0
    );
}

export function useWishlistIds(): string[] {
    return useSyncExternalStore(
        subscribe,
        () => {
            ensureHydrated();
            return ids;
        },
        () => EMPTY
    );
}
