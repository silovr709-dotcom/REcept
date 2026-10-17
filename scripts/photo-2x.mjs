/**
 * ВТОРОЙ РАЗМЕР ДЛЯ ЭКРАНОВ С ВЫСОКОЙ ПЛОТНОСТЬЮ
 * =============================================
 *
 * Зачем. Витрина собирается в статику, а значит встроенный оптимизатор
 * картинок Next отключён: браузер получает ровно тот файл, который лежит
 * в `public`. На обычном мониторе этого хватает. Но на retina-экране
 * (а это почти все ноутбуки и телефоны) один CSS-пиксель — это два
 * физических, и фотография шириной 1536 px, растянутая на всю ширину
 * страницы 1440 px, печатается на 2880 физических точках. Браузер
 * дотягивает её своей самой дешёвой интерполяцией — получается то самое
 * «мыло», мягкие края и замыленная фактура дерева.
 *
 * Что делает скрипт. Рядом с каждым крупным кадром кладёт файл
 * `имя@2x.webp` с длинной стороной до 2400 px: увеличение по Ланцошу
 * (он держит края заметно лучше браузерного) плюс аккуратная
 * нерезкая маска. Дальше `<img srcset>` отдаёт его только тем, кому он
 * реально нужен: телефон с узким экраном по-прежнему качает маленький
 * файл, а большой монитор — крупный.
 *
 * Почему 2400, а не честные ×2. Разница между 2400 и 3072 на глаз уже
 * не видна, а вес файла отличается вдвое. Скорость загрузки для нас
 * такая же часть качества, как резкость.
 *
 * Когда запускать: после того как в `public/images` добавили или
 * заменили фотографии.
 *
 *   node scripts/photo-2x.mjs
 */
import { readdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, 'public');
const MANIFEST = path.join(ROOT, 'src', 'data', 'photo-2x.json');

/**
 * Папки с кадрами, которые где-то на сайте показываются крупно:
 * первый экран, шапки разделов, фотополосы, страница проекта.
 * Мелочи вроде текстур в сетке 167 px сюда не входят — им второй
 * размер не нужен, он только утяжелил бы страницу.
 */
const DIRS = ['images/kitchens', 'images/team', 'images/rooms'];

/** Длинная сторона увеличенного файла */
const TARGET = 2400;

const SUFFIX = '@2x';

const manifest = {};

for (const dir of DIRS) {
  const abs = path.join(PUBLIC, dir);
  if (!existsSync(abs)) continue;

  for (const name of (await readdir(abs)).sort()) {
    if (!/\.webp$/i.test(name)) continue;
    if (name.includes(SUFFIX)) continue;

    const srcFile = path.join(abs, name);
    const outName = name.replace(/\.webp$/i, `${SUFFIX}.webp`);
    const outFile = path.join(abs, outName);
    const publicPath = `/${dir}/${name}`;

    const meta = await sharp(srcFile).metadata();
    const long = Math.max(meta.width, meta.height);

    // Файл и так крупный — второй размер не нужен
    if (long >= TARGET * 0.95) continue;

    const scale = TARGET / long;
    const width = Math.round(meta.width * scale);
    const height = Math.round(meta.height * scale);

    manifest[publicPath] = {
      src: `/${dir}/${outName}`,
      width,
      height,
      base: meta.width,
    };

    // Уже собран и свежее исходника — пропускаем
    if (existsSync(outFile)) {
      const [a, b] = await Promise.all([stat(srcFile), stat(outFile)]);
      if (b.mtimeMs >= a.mtimeMs) continue;
    }

    await sharp(srcFile)
      .resize(width, height, { kernel: 'lanczos3' })
      // Мягкая нерезкая маска: возвращает краям контраст, который
      // съедает любое увеличение, но не рисует ореолов
      .sharpen({ sigma: 0.7, m1: 0.5, m2: 0.35 })
      .webp({ quality: 76, effort: 6, smartSubsample: true })
      .toFile(outFile);

    const kb = Math.round((await stat(outFile)).size / 1024);
    console.log(`  ${publicPath} → ${width}×${height}, ${kb} КБ`);
  }
}

const sorted = Object.fromEntries(
  Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)),
);
await writeFile(MANIFEST, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
console.log(
  `\nГотово: ${Object.keys(sorted).length} кадров, список в src/data/photo-2x.json`,
);
