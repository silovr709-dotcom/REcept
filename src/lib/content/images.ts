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

/**
 * ПОДБОР ПРОПОРЦИИ ПЛИТКИ ПОД САМ ФАЙЛ
 * ====================================
 * Сетки просили «все карточки 4:5» — так ряды выглядят ровно. Но половина
 * фотографий в портфолио горизонтальные (3:2), и в вертикальной рамке у них
 * уезжало за край почти 47 % кадра: ровно тот край кухни, ради которого
 * снимок и сделан.
 *
 * Поэтому запрошенная пропорция теперь считается пожеланием. Если она не
 * спорит с ориентацией файла — остаётся как есть. Если спорит и обрезка
 * выходит больше трети кадра — берём ближайшую пропорцию той же ориентации.
 * Ряды становятся чуть разной высоты, зато кухня видна целиком.
 */
const RATIO_AR: Record<string, number> = {
  'aspect-4/5': 0.8,
  'aspect-3/4': 0.75,
  'aspect-square': 1,
  'aspect-4/3': 4 / 3,
  'aspect-3/2': 1.5,
  'aspect-16/10': 1.6,
  'aspect-16/9': 16 / 9,
};

/** Доля площади, уезжающая за край при object-fit: cover */
export function hiddenShare(frameAr: number, fileAr: number) {
  return 1 - Math.min(frameAr, fileAr) / Math.max(frameAr, fileAr);
}

export function fitRatio(image: ImageRef, preferred?: string) {
  const file = ratioOf(image);
  const natural =
    file < 0.9 ? 'aspect-4/5' : file < 1.15 ? 'aspect-square' : 'aspect-4/3';
  if (!preferred) return natural;
  const frame = RATIO_AR[preferred];
  if (!frame) return preferred;
  return hiddenShare(frame, file) > 0.33 ? natural : preferred;
}
