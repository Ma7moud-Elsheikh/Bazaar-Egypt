import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const productsFile = path.join(root, 'data', 'products.json');
const RAW_DIR = path.join(root, 'raw-images', 'products');
const COUNT = 12;
const command = process.argv[2];

const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

const SHOTS = [
    {
        n: 3,
        kind: 'scale',
        label: 'بالمقياس',
        ar: 'بالمقياس',
        en: 'shown to scale',
        prompt: 'Shown to scale next to a familiar object (a coffee cup or a human hand) so the real size is obvious.'
    },
    {
        n: 4,
        kind: 'lifestyle',
        label: 'في الاستخدام',
        ar: 'في الاستخدام',
        en: 'in use',
        prompt: 'Styled in a warm Egyptian home setting (wooden table, soft daylight), clearly showing how it is used.'
    }
];

function topProducts(count) {
    return [...products]
        .sort(
            (a, b) =>
                (b.reviewCount ?? 0) - (a.reviewCount ?? 0) || (b.rating ?? 0) - (a.rating ?? 0)
        )
        .slice(0, count);
}

function brief() {
    const lines = ['# صور إضافية لأهم المنتجات', ''];

    topProducts(COUNT).forEach((product, index) => {
        lines.push(`## ${index + 1}. ${product.name.en} (${product.slug})`, '');

        for (const shot of SHOTS) {
            lines.push(`**${shot.label}** ← سمّي الصورة: \`${product.slug}-${shot.n}.png\``, '');
            lines.push('```');
            lines.push(
                `Create an image: photorealistic studio photograph of this handmade Egyptian product: ${product.name.en}. ${product.description.en} ${shot.prompt} Same warm sand backdrop (#E8D5B7 to #D9C3A0), soft natural side light from the left, vertical 4:5 composition, product in the upper 65% of the frame. No text, no logos, no watermark.`
            );
            lines.push('```', '');
        }
    });

    const text = `${lines.join('\n')}\n`;
    fs.writeFileSync(path.join(root, 'extra-images-brief.md'), text);
    console.log(text);
    console.log('اتحفظ كمان في extra-images-brief.md');
}

function findRaw(slug, n) {
    if (!fs.existsSync(RAW_DIR)) return undefined;
    return fs.readdirSync(RAW_DIR).find((file) => file.toLowerCase().startsWith(`${slug}-${n}.`));
}

function apply() {
    let added = 0;

    for (const product of products) {
        for (const shot of SHOTS) {
            if (!findRaw(product.slug, shot.n)) continue;

            const src = `/images/products/${product.slug}-${shot.n}.webp`;
            if (product.images.some((image) => image.src === src)) continue;

            product.images.push({
                src,
                alt: {
                    ar: `${product.name.ar} ${shot.ar}`,
                    en: `${product.name.en} ${shot.en}`
                },
                width: 1200,
                height: 1500,
                kind: shot.kind
            });
            added++;
        }
    }

    if (added === 0) {
        console.log(
            'مفيش صور جديدة. اتأكد إن الصور في raw-images/products وأسماءها <slug>-3 و<slug>-4.'
        );
        return;
    }

    fs.copyFileSync(productsFile, `${productsFile}.bak`);
    fs.writeFileSync(productsFile, `${JSON.stringify(products, null, 2)}\n`);
    console.log(`اتضافت ${added} صورة في data/products.json (نسخة احتياطية: products.json.bak)`);
}

if (command === 'brief') brief();
else if (command === 'apply') apply();
else console.log('الاستخدام: node scripts/extra-images.mjs brief | apply');
