import { persistedCartSchema, type CartGift, type CartItem } from '@/lib/schemas/cart';
import type { Product } from '@/lib/schemas/catalog';
import { useMemo, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'bazaar-egypt:cart';
const MAX_QTY = 20;

type CartState = { items: CartItem[]; isOpen: boolean };

const EMPTY_STATE: CartState = { items: [], isOpen: false };

let state: CartState = EMPTY_STATE;
let hydrated = false;
let storageBound = false;
const listeners = new Set<() => void>();

function readStorage(): CartItem[] {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = persistedCartSchema.safeParse(JSON.parse(raw));
        return parsed.success ? parsed.data.items : [];
    } catch {
        return [];
    }
}

function writeStorage(items: CartItem[]) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, items }));
    } catch {
        // التخزين ممتلئ أو ممنوع: السلة تفضل شغالة في الذاكرة
    }
}

function ensureHydrated() {
    if (hydrated || typeof window === 'undefined') return;
    hydrated = true;
    state = { ...state, items: readStorage() };
}

function emit() {
    listeners.forEach((listener) => listener());
}

function setState(next: CartState, persist: boolean) {
    state = next;
    if (persist) writeStorage(next.items);
    emit();
}

function bindStorageEvents() {
    if (storageBound) return;
    storageBound = true;
    window.addEventListener('storage', (event) => {
        if (event.key !== STORAGE_KEY) return;
        state = { ...state, items: readStorage() };
        emit();
    });
}

function subscribe(listener: () => void) {
    bindStorageEvents();
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function getSnapshot(): CartState {
    ensureHydrated();
    return state;
}

function getServerSnapshot(): CartState {
    return EMPTY_STATE;
}

function cleanCustomization(input?: Record<string, string>) {
    if (!input) return undefined;
    const entries = Object.entries(input)
        .map(([key, value]) => [key, value.trim()] as const)
        .filter(([, value]) => value !== '');
    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function cleanGift(input?: CartGift): CartGift | undefined {
    if (!input) return undefined;
    const message = input.message.trim().slice(0, 200);
    return input.wrap || message ? { wrap: input.wrap, message } : undefined;
}

function makeLineId(productId: string, customization?: Record<string, string>, gift?: CartGift) {
    const parts: string[] = [];
    if (customization) {
        parts.push(
            ...Object.keys(customization)
                .sort()
                .map((key) => `${key}=${customization[key]}`)
        );
    }
    if (gift) parts.push(`gift=${gift.wrap ? 1 : 0}:${gift.message}`);
    return parts.length > 0 ? `${productId}::${parts.join('&')}` : productId;
}

export type AddToCartInput = {
    product: Product;
    quantity?: number;
    customization?: Record<string, string>;
    gift?: CartGift;
    openDrawer?: boolean;
};

export const cartActions = {
    add({ product, quantity = 1, customization, gift, openDrawer = true }: AddToCartInput) {
        ensureHydrated();
        const cleaned = cleanCustomization(customization);
        const cleanedGift = cleanGift(gift);
        const lineId = makeLineId(product.id, cleaned, cleanedGift);
        const maxQuantity = product.madeToOrder ? MAX_QTY : Math.min(product.stock, MAX_QTY);
        if (maxQuantity < 1) return;

        const existing = state.items.find((item) => item.lineId === lineId);
        const items = existing
            ? state.items.map((item) =>
                  item.lineId === lineId
                      ? { ...item, quantity: Math.min(item.quantity + quantity, item.maxQuantity) }
                      : item
              )
            : [
                  ...state.items,
                  {
                      lineId,
                      productId: product.id,
                      slug: product.slug,
                      name: product.name,
                      price: product.price,
                      image: product.images[0],
                      quantity: Math.min(Math.max(quantity, 1), maxQuantity),
                      maxQuantity,
                      customization: cleaned,
                      gift: cleanedGift,
                      madeToOrder: product.madeToOrder,
                      leadTimeDays: product.leadTimeDays
                  }
              ];

        setState({ items, isOpen: openDrawer ? true : state.isOpen }, true);
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('cart:added'));
        }
    },

    setQuantity(lineId: string, quantity: number) {
        ensureHydrated();
        if (quantity < 1) {
            cartActions.remove(lineId);
            return;
        }
        const items = state.items.map((item) =>
            item.lineId === lineId
                ? { ...item, quantity: Math.min(quantity, item.maxQuantity) }
                : item
        );
        setState({ ...state, items }, true);
    },

    remove(lineId: string) {
        ensureHydrated();
        setState({ ...state, items: state.items.filter((item) => item.lineId !== lineId) }, true);
    },

    clear() {
        ensureHydrated();
        setState({ ...state, items: [] }, true);
    },

    open() {
        ensureHydrated();
        if (state.isOpen) return;
        setState({ ...state, isOpen: true }, false);
    },

    close() {
        if (!state.isOpen) return;
        setState({ ...state, isOpen: false }, false);
    }
};

export function useCart() {
    const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    return useMemo(
        () => ({
            items: snapshot.items,
            isOpen: snapshot.isOpen,
            count: snapshot.items.reduce((total, item) => total + item.quantity, 0),
            subtotal: snapshot.items.reduce((total, item) => total + item.price * item.quantity, 0)
        }),
        [snapshot]
    );
}
