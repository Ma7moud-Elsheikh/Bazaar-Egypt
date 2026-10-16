import type { CSSProperties, ElementType, ReactNode } from 'react';

type Tag = 'div' | 'section' | 'li' | 'article' | 'p' | 'h2' | 'h3' | 'ul' | 'header' | 'aside';

type Props = {
    as?: Tag;
    /** تأخير بالملّي ثانية (للـ stagger في الشبكات). بيتحوّل لخطوات صغيرة في الـ CSS */
    delay?: number;
    className?: string;
    children: ReactNode;
};

/**
 * ظهور تدريجي من غير JavaScript: الحركة كلها CSS (animation-timeline: view()).
 * - المحتوى ظاهر في الـ HTML من السيرفر.
 * - اللي ظاهر أول ما الصفحة تفتح بيفضل ظاهر (من غير وميض، ومن غير تأثير على الـ LCP).
 * - المتصفح اللي ما بيدعمش الميزة، أو المستخدم اللي مفعّل تقليل الحركة: المحتوى ظاهر عادي.
 */
export function Reveal({ as = 'div', delay = 0, className, children }: Props) {
    const Tag: ElementType = as;
    const step = Math.min(Math.round(delay / 60), 6);

    return (
        <Tag
            data-reveal=""
            className={className}
            style={step > 0 ? ({ '--reveal-step': step } as CSSProperties) : undefined}
        >
            {children}
        </Tag>
    );
}
