import type { ProjectItem } from './types';

/**
 * ТЕКСТЫ ДЛЯ ПОИСКА И ДОСТУПНОСТИ
 * ===============================
 * Раньше заголовок и описание страницы проекта собирались на месте и
 * резались по 300 символов — цифра была взята наугад. В выдаче это
 * означало обрыв на полуслове у всех восемнадцати страниц.
 *
 * Здесь собраны правила, единые для сайта: описание умещается в норму
 * поиска и обрывается по границе слова, а подпись к изображению
 * появляется сама, даже если её забыли заполнить в админке.
 */

/** Обрезает по границе слова, а не по символу. */
function trimToWord(text: string, max: number) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).replace(/[,.;:—-]+$/, '')}…`;
}

/**
 * Описание страницы проекта.
 * Норма поиска — примерно 110–190 символов: короче неинформативно,
 * длиннее обрезает сам поисковик.
 */
export function projectDescription(project: ProjectItem) {
  const layout = `${project.layout.toLowerCase()} кухня на заказ в Твери`;
  const materials = project.materials.slice(0, 2).join(', ').toLowerCase();
  const base = `${project.summary}. ${
    layout.charAt(0).toUpperCase() + layout.slice(1)
  }${materials ? `: ${materials}` : ''}.`;

  // Если вышло слишком коротко — добавляем объяснение решения
  const full = base.length < 110 ? `${base} ${project.rationale}` : base;
  return trimToWord(full, 178);
}

/** Заголовок страницы. Шаблон сайта добавит «— РЕцепт, Тверь». */
export function projectTitle(project: ProjectItem) {
  return trimToWord(project.title, 44);
}

/**
 * Подпись к изображению.
 * Если в админке её не заполнили, собираем из того, что известно
 * о проекте: без подписи изображение теряется и для незрячих,
 * и для поиска по картинкам.
 */
export function projectAlt(project: ProjectItem) {
  if (project.alt?.trim()) return project.alt.trim();
  const materials = project.materials.slice(0, 2).join(', ').toLowerCase();
  return trimToWord(
    `${project.layout} кухня на заказ в Твери: ${project.title.toLowerCase()}${
      materials ? `, ${materials}` : ''
    }`,
    160,
  );
}
