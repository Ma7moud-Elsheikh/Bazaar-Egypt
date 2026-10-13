/** دليل الهدايا: كل مناسبة مربوطة بحرفة (قرار تحريري، صاحب المتجر يقدر يغيّره) */
export const GIFT_OCCASIONS = [
    { key: 'wedding', craft: 'copperware' },
    { key: 'newHome', craft: 'pottery' },
    { key: 'corporate', craft: 'woodwork' },
    { key: 'ramadan', craft: 'glass-mosaic' }
] as const;

export const HOME_LIMITS = { shelf: 8, artisans: 3, governorates: 12 } as const;
