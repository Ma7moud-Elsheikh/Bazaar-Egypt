import fs from 'node:fs';
import path from 'node:path';

const root = path.join(process.cwd(), 'messages');

for (const locale of ['ar', 'en']) {
    const file = path.join(root, `${locale}.json`);

    if (!fs.existsSync(file)) {
        console.log(`تخطّي ${locale}: ${locale}.json مش موجود`);
        continue;
    }

    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const dir = path.join(root, locale);
    fs.mkdirSync(dir, { recursive: true });

    for (const [namespace, value] of Object.entries(data)) {
        fs.writeFileSync(
            path.join(dir, `${namespace}.json`),
            `${JSON.stringify(value, null, 2)}\n`
        );
    }

    fs.renameSync(file, `${file}.bak`);
    console.log(`${locale}: ${Object.keys(data).length} ملف اتعمل في messages/${locale}/`);
}
