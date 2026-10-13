import type { Locale } from '@/i18n/routing';
import logo from '@/public/images/brand/logo.png';

// غيّر امتداد الاستيراد ولـ LOGO_PATH مع بعض لو اللوجو مش PNG
export const LOGO_PATH = '/images/brand/logo.png';
export const LOGO = { path: LOGO_PATH, width: logo.width, height: logo.height };

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
    /\/$/,
    ''
);

// الفهرسة تتفعّل على نسخة Vercel الإنتاجية بس
export const IS_PRODUCTION = process.env.VERCEL_ENV === 'production';

export const SITE_NAME: Record<Locale, string> = {
    ar: 'بازار مصر',
    en: 'Bazaar Egypt'
};

export const OG_LOCALE: Record<Locale, string> = {
    ar: 'ar_EG',
    en: 'en_US'
};

export const THEME_COLOR = '#1A1410';

// رقم الواتساب بالصيغة الدولية من غير + (مثال: 201000000000). لو فاضي الزر بيختفي
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '');

export function whatsappLink(message: string): string | null {
    if (!WHATSAPP_NUMBER) return null;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
