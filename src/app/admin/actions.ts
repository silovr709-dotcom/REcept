'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import {
  adminIsConfigured,
  checkAttempts,
  clearAttempts,
  createSession,
  destroySession,
  passwordMatches,
  registerFailure,
  requireAdmin,
} from '@/lib/admin/auth';
import { uploadImage } from '@/lib/admin/images';
import {
  exportAll,
  getContent,
  importAll,
  resetContent,
  saveContent,
} from '@/lib/content/store';
import type {
  ContentKey,
  ContentShape,
  DetailItem,
  ImageRef,
  ProjectItem,
  ReviewsContent,
  SiteContent,
  TextsContent,
  VideoItem,
} from '@/lib/content/types';

export type ActionState = { ok: boolean; message: string } | null;

/**
 * Любое сохранение сбрасывает кэш страниц: сайт собран статически,
 * и без этого правки появились бы только после следующей сборки.
 */
async function publish() {
  revalidatePath('/', 'layout');
}

/* ----------------------------- вход ----------------------------- */

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!adminIsConfigured()) {
    return {
      ok: false,
      message:
        'Админка не настроена: добавьте ADMIN_PASSWORD и AUTH_SECRET в .env.local',
    };
  }

  const head = await headers();
  const ip =
    head.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    head.get('x-real-ip') ||
    'unknown';

  const gate = checkAttempts(ip);
  if (!gate.allowed) {
    return {
      ok: false,
      message: `Слишком много попыток. Попробуйте через ${gate.waitMinutes} мин.`,
    };
  }

  const password = String(formData.get('password') ?? '');
  if (!passwordMatches(password)) {
    registerFailure(ip);
    return { ok: false, message: 'Неверный пароль' };
  }

  clearAttempts(ip);
  await createSession();
  redirect('/admin');
}

export async function logoutAction() {
  await destroySession();
  redirect('/admin');
}

/* --------------------------- сохранение --------------------------- */

function parseJson<T>(formData: FormData, field: string, fallback: T): T {
  const raw = formData.get(field);
  if (typeof raw !== 'string' || raw.trim() === '') return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function str(formData: FormData, field: string) {
  return String(formData.get(field) ?? '').trim();
}

function strOrNull(formData: FormData, field: string) {
  const v = str(formData, field);
  return v === '' ? null : v;
}

/** Нормализуем телефон: в ссылке tel: должны остаться только цифры и плюс. */
function normalizePhone(raw: string) {
  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('8') && digits.length === 11) return `+7${digits.slice(1)}`;
  if (digits.startsWith('7') && digits.length === 11) return `+${digits}`;
  return digits;
}

export async function saveSiteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const current = await getContent('site');

  const phones = parseJson<SiteContent['phones']>(formData, 'phones', [])
    .map((p) => ({
      display: String(p.display ?? '').trim(),
      raw: normalizePhone(String(p.raw ?? p.display ?? '')),
      who: p.who ? String(p.who).trim() : null,
    }))
    .filter((p) => p.display && p.raw);

  const next: SiteContent = {
    ...current,
    url: str(formData, 'url') || current.url,
    phones,
    email: strOrNull(formData, 'email'),
    address: strOrNull(formData, 'address'),
    addressMapUrl: strOrNull(formData, 'addressMapUrl'),
    workingHours: strOrNull(formData, 'workingHours'),
    vkUrl: strOrNull(formData, 'vkUrl'),
    vkGroupId: strOrNull(formData, 'vkGroupId'),
    instagramUrl: strOrNull(formData, 'instagramUrl'),
    telegramUsername: strOrNull(formData, 'telegramUsername')?.replace(/^@/, '') ?? null,
    whatsappRaw: strOrNull(formData, 'whatsappRaw')?.replace(/[^\d]/g, '') ?? null,
    yandexOrgId: strOrNull(formData, 'yandexOrgId'),
    yandexOrgName: strOrNull(formData, 'yandexOrgName'),
    warrantyMonths: Number(str(formData, 'warrantyMonths')) || current.warrantyMonths,
    payment: str(formData, 'payment') || current.payment,
    furnitureSince: Number(str(formData, 'furnitureSince')) || null,
    kitchensSince: Number(str(formData, 'kitchensSince')) || null,
    metaTitle: str(formData, 'metaTitle') || current.metaTitle,
    metaDescription: str(formData, 'metaDescription') || current.metaDescription,
  };

  await saveContent('site', next);
  await publish();
  return { ok: true, message: 'Контакты и реквизиты сохранены' };
}

/**
 * Простые списки (боли, абзацы, гарантии) редактируются теми же карточками,
 * что и сложные, поэтому приходят как [{ text: '...' }]. Разворачиваем их
 * обратно в обычный массив строк.
 */
function unwrapTextList(value: unknown): unknown {
  if (!Array.isArray(value)) return value;
  const isWrapped = value.every(
    (v) =>
      v !== null &&
      typeof v === 'object' &&
      Object.keys(v as object).length === 1 &&
      'text' in (v as object),
  );
  if (!isWrapped) return value;
  return value.map((v) => String((v as { text: unknown }).text ?? '').trim());
}

