import logo from '@/public/images/brand/logo.png';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';

type Props = {
    /** الارتفاع المعروض بالبكسل */
    size?: number;
    /** true = تحميل فوري (للوجو اللي فوق الصفحة) */
    priority?: boolean;
    /** خليه false لو اللوجو نفسه فيه اسم المتجر */
    withText?: boolean;
    textClassName?: string;
    className?: string;
};

export async function BrandLogo({
    size = 36,
    priority = false,
    withText = true,
    textClassName = 'font-display text-xl font-bold',
    className = ''
}: Props) {
    const tc = await getTranslations('Common');
    const name = tc('brand');
    const width = Math.round((logo.width / logo.height) * size);

    return (
        <span className={`inline-flex items-center gap-2.5 ${className}`}>
            <Image
                src={logo}
                alt={withText ? '' : name}
                width={width}
                height={size}
                loading={priority ? 'eager' : 'lazy'}
                className="shrink-0"
            />
            {withText && <span className={textClassName}>{name}</span>}
        </span>
    );
}
