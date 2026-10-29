import 'server-only';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import type { ImageRef } from '../content/types';

/**
 * ЗАГРУЗКА КАРТИНОК
 * =================
 * Владельцы кладут фотографию прямо с телефона или камеры, а сайт должен
 * остаться быстрым. Поэтому каждый файл проходит обработку:
 *
 * 1. Поворот по EXIF — фото с телефона не окажется боком.
 * 2. Уменьшение до 2400 px по длинной стороне: больше на сайте не нужно.
 * 3. Перекодирование в WebP — в разы легче исходного JPEG.
 * 4. Генерация размытой заглушки, чтобы вместо пустого места сразу
 *    был мягкий превью-кадр, а страница не «прыгала».
 *
 * Метаданные сохраняются рядом с контентом, поэтому пересчитывать
 * их при каждом показе не нужно.
 */

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_BYTES = 25 * 1024 * 1024;
const MAX_SIDE = 2400;

const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/heic',
  'image/heif',
  'image/gif',
]);

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/i, '')
      .replace(/[^a-z0-9а-яё]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'photo'
  );
}

export type UploadResult =
  | { ok: true; image: ImageRef }
  | { ok: false; error: string };

export async function uploadImage(file: File): Promise<UploadResult> {
  if (!file || file.size === 0) {
    return { ok: false, error: 'Файл не выбран' };
  }
  if (file.size > MAX_BYTES) {
    return {
      ok: false,
      error: `Файл больше ${Math.round(MAX_BYTES / 1024 / 1024)} МБ — уменьшите или пересохраните`,
    };
  }
  if (file.type && !ALLOWED.has(file.type)) {
    return {
      ok: false,
      error: 'Поддерживаются только изображения: JPG, PNG, WebP, AVIF, HEIC',
    };
  }

  try {
    const input = Buffer.from(await file.arrayBuffer());
    const pipeline = sharp(input, { failOn: 'none' }).rotate();

    const meta = await pipeline.metadata();
    if (!meta.width || !meta.height) {
      return { ok: false, error: 'Не удалось прочитать изображение' };
    }

    const optimized = await pipeline
      .resize({
        width: Math.min(meta.width, MAX_SIDE),
        height: Math.min(meta.height, MAX_SIDE),
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });

    // Размытая заглушка — совсем крошечная картинка прямо в HTML
    const blur = await sharp(optimized.data)
      .resize(16, 16, { fit: 'inside' })
      .webp({ quality: 40 })
      .toBuffer();

    const year = String(new Date().getFullYear());
    const dir = path.join(UPLOAD_DIR, year);
    await fs.mkdir(dir, { recursive: true });

    const unique = Date.now().toString(36);
    const fileName = `${slugify(file.name)}-${unique}.webp`;
    await fs.writeFile(path.join(dir, fileName), optimized.data);

    return {
      ok: true,
      image: {
        src: `/uploads/${year}/${fileName}`,
        width: optimized.info.width,
        height: optimized.info.height,
        blurDataURL: `data:image/webp;base64,${blur.toString('base64')}`,
      },
    };
  } catch (err) {
    console.error('[upload] не удалось обработать изображение', err);
    return {
      ok: false,
      error: 'Не удалось обработать изображение. Попробуйте другой файл.',
    };
  }
}

/** Пропорции кадра — по ним сайт сам выбирает раскладку в сетке портфолио. */
export function shapeOf(image: ImageRef): 'landscape' | 'portrait' | 'panorama' {
  const ratio = image.width / image.height;
  if (ratio > 1.9) return 'panorama';
  if (ratio < 0.95) return 'portrait';
  return 'landscape';
}
