/**
 * ЕДИНЫЙ ЦВЕТ ДЛЯ ВСЕХ КАДРОВ
 * ==========================
 *
 * Проблема, которую он решает. По отдельности почти каждая фотография
 * выглядит прилично. Но рядом друг с другом они рассыпаются: одна
 * уходит в холодный синевато-серый, другая в жёлтый, третья блёклая,
 * четвёртая перенасыщенная. Глаз читает это мгновенно — «картинки
 * собраны из разных мест», и вся страница теряет ощущение одной
 * работы одной мастерской. Для ателье, которое продаёт именно
 * аккуратность, это дорогая мелочь.
 *
 * Что делает скрипт. Считает средний цвет каждого кадра, находит
 * общую для всего набора точку (медиану) и подтягивает каждый кадр
 * к ней — но не до конца, а на заданную долю. Полная коррекция
 * убила бы замысел конкретного кадра: тёмно-синяя кухня должна
 * оставаться тёмно-синей, терракотовая — терракотовой. Задача не
 * сделать всё одинаковым, а убрать случайный разброс.
 *
 * Дополнительно: мягкая S-кривая по яркости (возвращает глубину
 * блёклым кадрам) и лёгкое выравнивание насыщенности.
 *
 * Повторный запуск. Скрипт правит файлы на месте, поэтому второй
 * проход по уже исправленному кадру наложил бы коррекцию дважды.
 * Чтобы этого не случилось, обработанные пути он запоминает в
 * `scripts/photo-grade.state.json` и в следующий раз их пропускает.
 * Практический смысл простой: владелец кладёт в папку новые снимки,
 * запускает скрипт — и новые кадры подтягиваются к тону остальных,
 * а старые остаются нетронутыми.
 *
 * Откат. Отдельных копий исходников скрипт не держит — они и так
 * лежат в истории git: `git checkout -- public/images/kitchens`.
 *
 *   node scripts/photo-grade.mjs           # посмотреть, что получится
 *   node scripts/photo-grade.mjs --apply   # записать
 *   node scripts/photo-grade.mjs --apply --force   # пересчитать всё заново
 */
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const APPLY = process.argv.includes('--apply');
const FORCE = process.argv.includes('--force');
const DIRS = [
  'public/images/kitchens',
  'public/images/rooms',
  'public/images/millings/rooms',
];
const STATE = 'scripts/photo-grade.state.json';

/** Насколько сильно тянем кадр к общей точке: 0 — не трогать, 1 — до упора */
const PULL = 0.55;
/** Предел коррекции канала, чтобы ни один кадр не перекрасило */
const MAX_GAIN = 0.14;
/** Насыщенность тоже подтягиваем к общей, но слабее */
const SAT_PULL = 0.35;

const files = [];
for (const d of DIRS) {
  for (const f of readdirSync(d)) {
    if (!/\.webp$/i.test(f) || f.includes('@2x')) continue;
    files.push(path.join(d, f));
  }
}

const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const done = new Set(
  !FORCE && existsSync(STATE)
    ? JSON.parse(readFileSync(STATE, 'utf8')).graded
    : [],
);

// ── 1. Замеряем ────────────────────────────────────────────────────
const stat = [];
for (const f of files) {
  const s = await sharp(f).stats();
  const [r, g, b] = s.channels.map((c) => c.mean);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  // Насыщенность оцениваем по среднему разбросу каналов
  const sat = (Math.max(r, g, b) - Math.min(r, g, b)) / Math.max(1, lum);
  stat.push({ f, r, g, b, lum, sat, rr: r / lum, gr: g / lum, br: b / lum });
}

const target = {
  rr: median(stat.map((s) => s.rr)),
  gr: median(stat.map((s) => s.gr)),
  br: median(stat.map((s) => s.br)),
  sat: median(stat.map((s) => s.sat)),
};
console.log(
  `Общая точка набора: R ${target.rr.toFixed(3)}  G ${target.gr.toFixed(3)}  B ${target.br.toFixed(3)}  насыщенность ${target.sat.toFixed(3)}\n`,
);

// ── 2. Правим ──────────────────────────────────────────────────────
const clampGain = (x) => Math.min(1 + MAX_GAIN, Math.max(1 - MAX_GAIN, x));

for (const s of stat) {
  const gain = [
    clampGain(1 + PULL * (target.rr / s.rr - 1)),
    clampGain(1 + PULL * (target.gr / s.gr - 1)),
    clampGain(1 + PULL * (target.br / s.br - 1)),
  ];
  const satFix = 1 + SAT_PULL * (target.sat / Math.max(0.01, s.sat) - 1);
  const saturation = Math.min(1.18, Math.max(0.88, satFix));

  const drift = Math.round(
    Math.max(...gain.map((g) => Math.abs(g - 1))) * 100,
  );
  console.log(
    `${s.f.replace('public/images/', '').padEnd(28)} ` +
      `R×${gain[0].toFixed(3)} G×${gain[1].toFixed(3)} B×${gain[2].toFixed(3)} ` +
      `нас.×${saturation.toFixed(2)}  ${drift >= 6 ? '← заметная правка' : ''}`,
  );

  if (done.has(s.f)) {
    console.log('    уже выровнен раньше — пропускаю');
    continue;
  }
  if (!APPLY) continue;

  const kb0 = Math.round(statSync(s.f).size / 1024);
  const out = await sharp(s.f)
    .linear(gain, [0, 0, 0])
    .modulate({ saturation })
    // Мягкая S-кривая: тени чуть глубже, света чуть чище.
    // Гамма 1.03 + небольшой контраст по яркости
    .linear(1.045, -6)
    .webp({ quality: 86, effort: 6, smartSubsample: true })
    .toBuffer();
  await sharp(out).toFile(s.f);
  const kb1 = Math.round(statSync(s.f).size / 1024);
  if (kb1 > kb0 * 1.6) console.log(`    вес вырос ${kb0}→${kb1} КБ`);
}

if (APPLY) {
  for (const s of stat) done.add(s.f);
  writeFileSync(
    STATE,
    JSON.stringify({ graded: [...done].sort() }, null, 2) + '\n',
  );
}

console.log(
  APPLY
    ? '\nЗаписано. Не забудьте пересобрать второй размер: node scripts/photo-2x.mjs'
    : '\nЭто была примерка. Записать: node scripts/photo-grade.mjs --apply',
);
