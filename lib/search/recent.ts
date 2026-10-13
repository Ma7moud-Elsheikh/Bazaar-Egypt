const KEY = 'bazaar-egypt:recent-searches';
const MAX = 5;

export function readRecent(): string[] {
    try {
        const raw = window.localStorage.getItem(KEY);
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed)
            ? parsed.filter((value): value is string => typeof value === 'string').slice(0, MAX)
            : [];
    } catch {
        return [];
    }
}

function write(list: string[]) {
    try {
        window.localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
        // التخزين ممتلئ أو ممنوع: مش مشكلة، آخر عمليات البحث مجرد تسهيل
    }
}

export function addRecent(query: string): string[] {
    const value = query.trim();
    if (!value) return readRecent();

    const next = [
        value,
        ...readRecent().filter((item) => item.toLowerCase() !== value.toLowerCase())
    ].slice(0, MAX);

    write(next);
    return next;
}

export function clearRecent(): string[] {
    write([]);
    return [];
}
