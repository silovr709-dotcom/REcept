#!/usr/bin/env node
/**
 * ПРОВЕРКА «ИДЕАЛЬНОГО САЙТА»
 * ===========================
 * Формальная часть требований из ИДЕАЛЬНЫЙ-САЙТ.md, проверяемая машиной.
 * Работает по готовой витрине в docs/ — то есть проверяет ровно то, что
 * увидит человек, а не намерения исходного кода.
 *
 *   npm run build:static && npm run audit
 *
 * Падает с ненулевым кодом, если нарушен хотя бы один пункт.
 * Предупреждения (WARN) не валят сборку, но их стоит разбирать.
 */

import { readFileSync, existsSync, statSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
// По умолчанию проверяется витрина для GitHub Pages (docs/, подпапка /REcept).
// Сборку для своего домена проверяем так: AUDIT_DIR=site AUDIT_BASE= npm run audit
const OUT = path.join(ROOT, process.env.AUDIT_DIR || 'docs');
const BASE = process.env.AUDIT_BASE !== undefined ? process.env.AUDIT_BASE : '/REcept';

const fails = [];
const warns = [];
const notes = [];
const fail = (rule, msg) => fails.push(`${rule}: ${msg}`);
const warn = (rule, msg) => warns.push(`${rule}: ${msg}`);

/* ------------------------------------------------------------------ */
/* сбор файлов                                                         */
/* ------------------------------------------------------------------ */

async function walk(dir, acc = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const files = await walk(OUT);
const htmlFiles = files
  .filter((f) => f.endsWith('.html'))
  .sort();

const routeOf = (f) => {
  const rel = path.relative(OUT, f).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  if (rel === '404.html') return '/404';
  return '/' + rel.replace(/\/index\.html$/, '');
};

const pages = htmlFiles
  .filter((f) => f.endsWith('index.html'))
  .map((f) => ({ file: f, route: routeOf(f), html: readFileSync(f, 'utf8') }));

/**
 * Личный кабинет — закрытая часть витрины. К нему неприменимы правила
 * продающей страницы: там нет призывов «оставить заявку», он не должен
 * попадать в карту сайта, а содержимое рисуется уже в браузере, после
 * проверки прав, — поэтому в статическом файле нет и заголовка H1.
 * Зато у кабинета есть свои обязательные проверки, они ниже, пункт 13.
 */
const isCabinet = (route) => route === '/kabinet' || route.startsWith('/kabinet/');

const strip = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/* ------------------------------------------------------------------ */
/* 1–6. метаданные, заголовки, картинки, формы                         */
/* ------------------------------------------------------------------ */

const titles = new Map();

for (const { route, html } of pages) {
  const cabinet = isCabinet(route);
  const title = /<title>([\s\S]*?)<\/title>/.exec(html)?.[1]?.trim();
  const desc = /<meta name="description" content="([^"]*)"/.exec(html)?.[1];

  if (!title) fail('title', `${route} — нет <title>`);
  else {
    if (title.length < 20 || title.length > 65)
      fail('title', `${route} — ${title.length} знаков (норма 20–65)`);
    if (titles.has(title))
      fail('title', `${route} — дубль заголовка со страницей ${titles.get(title)}`);
    titles.set(title, route);
  }

  if (!desc) fail('description', `${route} — нет описания`);
  else if (desc.length < 70 || desc.length > 165)
    fail('description', `${route} — ${desc.length} знаков (норма 70–165)`);

  const h1 = html.match(/<h1[\s>]/g)?.length ?? 0;
  if (!cabinet && h1 !== 1) fail('h1', `${route} — H1 на странице: ${h1} (норма 1)`);

  if (!/rel="canonical"/.test(html)) fail('canonical', `${route} — нет canonical`);
  if (!/property="og:image"/.test(html)) fail('open-graph', `${route} — нет og:image`);
  if (!/property="og:title"/.test(html)) fail('open-graph', `${route} — нет og:title`);
  if (!/<html lang="ru"/.test(html)) fail('lang', `${route} — не указан язык ru`);

  // alt у изображений
  const imgs = html.match(/<img\b[^>]*>/g) ?? [];
  const noAlt = imgs.filter((i) => !/\balt=/.test(i));
  if (noAlt.length) fail('alt', `${route} — без alt: ${noAlt.length} из ${imgs.length}`);

  // подписи у полей формы
  const labels = new Set([...html.matchAll(/<label[^>]*\bfor="([^"]+)"/g)].map((m) => m[1]));
  const fields = html.match(/<(input|textarea|select)\b[^>]*>/g) ?? [];
  const unlabelled = fields.filter((f) => {
    if (/type="(hidden|submit|button)"/.test(f)) return false;
    if (/aria-label=/.test(f)) return false;
    const id = /\bid="([^"]+)"/.exec(f)?.[1];
    return !id || !labels.has(id);
  });
  if (unlabelled.length)
    fail('форма', `${route} — полей без подписи: ${unlabelled.length}`);

  // порядок заголовков: h3 не должен появляться раньше h2 и т. д.
  const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  let prev = 0;
  for (const l of levels) {
    if (prev && l > prev + 1)
      warn('заголовки', `${route} — h${prev} → h${l} (пропущен уровень)`);
    prev = l;
  }

  // телефон кликабельный
  if (!cabinet && !/href="tel:/.test(html)) fail('телефон', `${route} — нет ссылки tel:`);

  // призывы к действию
  if (!cabinet) {
    const ctaHrefs = [...html.matchAll(/href="([^"]*(?:#zayavka|\/kontakty)[^"]*)"/g)].length;
    if (ctaHrefs < 2)
      fail('CTA', `${route} — ссылок на заявку/контакты: ${ctaHrefs} (норма ≥ 2)`);
  }

  // запрещённые приёмы. Клише в зачёркнутом теге <s> — это наш же блок
  // «чего у нас не будет», он проверке не подлежит.
  const honest = strip(html.replace(/<s\b[\s\S]*?<\/s>/g, ' '));
  const banned = [
    [/№\s?1\s+в\s+твери/i, '«№1 в Твери»'],
    [/лучш(ая|ий|ие)\s+(компания|мебель|кухни|ателье)/i, '«лучшая компания»'],
    [/тысячи\s+(довольных\s+)?клиентов/i, '«тысячи клиентов»'],
    [/осталось\s+\d+\s+(мест|комплект)/i, 'искусственный дефицит'],
    [/успей(те)?\s+(заказать|купить|оставить)/i, 'искусственная срочность'],
    [/акция\s+действует/i, 'акция с дедлайном'],
    [/(скидка|-)\s?\d{1,2}\s?%\s*(только|до)\b/i, 'скидка с дедлайном'],
    [/data-countdown|id="timer"/i, 'таймер обратного отсчёта'],
  ];
  for (const [re, what] of banned)
    if (re.test(honest)) fail('честность', `${route} — ${what}`);
}

notes.push(`страниц проверено: ${pages.length}`);

/* ------------------------------------------------------------------ */
/* 7. битые внутренние ссылки                                          */
/* ------------------------------------------------------------------ */

const known = new Set(htmlFiles.map((f) => routeOf(f)));
const broken = new Set();
for (const { route, html } of pages) {
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1];
    if (!href.startsWith(BASE + '/') && href !== BASE) continue;
    const clean = href.replace(/[#?].*$/, '');
    const target = clean.slice(BASE.length) || '/';
    if (/\.[a-z0-9]{2,12}$/i.test(target.split('/').pop() ?? '')) {
      if (!existsSync(path.join(OUT, target))) broken.add(`${route} → ${href}`);
      continue;
    }
    const norm = target.replace(/\/$/, '') || '/';
    if (!known.has(norm)) broken.add(`${route} → ${href}`);
  }
}
for (const b of broken) fail('ссылки', b);

/* ------------------------------------------------------------------ */
/* 8. карта сайта                                                      */
/* ------------------------------------------------------------------ */

const smPath = path.join(OUT, 'sitemap.xml');
if (!existsSync(smPath)) fail('sitemap', 'нет sitemap.xml');
else {
  const sm = readFileSync(smPath, 'utf8');
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    new URL(m[1]).pathname.replace(/\/$/, '') || '/',
  );
  const set = new Set(locs);
  const publicRoutes = pages
    .map((p) => p.route)
    .filter((r) => r !== '/404' && !isCabinet(r));
  for (const r of publicRoutes)
    if (!set.has(r)) fail('sitemap', `страница ${r} не попала в карту сайта`);
  notes.push(`адресов в карте сайта: ${locs.length}`);
}
if (!existsSync(path.join(OUT, 'robots.txt'))) fail('robots', 'нет robots.txt');
if (!existsSync(path.join(OUT, '404.html'))) fail('404', 'нет страницы 404');

/* ------------------------------------------------------------------ */
/* 9. вес скриптов                                                     */
/* ------------------------------------------------------------------ */

const JS_LIMIT = 600 * 1024;
// Кабинет — приложение для вошедшего заказчика, а не страница захвата:
// там неизбежен клиент базы данных. Скорость первой встречи с сайтом он
// не портит, потому что публичные страницы его не загружают.
const JS_LIMIT_CABINET = 1000 * 1024;
let heaviest = 0;
let heaviestCabinet = 0;
for (const { route, html } of pages) {
  const srcs = new Set([...html.matchAll(/src="([^"]+\.js)"/g)].map((m) => m[1]));
  let total = 0;
  for (const s of srcs) {
    const p = path.join(OUT, s.slice(BASE.length));
    if (existsSync(p)) total += statSync(p).size;
  }
  const limit = isCabinet(route) ? JS_LIMIT_CABINET : JS_LIMIT;
  if (isCabinet(route)) heaviestCabinet = Math.max(heaviestCabinet, total);
  else heaviest = Math.max(heaviest, total);
  if (total > limit)
    fail('скрипты', `${route} — ${Math.round(total / 1024)} КБ (лимит ${limit / 1024} КБ)`);
}
notes.push(`самая «тяжёлая» страница по JS: ${Math.round(heaviest / 1024)} КБ без сжатия`);
if (heaviestCabinet)
  notes.push(`самая «тяжёлая» страница кабинета: ${Math.round(heaviestCabinet / 1024)} КБ без сжатия`);

/* ------------------------------------------------------------------ */
/* 10. лишние файлы в публикации                                       */
/* ------------------------------------------------------------------ */

const textBlob = files
  .filter((f) => /\.(html|css|js|json|xml|txt|webmanifest)$/.test(f))
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n');

const assets = files.filter((f) =>
  /\.(webp|avif|jpe?g|png|gif|svg|mp4|webm|woff2?)$/i.test(f),
);
const orphans = assets.filter((f) => {
  const name = path.basename(f);
  if (/^(favicon|apple-touch-icon|og-)/.test(name)) return false;
  return !textBlob.includes(name);
});
const orphanKb = orphans.reduce((s, f) => s + statSync(f).size, 0) / 1024;
if (orphans.length)
  (orphanKb > 256 ? fail : warn)(
    'лишние файлы',
    `в витрине ${orphans.length} неиспользуемых файлов (${Math.round(orphanKb)} КБ): ` +
      orphans.slice(0, 5).map((f) => path.relative(OUT, f)).join(', ') +
      (orphans.length > 5 ? ' …' : ''),
  );

/* ------------------------------------------------------------------ */
/* 11. ссылки на корень вместо basePath                                */
/* ------------------------------------------------------------------ */

// Когда сайт лежит в подпапке (GitHub Pages), ссылка «от корня» ведёт в
// никуда. На собственном домене сайт лежит в корне — там это норма,
// и проверять нечего.
if (BASE) {
  const rootRefs = [
    ...textBlob.matchAll(/(?:src|href|srcset)="\/(images|uploads|favicon|og|fonts|_next)[^"]*"/g),
  ].length;
  if (rootRefs) fail('basePath', `ссылок мимо ${BASE}: ${rootRefs}`);
} else {
  const stray = [...textBlob.matchAll(/(?:src|href|srcset)="\/REcept\//g)].length;
  if (stray) fail('basePath', `в сборке для домена остались ссылки с /REcept/: ${stray}`);
}

/* ------------------------------------------------------------------ */
/* 12. контраст текста (по палитре и классам Tailwind)                 */
/* ------------------------------------------------------------------ */

const palette = {
  ink: '#121110',
  coal: '#2a2926',
  cream: '#faf9f7',
  bone: '#f2f1ee',
  sand: '#e8e6e2',
  stone: '#6f6c66',
  clay: '#a8a49c',
  brass: '#4a4741',
  brasslight: '#b8b4ac',
};
const lum = (hex) => {
  const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = v.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const mix = (fg, bg, a) => {
  const ch = (h, i) => parseInt(h.slice(i, i + 2), 16);
  const c = [1, 3, 5].map((i) => Math.round(ch(fg, i) * a + ch(bg, i) * (1 - a)));
  return '#' + c.map((n) => n.toString(16).padStart(2, '0')).join('');
};

// базовые пары, которые обязаны проходить AA
for (const [fg, bg] of [
  ['stone', 'cream'],
  ['stone', 'bone'],
  ['brass', 'cream'],
  ['ink', 'bone'],
  ['cream', 'ink'],
  ['clay', 'ink'],
  ['brasslight', 'ink'],
]) {
  const r = ratio(palette[fg], palette[bg]);
  if (r < 4.5) fail('контраст', `${fg} на ${bg} — ${r.toFixed(2)}:1 (норма 4.5)`);
}

// полупрозрачный текст в исходниках
const srcFiles = (await walk(path.join(ROOT, 'src'))).filter((f) => /\.tsx?$/.test(f));
const DECORATIVE = /aria-hidden|decoration-|placeholder:/;
for (const f of srcFiles) {
  if (f.includes(path.join('components', 'admin'))) continue; // закрытая часть
  const src = readFileSync(f, 'utf8');
  const lines = src.split('\n');
  lines.forEach((line, i) => {
    const window = lines.slice(Math.max(0, i - 6), i + 4).join(' ');
    for (const m of line.matchAll(/text-(cream|ink|stone|clay|brass)\/(\d{2})\b/g)) {
      const [, tone, pctRaw] = m;
      const pct = Number(pctRaw) / 100;
      const bg = tone === 'cream' ? palette.ink : palette.cream;
      const r = ratio(mix(palette[tone], bg, pct), bg);
      if (r >= 4.5) continue;
      if (DECORATIVE.test(line) || DECORATIVE.test(window)) continue;
      // крупный текст (≥ 1.375rem или display-заголовки) допускает 3:1
      const big = /text-h[123]|text-\[(1\.[4-9]|[2-9])/.test(line);
      if (big && r >= 3) continue;
      const where = `${path.relative(ROOT, f)}:${i + 1}`;
      fail('контраст', `${where} — ${m[0]} даёт ${r.toFixed(2)}:1`);
    }
  });
}

/* ------------------------------------------------------------------ */
/* 13. личный кабинет: закрытость и отсутствие секретов                */
/* ------------------------------------------------------------------ */

const cabinetPages = pages.filter((p) => isCabinet(p.route));
if (cabinetPages.length === 0) {
  warn('кабинет', 'в витрине нет ни одной страницы кабинета');
} else {
  for (const { route, html } of cabinetPages) {
    if (!/<meta name="robots"[^>]*noindex/i.test(html))
      fail('кабинет', `${route} — нет запрета индексации (noindex)`);
  }
  notes.push(`страниц кабинета: ${cabinetPages.length} (все закрыты от индексации)`);

  if (existsSync(smPath)) {
    const sm = readFileSync(smPath, 'utf8');
    for (const { route } of cabinetPages)
      if (sm.includes(`${route}/</loc>`) || sm.includes(`${route}</loc>`))
        fail('кабинет', `${route} попал в карту сайта`);
  }

  const robots = existsSync(path.join(OUT, 'robots.txt'))
    ? readFileSync(path.join(OUT, 'robots.txt'), 'utf8')
    : '';
  if (!/Disallow:\s*\/kabinet/.test(robots))
    fail('кабинет', 'в robots.txt нет запрета на /kabinet');

  // Ключ доступа к базе кабинета подкладывается файлом рядом с витриной.
  const cfg = path.join(OUT, 'kabinet-config.js');
  if (!existsSync(cfg)) fail('кабинет', 'в витрине нет kabinet-config.js');

  // Служебный ключ Supabase обходит все правила доступа. В браузер он не
  // попадает никогда — ни в конфиг, ни в собранные скрипты.
  const secretish = [
    [/service_role/i, 'строка service_role'],
    [/SUPABASE_SERVICE[_A-Z]*KEY/i, 'имя служебного ключа'],
    [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/, 'похоже на JWT-ключ'],
  ];
  const jsFiles = files.filter((f) => /\.(js|json)$/.test(f));
  // Комментарии не исполняются: предупреждение «service_role сюда нельзя»
  // в шапке конфига — это не утечка, а инструкция владельцам.
  const dropComments = (code) =>
    code.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');
  for (const f of jsFiles) {
    const src = dropComments(readFileSync(f, 'utf8'));
    for (const [re, what] of secretish) {
      const hit = re.exec(src);
      if (!hit) continue;
      // Анонимный ключ — публичный по замыслу, он и должен лежать в конфиге.
      if (what.startsWith('похоже') && /anon/i.test(src.slice(Math.max(0, hit.index - 200), hit.index)))
        continue;
      fail('кабинет', `${path.relative(OUT, f)} — ${what}`);
    }
  }
}

/* ------------------------------------------------------------------ */
/* итог                                                                */
/* ------------------------------------------------------------------ */

for (const n of notes) console.log(`  · ${n}`);
if (warns.length) {
  console.log('\nПредупреждения:');
  for (const w of warns) console.log(`  ! ${w}`);
}
if (fails.length) {
  console.log('\nНарушения нормы:');
  for (const f of fails) console.log(`  ✗ ${f}`);
  console.log(`\nПроверка не пройдена: ${fails.length}.`);
  process.exit(1);
}
console.log('\nВсе проверки пройдены — сайт соответствует ИДЕАЛЬНЫЙ-САЙТ.md.');
