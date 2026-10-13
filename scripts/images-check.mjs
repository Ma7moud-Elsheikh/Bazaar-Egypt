import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sources = new Set();

function collect(value) {
    if (Array.isArray(value)) {
        value.forEach(collect);
    } else if (value && typeof value === 'object') {
        for (const [key, child] of Object.entries(value)) {
            if (key === 'src' && typeof child === 'string') sources.add(child);
            else collect(child);
        }
    }
}

for (const name of ['crafts', 'artisans', 'products']) {
    const file = path.join(root, 'data', `${name}.json`);
    collect(JSON.parse(fs.readFileSync(file, 'utf8')));
}

const missing = [...sources].filter(
    (src) => src.startsWith('/') && !fs.existsSync(path.join(root, 'public', src))
);

console.log(
    `الصور المطلوبة: ${sources.size} | الموجودة: ${sources.size - missing.length} | الناقصة: ${missing.length}`
);

if (missing.length > 0) {
    fs.writeFileSync(path.join(root, 'images-checklist.txt'), `${missing.join('\n')}\n`);
    console.log('\nالقائمة الكاملة اتحفظت في images-checklist.txt');
    console.log('أول 10 ناقصين:');
    missing.slice(0, 10).forEach((src) => console.log(`  ${src}`));
}