/** Кладёт значение по пути вида `hero.eyebrow` внутрь объекта. */
function setPath(target: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split('.');
  let node = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (typeof node[key] !== 'object' || node[key] === null) node[key] = {};
    node = node[key] as Record<string, unknown>;
  }
  node[parts[parts.length - 1]] = value;
}

/**
 * Сохранение текстов.
 * Форма присылает поля двух видов: `text:путь` — обычная строка,
 * `json:путь` — список или объект целиком. Это позволяет собирать любую
 * страницу админки из готовых редакторов, не заводя отдельный экшен
 * под каждый блок.
 */
export async function saveTextsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const current = await getContent('texts');
  const next = structuredClone(current) as unknown as Record<string, unknown>;

  for (const [field, value] of formData.entries()) {
    if (typeof value !== 'string') continue;
    if (field.startsWith('text:')) {
      setPath(next, field.slice(5), value.trim());
    } else if (field.startsWith('json:')) {
      try {
        setPath(next, field.slice(5), unwrapTextList(JSON.parse(value)));
      } catch {
        return { ok: false, message: `Не удалось прочитать поле ${field.slice(5)}` };
      }
    }
  }

  await saveContent('texts', next as unknown as TextsContent);
  await publish();
  return { ok: true, message: 'Тексты сохранены и опубликованы' };
}

export async function saveReviewsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const current = await getContent('reviews');
  const items = parseJson<ReviewsContent['items']>(formData, 'items', current.items);

  const next: ReviewsContent = {
    rating: {
      value: str(formData, 'value') || current.rating.value,
      reviewsCount: Number(str(formData, 'reviewsCount')) || 0,
      scoresCount: Number(str(formData, 'scoresCount')) || 0,
      source: str(formData, 'source') || current.rating.source,
      checkedAt: str(formData, 'checkedAt') || current.rating.checkedAt,
      show: formData.get('show') === 'on',
    },
    items,
  };

  await saveContent('reviews', next);
  await publish();
  return { ok: true, message: 'Отзывы сохранены' };
}

export async function saveVideosAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const items = parseJson<VideoItem[]>(formData, 'items', []);
  await saveContent(
    'videos',
    items
      .map((v) => ({
        // допускаем вставку полной ссылки — вытащим id сами
        id: String(v.id ?? '').trim().replace(/^.*_/, ''),
        title: v.title ? String(v.title) : null,
        duration: String(v.duration ?? ''),
        published: String(v.published ?? ''),
        hidden: Boolean(v.hidden),
      }))
      .filter((v) => v.id),
  );
  await publish();
  return { ok: true, message: 'Список видео сохранён' };
}

/* --------------------------- изображения --------------------------- */

export async function uploadImageAction(
  _prev: { ok: boolean; message: string; image?: ImageRef } | null,
  formData: FormData,
): Promise<{ ok: boolean; message: string; image?: ImageRef }> {
  await requireAdmin();
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { ok: false, message: 'Файл не выбран' };
  }
  const result = await uploadImage(file);
  if (!result.ok) return { ok: false, message: result.error };
  return { ok: true, message: 'Фотография загружена', image: result.image };
}

/* ----------------------------- проекты ----------------------------- */

export async function saveProjectsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const items = parseJson<ProjectItem[]>(formData, 'items', []);
  if (items.length === 0) {
    return { ok: false, message: 'Список проектов не может быть пустым' };
  }
  const slugs = new Set<string>();
  for (const item of items) {
    if (!item.slug) return { ok: false, message: 'У проекта пустой адрес (slug)' };
    if (slugs.has(item.slug)) {
      return { ok: false, message: `Адрес «${item.slug}» повторяется` };
    }
    slugs.add(item.slug);
  }
  await saveContent('projects', items);
  await publish();
  return { ok: true, message: 'Портфолио сохранено' };
}

export async function saveDetailsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const items = parseJson<DetailItem[]>(formData, 'items', []);
  const ids = new Set<string>();
  for (const item of items) {
    if (!item.id) return { ok: false, message: 'У фрагмента пустой код' };
    if (ids.has(item.id)) {
      return { ok: false, message: `Код «${item.id}» повторяется` };
    }
    ids.add(item.id);
  }
  await saveContent('details', items);
  await publish();
  return { ok: true, message: 'Детали сохранены' };
}

/* ------------------------- бэкап и сброс ------------------------- */

export async function exportAction(): Promise<string> {
  await requireAdmin();
  const data = await exportAll();
  return JSON.stringify(data, null, 2);
}

export async function importAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: 'Выберите файл резервной копии' };
  }
  try {
    const parsed = JSON.parse(await file.text()) as Partial<ContentShape>;
    await importAll(parsed);
    await publish();
    return { ok: true, message: 'Резервная копия восстановлена' };
  } catch {
    return { ok: false, message: 'Файл повреждён или это не наша копия' };
  }
}

export async function resetSectionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const key = str(formData, 'key') as ContentKey;
  const allowed: ContentKey[] = [
    'site',
    'texts',
    'projects',
    'details',
    'reviews',
    'videos',
  ];
  if (!allowed.includes(key)) {
    return { ok: false, message: 'Неизвестный раздел' };
  }
  await resetContent(key);
  await publish();
  return { ok: true, message: 'Раздел возвращён к исходному состоянию' };
}
