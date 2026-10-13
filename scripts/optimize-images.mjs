import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const RAW_DIR = path.join(process.cwd(), 'raw-images');
const OUT_DIR = path.join(process.cwd(), 'public', 'images');
const EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);

// المقاس حسب أول فولدر جوه raw-images
const SIZES = {
    products: { width: 1200, height: 1500 },
    crafts: { width: 1200, height: 1500 },
    artisans: { width: 800, height: 800 }
};

async function* walk(dir) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) yield* walk(full);
        else yield full;
    }
}

async function exists(file) {
    try {
        return await fs.stat(file);
    } catch {
        return null;
    }
}

async function main() {
    if (!(await exists(RAW_DIR))) {
        console.log('مفيش فولدر raw-images/ في جذر المشروع.');
        console.log('اعمله وحط جواه products/ و crafts/ و artisans/ بالصور الأصلية.');
        return;
    }

    let converted = 0;
    let skipped = 0;
    let totalKb = 0;

    for await (const file of walk(RAW_DIR)) {
        const ext = path.extname(file).toLowerCase();
        if (!EXTENSIONS.has(ext)) continue;

        const rel = path.relative(RAW_DIR, file);
        const group = rel.split(path.sep)[0];
        const size = SIZES[group];

        if (!size) {
            console.log(`تخطّي (فولدر غير معروف): ${rel}`);
            skipped++;
            continue;
        }

        const out = path.join(OUT_DIR, `${rel.slice(0, -ext.length)}.webp`);
        const [inStat, outStat] = await Promise.all([fs.stat(file), exists(out)]);

        if (outStat && outStat.mtimeMs >= inStat.mtimeMs) {
            skipped++;
            continue;
        }

        await fs.mkdir(path.dirname(out), { recursive: true });
        await sharp(file)
            .rotate()
            .resize({ width: size.width, height: size.height, fit: 'cover', position: 'centre' })
            .webp({ quality: 80, effort: 5 })
            .toFile(out);

        const kb = (await fs.stat(out)).size / 1024;
        totalKb += kb;
        converted++;
        console.log(`✓ ${rel} → ${path.relative(process.cwd(), out)} (${kb.toFixed(0)}KB)`);
    }

    console.log(
        `\nخلصت: ${converted} اتحوّلت | ${skipped} اتخطّت | الحجم الكلي ${(totalKb / 1024).toFixed(1)}MB`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
