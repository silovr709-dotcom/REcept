#!/usr/bin/env node
/**
 * Полный аудит изображений сайта.
 *
 * Запускается после статической сборки через `npm run audit`. Проверяет:
 * — все публичные изображения читаются и попадают в экспорт;
 * — ссылки из исходников и готовых HTML ведут к существующим файлам;
 * — карты @2x не ссылаются на потерянные или чужие изображения;
 * — у каждой фрезеровки своя выкраска, а каждая опубликованная визуализация
 *   привязана к рисунку с тем же slug и имеет подпись;
 * — крупные планы проектов привязаны к своему проекту и файлу.
 *
 * Сопоставление рисунка фрезеровки и фотографии остаётся визуальной
 * проверкой: одинаковые имена и существующие файлы сами по себе не
 * доказывают, что рисунок на фасаде совпадает с каталогом.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import ts from 'typescript';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const OUT = path.join(ROOT, process.env.AUDIT_DIR || 'docs');
const BASE = process.env.AUDIT_BASE !== undefined ? process.env.AUDIT_BASE : '/REcept';
const failures = [];
const notes = [];
const fail = (rule, message) => failures.push(`${rule}: ${message}`);
const imageExt = /\.(?:webp|avif|jpe?g|png|gif)$/i;
const allImageExt = /\.(?:webp|avif|jpe?g|png|gif|svg|ico)$/i;

async function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

function sourceFile(relativePath) {
  const file = path.join(ROOT, relativePath);
  return ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
}

function constInitializer(source, name) {
  let found;
  const visit = (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === name
    ) {
      found = node.initializer;
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

function propertyName(property) {
  if (!property.name) return undefined;
  if (
    ts.isIdentifier(property.name) ||
    ts.isStringLiteral(property.name) ||
    ts.isNumericLiteral(property.name)
  ) {
    return property.name.text;
  }
  return undefined;
}

function propertyOf(object, key) {
  if (!object || !ts.isObjectLiteralExpression(object)) return undefined;
  return object.properties.find(
    (property) => ts.isPropertyAssignment(property) && propertyName(property) === key,
  )?.initializer;
}

function stringValue(node) {
  return node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    ? node.text
    : undefined;
}

function stringArray(node) {
  if (!node || !ts.isArrayLiteralExpression(node)) return [];
  return node.elements.map(stringValue).filter((value) => value !== undefined);
}

function recordsFromArray(source, variable) {
  const initializer = constInitializer(source, variable);
  if (!initializer || !ts.isArrayLiteralExpression(initializer)) {
    fail('данные', `не найден массив ${variable}`);
    return [];
  }
  return initializer.elements.filter(ts.isObjectLiteralExpression);
}

function defaultImports(source, prefix) {
  const imports = new Map();
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const module = stringValue(statement.moduleSpecifier);
    const local = statement.importClause?.name;
    if (module?.startsWith(prefix) && local && ts.isIdentifier(local)) {
      imports.set(local.text, module);
    }
  }
  return imports;
}

function imageSlug(module) {
  return module ? path.basename(module, path.extname(module)) : undefined;
}

function getLiteral(object, key, source) {
  return stringValue(propertyOf(object, key));
}

/* 1. Публичные файлы изображений: наличие, размер и полная декодировка. */
const publicFiles = await walk(PUBLIC);
const rasterFiles = publicFiles.filter((file) => imageExt.test(file));
const metadataByPath = new Map();
let decoded = 0;
const decodeQueue = [...rasterFiles];
const workers = Array.from({ length: 8 }, async () => {
  while (decodeQueue.length) {
    const file = decodeQueue.pop();
    if (!file) continue;
    try {
      const info = await sharp(file).metadata();
      if (!info.width || !info.height) {
        fail('декодирование', `${path.relative(ROOT, file)} — нет размеров`);
        continue;
      }
      // metadata() проверяет заголовок; toBuffer() заставляет декодировать
      // пиксели целиком и находит повреждённые файлы, которые браузер не покажет.
      await sharp(file).rotate().toBuffer();
      const relative = `/${path.relative(PUBLIC, file).split(path.sep).join('/')}`;
      metadataByPath.set(relative, { width: info.width, height: info.height });
      decoded += 1;
    } catch (error) {
      fail(
        'декодирование',
        `${path.relative(ROOT, file)} — ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
});
await Promise.all(workers);

for (const file of publicFiles.filter((p) => allImageExt.test(p))) {
  try {
    const info = await stat(file);
    if (info.size === 0) fail('пустой файл', `${path.relative(ROOT, file)} — 0 байт`);
  } catch (error) {
    fail('файл', `${path.relative(ROOT, file)} — ${String(error)}`);
  }
}

/* 2. Каждый указанный в исходниках путь к изображению существует. */
const sourceFiles = (await walk(path.join(ROOT, 'src'))).filter((file) =>
  /\.(?:ts|tsx|js|jsx|json)$/i.test(file),
);
const sourceImageRefs = new Set();
const sourcePathPattern = /(?:@public)?\/images\/[A-Za-z0-9_./@-]+\.(?:webp|avif|jpe?g|png|gif|svg|ico)/gi;
for (const file of sourceFiles) {
  const source = await readFile(file, 'utf8');
  for (const match of source.matchAll(sourcePathPattern)) {
    const value = match[0].replace(/^@public/, '');
    sourceImageRefs.add(value);
  }
}
for (const reference of sourceImageRefs) {
  const target = path.join(PUBLIC, reference.replace(/^\//, ''));
  if (!existsSync(target)) fail('исходник', `${reference} → файла нет в public/`);
}

/* 3. Все статические изображения действительно скопированы в экспорт. */
if (!existsSync(OUT)) {
  fail('сборка', `нет каталога ${path.relative(ROOT, OUT)}; сначала выполните статическую сборку`);
} else {
  for (const file of publicFiles.filter((p) => allImageExt.test(p))) {
    const relative = path.relative(PUBLIC, file);
    const copy = path.join(OUT, relative);
    if (!existsSync(copy)) {
      fail('экспорт', `${path.relative(ROOT, file)} не попал в ${path.relative(ROOT, OUT)}/`);
    }
  }
}

/* 4. Путь и srcset каждой картинки из HTML собранного сайта существуют. */
function htmlAttribute(tag, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|\\s)${escaped}\\s*=\\s*(["'])(.*?)\\1`, 'i').exec(tag)?.[2];
}

const checkedHtmlImages = new Set();
function checkBuiltUrl(value, page, attribute) {
  const url = value.trim().split(/\s+/)[0];
  if (!url || /^(?:data:|blob:|https?:|\/\/|#)/i.test(url)) return;
  const pathname = url.split(/[?#]/, 1)[0];
  let localPath;
  try {
    localPath = decodeURIComponent(pathname);
  } catch {
    fail('HTML', `${path.relative(ROOT, page)} — некорректный URL ${url}`);
    return;
  }
  if (BASE && (localPath === BASE || localPath.startsWith(`${BASE}/`))) {
    localPath = localPath.slice(BASE.length) || '/';
  }
  if (!localPath.startsWith('/')) {
    localPath = path.posix.join(path.posix.dirname(`/${path.relative(OUT, page).split(path.sep).join('/')}`), localPath);
  }
  const target = path.join(OUT, localPath.replace(/^\/+/, ''));
  checkedHtmlImages.add(`${page}:${url}`);
  if (!existsSync(target)) {
    fail('HTML', `${path.relative(ROOT, page)} — ${attribute} ${url} не найден`);
  }
}

let htmlCount = 0;
if (existsSync(OUT)) {
  const htmlFiles = (await walk(OUT)).filter((file) => file.endsWith('.html'));
  htmlCount = htmlFiles.length;
  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    const tags = html.match(/<(?:img|source|video|image)\b[^>]*>/gi) ?? [];
    for (const tag of tags) {
      const sourceTag = /^<(?:img|source)\b/i.test(tag);
      const svgImageTag = /^<image\b/i.test(tag);
      const src = sourceTag ? htmlAttribute(tag, 'src') : undefined;
      const srcset = sourceTag ? htmlAttribute(tag, 'srcset') : undefined;
      const poster = /^<video\b/i.test(tag)
        ? htmlAttribute(tag, 'poster')
        : undefined;
      const svgHref = svgImageTag
        ? htmlAttribute(tag, 'href') ?? htmlAttribute(tag, 'xlink:href')
        : undefined;
      if (src) checkBuiltUrl(src, file, 'src');
      if (poster) checkBuiltUrl(poster, file, 'poster');
      if (svgHref) checkBuiltUrl(svgHref, file, 'href');
      if (srcset) {
        for (const candidate of srcset.split(',')) {
          const url = candidate.trim().split(/\s+/)[0];
          if (url) checkBuiltUrl(url, file, 'srcset');
        }
      }
      if (/^<img\b/i.test(tag) && !src && !srcset) {
        fail('HTML', `${path.relative(ROOT, file)} — <img> без src/srcset`);
      }
    }
  }
}

/* 5. Все варианты высокой плотности существуют и совпадают с базовым кадром. */
const retinaPath = path.join(ROOT, 'src/data/photo-2x.json');
if (existsSync(retinaPath)) {
  const retina = JSON.parse(await readFile(retinaPath, 'utf8'));
  let retinaCount = 0;
  for (const [base, variant] of Object.entries(retina)) {
    const variantPath = variant?.src;
    if (typeof variantPath !== 'string' || !variantPath.startsWith('/images/')) {
      fail('@2x', `${base} — некорректный путь второго размера`);
      continue;
    }
    const baseInfo = metadataByPath.get(base);
    const variantInfo = metadataByPath.get(variantPath);
    if (!baseInfo) fail('@2x', `${base} — исходного файла нет или он не декодируется`);
    if (!variantInfo) fail('@2x', `${variantPath} — файла нет или он не декодируется`);
    if (baseInfo && variantInfo) {
      if (variantInfo.width <= baseInfo.width || variantInfo.height <= baseInfo.height) {
        fail('@2x', `${variantPath} не крупнее исходника ${base}`);
      }
      if (variant.width !== variantInfo.width || variant.height !== variantInfo.height) {
        fail('@2x', `${variantPath} — размеры в photo-2x.json не совпадают с файлом`);
      }
      if (variant.base !== baseInfo.width) {
        fail('@2x', `${base} — ширина base в photo-2x.json не совпадает с файлом`);
      }
      const [basePixels, variantPixels] = await Promise.all(
        [base, variantPath].map((image) =>
          sharp(path.join(PUBLIC, image.replace(/^\//, '')))
            .resize(48, 48, { fit: 'fill' })
            .greyscale()
            .raw()
            .toBuffer(),
        ),
      );
      let difference = 0;
      for (let i = 0; i < basePixels.length; i += 1) {
        difference += Math.abs(basePixels[i] - variantPixels[i]);
      }
      const meanDifference = difference / basePixels.length;
      if (meanDifference > 8) {
        fail('@2x', `${variantPath} визуально отличается от ${base} (средняя разница ${meanDifference.toFixed(1)})`);
      }
    }
    retinaCount += 1;
  }
  notes.push(`пары @2x проверено: ${retinaCount}`);
} else {
  fail('@2x', 'нет src/data/photo-2x.json');
}

/* 6. Каждая фрезеровка имеет выкраску; проверенные визуализации — необязательная привязка. */
const millingsSource = sourceFile('src/data/millings.ts');
const millingsRecords = recordsFromArray(millingsSource, 'millings');
const millingSlugs = new Set(
  millingsRecords.map((record) => getLiteral(record, 'slug', millingsSource)).filter(Boolean),
);
const millingRoot = path.join(PUBLIC, 'images/millings');
const roomRoot = path.join(millingRoot, 'rooms');
const swatchSlugs = new Set(
  (await readdir(millingRoot)).filter((name) => name.endsWith('.webp') && !name.includes('@2x'))
    .map((name) => path.basename(name, '.webp')),
);
const roomFileSlugs = new Set(
  (await readdir(roomRoot)).filter((name) => name.endsWith('.webp') && !name.includes('@2x'))
    .map((name) => path.basename(name, '.webp')),
);
const roomsSource = sourceFile('src/data/milling-rooms.ts');
const roomImports = defaultImports(roomsSource, '@public/images/millings/rooms/');
const roomRecord = constInitializer(roomsSource, 'millingRooms');
const roomMappings = new Map();
if (!roomRecord || !ts.isObjectLiteralExpression(roomRecord)) {
  fail('фрезеровки', 'не найден объект millingRooms');
} else {
  for (const property of roomRecord.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const slug = propertyName(property);
    const value = property.initializer;
    if (!slug || !ts.isObjectLiteralExpression(value)) continue;
    const imageNode = propertyOf(value, 'image');
    const imageName = imageNode && ts.isIdentifier(imageNode) ? imageNode.text : undefined;
    const imagePath = imageName ? roomImports.get(imageName) : undefined;
    const importedSlug = imageSlug(imagePath);
    roomMappings.set(slug, importedSlug);
    if (!imagePath) fail('фрезеровки', `${slug} — нет импорта интерьерной визуализации`);
    else if (importedSlug !== slug) {
      fail('фрезеровки', `${slug} привязана к изображению ${importedSlug}.webp`);
    }
    if (!getLiteral(value, 'alt', roomsSource)) fail('фрезеровки', `${slug} — нет alt`);
    if (!getLiteral(value, 'caption', roomsSource)) fail('фрезеровки', `${slug} — нет подписи`);
  }
}
const compareSets = (label, expected, actual) => {
  for (const slug of expected) if (!actual.has(slug)) fail(label, `нет ${slug}`);
  for (const slug of actual) if (!expected.has(slug)) fail(label, `лишний ${slug}`);
};
compareSets('выкраски/данные', millingSlugs, swatchSlugs);
const mappedRoomSlugs = new Set(roomMappings.keys());
const importedRoomSlugs = new Set([...roomImports.values()].map(imageSlug));
for (const slug of mappedRoomSlugs) {
  if (!millingSlugs.has(slug)) fail('визуализации/данные', `${slug} — нет такой фрезеровки`);
  if (!roomFileSlugs.has(slug)) fail('визуализации/файлы', `${slug} — нет интерьерной визуализации`);
}
for (const slug of importedRoomSlugs) {
  if (!mappedRoomSlugs.has(slug)) fail('визуализации/импорты', `${slug} — импорт не используется`);
}
notes.push(`фрезеровок/выкрасок: ${millingSlugs.size}`);
notes.push(`привязок «выкраска/визуализация» по slug: ${mappedRoomSlugs.size}`);

/* 7. Снимок проекта и его детали должны быть привязаны друг к другу. */
const projectsSource = sourceFile('src/data/projects.ts');
const projectsRecords = recordsFromArray(projectsSource, 'projects');
const projectImports = defaultImports(projectsSource, '@public/images/kitchens/');
const projects = [];
for (const record of projectsRecords) {
  const slug = getLiteral(record, 'slug', projectsSource);
  const imageNode = propertyOf(record, 'image');
  const imageName = imageNode && ts.isIdentifier(imageNode) ? imageNode.text : undefined;
  const imagePath = imageName ? projectImports.get(imageName) : undefined;
  const imageStem = imageSlug(imagePath);
  const detailIds = stringArray(propertyOf(record, 'detailIds'));
  if (slug) projects.push({ slug, detailIds, imageStem });
  if (!imagePath) fail('портфолио', `${slug || '(без slug)'} — нет импорта главного фото`);
}

const detailsSource = sourceFile('src/data/details.ts');
const detailImports = defaultImports(detailsSource, '@public/images/textures/');
const detailsRecords = recordsFromArray(detailsSource, 'details');
const details = [];
for (const record of detailsRecords) {
  const id = getLiteral(record, 'id', detailsSource);
  const project = getLiteral(record, 'project', detailsSource);
  const imageNode = propertyOf(record, 'image');
  const imageName = imageNode && ts.isIdentifier(imageNode) ? imageNode.text : undefined;
  const imagePath = imageName ? detailImports.get(imageName) : undefined;
  const imageStem = imageSlug(imagePath);
  if (id && project) details.push({ id, project, imageStem });
  if (!imagePath) fail('детали проекта', `${id || '(без id)'} — нет импорта файла`);
  else if (imageStem !== id) fail('детали проекта', `${id} привязана к изображению ${imageStem}.webp`);
  if (!getLiteral(record, 'alt', detailsSource)) fail('детали проекта', `${id} — нет alt`);
  if (!getLiteral(record, 'note', detailsSource)) fail('детали проекта', `${id} — нет подписи`);
}

for (const project of projects) {
  for (const id of project.detailIds) {
    const detail = details.find((item) => item.id === id);
    if (!detail) fail('детали проекта', `${project.slug} ссылается на отсутствующую деталь ${id}`);
    else if (detail.project !== project.slug) {
      fail('детали проекта', `${id} указана у ${project.slug}, но в данных принадлежит ${detail.project}`);
    }
  }
}
for (const detail of details) {
  const project = projects.find((item) => item.slug === detail.project);
  if (!project) fail('детали проекта', `${detail.id} указывает на неизвестный проект ${detail.project}`);
  else if (!project.detailIds.includes(detail.id)) {
    fail('детали проекта', `${detail.id} отсутствует в detailIds проекта ${project.slug}`);
  }
}
notes.push(`проектов/крупных планов: ${projects.length}/${details.length}`);

/* Итог. */
console.log(`  · публичных растровых изображений декодировано: ${decoded}`);
console.log(`  · путей к изображениям в исходниках проверено: ${sourceImageRefs.size}`);
console.log(`  · локальных ссылок img/srcset в HTML проверено: ${checkedHtmlImages.size} (${htmlCount} страниц)`);
for (const note of notes) console.log(`  · ${note}`);
if (failures.length) {
  console.log('\nОшибки аудита изображений:');
  for (const failure of failures) console.log(`  ✗ ${failure}`);
  console.log(`\nАудит не пройден: ${failures.length}.`);
  process.exit(1);
}
console.log('\nАудит изображений пройден.');
