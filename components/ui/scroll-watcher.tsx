'use client';

import { useEffect } from 'react';

/** بيحط data-scrolled على <html> بعد 8px سكرول (الـ header بيتغيّر ظله من الـ CSS) */
export function ScrollWatcher() {
    useEffect(() => {
        const root = document.documentElement;
        let frame = 0;

        const update = () => {
            frame = 0;
            root.dataset.scrolled = window.scrollY > 8 ? 'true' : 'false';
        };
        const onScroll = () => {
            if (!frame) frame = window.requestAnimationFrame(update);
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', onScroll);
            if (frame) window.cancelAnimationFrame(frame);
            delete root.dataset.scrolled;
        };
    }, []);

    return null;
}
