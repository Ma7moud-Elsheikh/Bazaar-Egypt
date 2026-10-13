import type { ShippingConfig } from '@/lib/schemas/shipping';
import { useEffect, useState } from 'react';

export type ShippingState =
    | { status: 'loading' }
    | { status: 'ready'; config: ShippingConfig }
    | { status: 'error' };

let cache: Promise<ShippingConfig> | null = null;

function load(): Promise<ShippingConfig> {
    cache ??= fetch('/api/shipping/config')
        .then((res) => {
            if (!res.ok) throw new Error('shipping config failed');
            return res.json() as Promise<ShippingConfig>;
        })
        .catch((error) => {
            cache = null;
            throw error;
        });
    return cache;
}

export function useShippingConfig(): ShippingState {
    const [state, setState] = useState<ShippingState>({ status: 'loading' });

    useEffect(() => {
        let active = true;
        load()
            .then((config) => {
                if (active) setState({ status: 'ready', config });
            })
            .catch(() => {
                if (active) setState({ status: 'error' });
            });
        return () => {
            active = false;
        };
    }, []);

    return state;
}
