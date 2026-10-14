import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'bazaar-egypt:recently-viewed';
const MAX = 12;
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
            ? parsed.filter((value): value is string => typeof value === 'string').slice(0, MAX)
            : [];
    } catch {
        return [];
    }
}

function write(next: string[]) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
        // مش مشكلة: القايمة مجرد تسهيل
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

/** بيسجّل زيارة منتج (الأحدث أولًا، من غير تكرار) */
export function recordView(productId: string) {
    ensureHydrated();
    if (ids[0] === productId) return;
    ids = [productId, ...ids.filter((id) => id !== productId)].slice(0, MAX);
    write(ids);
    emit();
}

export function useViewedIds(): string[] {
    return useSyncExternalStore(
        subscribe,
        () => {
            ensureHydrated();
            return ids;
        },
        () => EMPTY
    );
}
