import fs from 'node:fs';
import path from 'node:path';

export const PLACEHOLDER_SRC = '/images/placeholder.svg';

// ده للتطوير بس. في الإنتاج بيرجّع الداتا زي ما هي
const isDev = process.env.NODE_ENV !== 'production';
const PUBLIC_DIR = path.join(process.cwd(), 'public');

function fileExists(src: string): boolean {
    if (!src.startsWith('/')) return true; // رابط خارجي
    return fs.existsSync(path.join(PUBLIC_DIR, src));
}

export function applyImageFallback<T>(value: T): T {
    if (!isDev) return value;

    if (Array.isArray(value)) {
        return value.map((item) => applyImageFallback(item)) as T;
    }

    if (value !== null && typeof value === 'object') {
        const result: Record<string, unknown> = {};
        for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
            if (key === 'src' && typeof child === 'string') {
                result[key] = fileExists(child) ? child : PLACEHOLDER_SRC;
            } else {
                result[key] = applyImageFallback(child);
            }
        }
        return result as T;
    }

    return value;
}

function collectSources(value: unknown, into: Set<string>) {
    if (Array.isArray(value)) {
        value.forEach((item) => collectSources(item, into));
    } else if (value !== null && typeof value === 'object') {
        for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
            if (key === 'src' && typeof child === 'string') into.add(child);
            else collectSources(child, into);
        }
    }
}

export function warnAboutMissingImages(...datasets: unknown[]) {
    if (!isDev) return;

    const sources = new Set<string>();
    datasets.forEach((data) => collectSources(data, sources));
    const missing = [...sources].filter((src) => !fileExists(src));
    if (missing.length === 0) return;

    const preview = missing
        .slice(0, 8)
        .map((src) => `  • ${src}`)
        .join('\n');
    const rest =
        missing.length > 8
            ? `\n  … و${missing.length - 8} كمان (القائمة الكاملة: npm run images:check)`
            : '';

    console.warn(
        `[images] ${missing.length} صورة ناقصة في public/ وهتظهر placeholder مكانها:\n${preview}${rest}`
    );
}
