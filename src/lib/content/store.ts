import 'server-only';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { cache } from 'react';
import { buildSeed } from './seed';
import type { ContentKey, ContentShape } from './types';

/**
 * ХРАНИЛИЩЕ КОНТЕНТА
 * ==================
 * Каждый раздел живёт в отдельном JSON-файле в папке `content/`.
 *
 * Почему так, а не база данных:
 * — работает на любом хостинге с Node, без отдельного сервера БД;
 * — файлы можно открыть, прочитать глазами и положить в архив;
 * — бэкап — это скачать папку, восстановление — положить обратно.
 *
 * При первом обращении, если файла ещё нет, он создаётся из «заводских»
 * данных (`seed.ts`) — тех, что были захардкожены до появления админки.
 */

const CONTENT_DIR = path.join(process.cwd(), 'content');

function filePath(key: ContentKey) {
  return path.join(CONTENT_DIR, `${key}.json`);
}

async function ensureDir() {
  await fs.mkdir(CONTENT_DIR, { recursive: true });
}

/** Запись через временный файл: если процесс упадёт, данные не побьются. */
async function writeAtomic(target: string, data: string) {
  await ensureDir();
  const tmp = `${target}.${process.pid}.tmp`;
  await fs.writeFile(tmp, data, 'utf8');
  await fs.rename(tmp, target);
}

let seedCache: ContentShape | null = null;
function seed(): ContentShape {
  if (!seedCache) seedCache = buildSeed();
  return seedCache;
}

/**
 * Читает раздел контента. Внутри одного запроса результат переиспользуется,
 * поэтому десяток компонентов на странице не приводит к десятку чтений диска.
 */
export const getContent = cache(
  async <K extends ContentKey>(key: K): Promise<ContentShape[K]> => {
    try {
      const raw = await fs.readFile(filePath(key), 'utf8');
      return JSON.parse(raw) as ContentShape[K];
    } catch {
      // Файла ещё нет (первый запуск) или он повреждён — отдаём заводские данные
      const fallback = seed()[key];
      try {
        await writeAtomic(filePath(key), JSON.stringify(fallback, null, 2));
      } catch {
        /* хостинг с read-only диском: работаем на заводских данных */
      }
      return fallback;
    }
  },
);

export async function saveContent<K extends ContentKey>(
  key: K,
  value: ContentShape[K],
): Promise<void> {
  await writeAtomic(filePath(key), JSON.stringify(value, null, 2));
}

/** Сбросить раздел к заводским настройкам. */
export async function resetContent<K extends ContentKey>(key: K) {
  await saveContent(key, seed()[key]);
}

/** Когда контент менялся в последний раз — нужно для карты сайта. */
export async function contentUpdatedAt(key: ContentKey): Promise<Date> {
  try {
    const stat = await fs.stat(filePath(key));
    return stat.mtime;
  } catch {
    return new Date();
  }
}

/** Полный слепок всех разделов — для бэкапа. */
export async function exportAll(): Promise<ContentShape> {
  const [site, texts, projects, details, reviews, videos] = await Promise.all([
    getContent('site'),
    getContent('texts'),
    getContent('projects'),
    getContent('details'),
    getContent('reviews'),
    getContent('videos'),
  ]);
  return { site, texts, projects, details, reviews, videos };
}

export async function importAll(data: Partial<ContentShape>) {
  const keys: ContentKey[] = [
    'site',
    'texts',
    'projects',
    'details',
    'reviews',
    'videos',
  ];
  for (const key of keys) {
    const value = data[key];
    if (value !== undefined) {
      await saveContent(key, value as ContentShape[typeof key]);
    }
  }
}

/* ------------------------------------------------------------------ *
 * Удобные выборки для сайта: скрытые элементы наружу не отдаём
 * ------------------------------------------------------------------ */

export async function getVisibleProjects() {
  const projects = await getContent('projects');
  return projects.filter((p) => !p.hidden);
}

export async function getVisibleDetails() {
  const details = await getContent('details');
  return details.filter((d) => !d.hidden);
}

export async function getVisibleReviews() {
  const reviews = await getContent('reviews');
  return { ...reviews, items: reviews.items.filter((r) => !r.hidden) };
}

export async function getVisibleVideos() {
  const videos = await getContent('videos');
  return videos.filter((v) => !v.hidden);
}
