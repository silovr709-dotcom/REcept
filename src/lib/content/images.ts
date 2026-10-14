import type { ImageRef, ProjectItem } from './types';

/**
 * Путь к загруженному изображению.
 *
 * Зачем нужна эта обёртка. Статическая витрина лежит в подпапке, и Next
 * сам дописывает её префикс к скриптам, стилям и статическим импортам.
 * Но пути из хранилища — обычные строки, а оптимизатор картинок на
 * статике отключён, поэтому к ним префикс не добавляется ниоткуда.
 * В результате на витрине все фотографии вели в никуда.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function assetUrl(src: string) {
  if (!BASE || !src.startsWith('/') || src.startsWith(BASE)) return src;
  return `${BASE}${src}`;
}

/** То же для всего объекта изображения — удобно передавать дальше. */
export function withAssetUrl<T extends ImageRef | null | undefined>(image: T): T {
  if (!image || !BASE) return image;
  return { ...image, src: assetUrl(image.src) } as T;
}

/**
 * Иллюстрации для смысловых блоков берём из портфолио, а не прописываем
 * отдельно. Так они не «протухают»: если владельцы удалят или заменят проект,
 * на сайте всё равно окажется актуальная фотография, а не битая ссылка.
 */
export function pickImage(
  projects: ProjectItem[],
  preferredSlug: string,
  fallbackIndex = 0,
): { image: ImageRef; alt: string } | null {
  if (projects.length === 0) return null;
  const found =
    projects.find((p) => p.slug === preferredSlug) ??
    projects[Math.min(fallbackIndex, projects.length - 1)];
  return found ? { image: found.image, alt: found.alt } : null;
}

/** Пропорции изображения — для сеток и блоков с фиксированной раскладкой. */
export function ratioOf(image: ImageRef) {
  return image.width / image.height;
}
