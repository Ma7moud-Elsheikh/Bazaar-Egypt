import { CashIcon, HandmadeIcon, ReturnIcon, TruckIcon } from '@/components/product/icons';
import { getTranslations } from 'next-intl/server';

type Props = { returnDays: number };

export async function TrustStrip({ returnDays }: Props) {
    const t = await getTranslations('Home');

    const items = [
        { icon: HandmadeIcon, title: t('trustHandmade'), text: t('trustHandmadeText') },
        { icon: TruckIcon, title: t('trustDelivery'), text: t('trustDeliveryText') },
        { icon: CashIcon, title: t('trustCod'), text: t('trustCodText') },
        {
            icon: ReturnIcon,
            title: t('trustReturns', { days: returnDays }),
            text: t('trustReturnsText')
        }
    ];

    return (
        <section aria-label={t('trustLabel')} className="relative z-10 -mt-12 px-4 sm:px-8">
            <ul
                data-theme="dark"
                className="glass-smoke-strong mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-6 rounded-[1.75rem] p-5 sm:p-7 lg:grid-cols-4"
            >
                {items.map(({ icon: Icon, title, text }) => (
                    <li key={title} className="flex items-start gap-3">
                        <Icon className="mt-0.5 size-6 shrink-0 text-accent" />
                        <div>
                            <p className="text-sm font-bold sm:text-base">{title}</p>
                            <p className="mt-0.5 text-xs text-fg/75 sm:text-sm">{text}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
