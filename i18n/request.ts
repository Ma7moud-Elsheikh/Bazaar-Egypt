import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { NAMESPACES } from './namespaces';
import { routing } from './routing';

async function loadMessages(locale: string) {
    const entries = await Promise.all(
        NAMESPACES.map(async (namespace) => {
            const mod = await import(`../messages/${locale}/${namespace}.json`);
            return [namespace, mod.default] as const;
        })
    );
    return Object.fromEntries(entries);
}

export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

    return { locale, messages: await loadMessages(locale) };
});
