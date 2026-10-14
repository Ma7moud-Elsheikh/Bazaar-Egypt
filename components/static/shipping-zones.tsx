import type { Locale } from '@/i18n/routing';
import { api } from '@/lib/api';
import { formatPrice, localize } from '@/lib/utils/format';
import { getTranslations } from 'next-intl/server';

export async function ShippingZones({ locale }: { locale: Locale }) {
    const t = await getTranslations('Pages');
    const config = await api.getShippingConfig();
    const zoneNames = (t.raw('shipping.zoneNames') ?? {}) as Record<string, string>;
    const list = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' });

    return (
        <div className="mb-12">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
                {t('shipping.tableTitle')}
            </h2>

            <div className="glass mt-4 overflow-x-auto rounded-[1.75rem]">
                <table className="w-full min-w-[34rem] text-start text-sm">
                    <caption className="sr-only">{t('shipping.tableTitle')}</caption>
                    <thead>
                        <tr className="border-b border-line">
                            <th scope="col" className="px-5 py-3 text-start font-semibold">
                                {t('shipping.colZone')}
                            </th>
                            <th scope="col" className="px-5 py-3 text-start font-semibold">
                                {t('shipping.colGovernorates')}
                            </th>
                            <th scope="col" className="px-5 py-3 text-start font-semibold">
                                {t('shipping.colFee')}
                            </th>
                            <th scope="col" className="px-5 py-3 text-start font-semibold">
                                {t('shipping.colEta')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {config.zones.map((zone) => {
                            const names = config.governorates
                                .filter((g) => g.zoneId === zone.id)
                                .map((g) => localize(g.name, locale));

                            return (
                                <tr
                                    key={zone.id}
                                    className="border-b border-line last:border-0 align-top"
                                >
                                    <th scope="row" className="px-5 py-4 text-start font-semibold">
                                        {zoneNames[zone.id] ?? zone.id}
                                    </th>
                                    <td className="px-5 py-4 text-fg/85">{list.format(names)}</td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        {formatPrice(zone.fee, locale)}
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        {t('shipping.etaValue', {
                                            min: zone.etaDays.min,
                                            max: zone.etaDays.max
                                        })}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
