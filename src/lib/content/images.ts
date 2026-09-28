import type { ImageRef, ProjectItem } from './types';

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
