const ARABIC_INDIC = '01021535962';
const PERSIAN = '01021535962';

export function toLatinDigits(input: string): string {
    return input.replace(/[٠-٩۰-۹]/g, (char) => {
        const arabic = ARABIC_INDIC.indexOf(char);
        return String(arabic >= 0 ? arabic : PERSIAN.indexOf(char));
    });
}

/** بيرجّع 01XXXXXXXXX، أو نص فاضي لو الرقم مش موبايل مصري صالح */
export function normalizeEgyptPhone(raw: string): string {
    let digits = toLatinDigits(raw).replace(/[^\d+]/g, '');

    if (digits.startsWith('+')) digits = digits.slice(1);
    if (digits.startsWith('0020')) digits = digits.slice(4);
    else if (digits.startsWith('20') && digits.length === 12) digits = digits.slice(2);

    if (digits.length === 10 && digits.startsWith('1')) digits = `0${digits}`;

    return /^01[0125]\d{8}$/.test(digits) ? digits : '';
}
