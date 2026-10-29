/**
 * НАСТРОЙКИ ПОДКЛЮЧЕНИЯ КАБИНЕТА
 * ==============================
 * Сайт собирается в статику и лежит на GitHub Pages — сервера у него нет.
 * Поэтому адрес проекта Supabase и его публичный ключ читаются В БРАУЗЕРЕ
 * из файла public/kabinet-config.js. Владельцы могут включить кабинет,
 * отредактировав один файл, без пересборки сайта.
 *
 * Почему это безопасно. Публичный ключ (anon key) на то и публичный: он
 * лежит в любом приложении на Supabase и сам по себе не даёт ничего. Все
 * права проверяет Postgres политиками RLS — см. supabase/migrations.
 * СЕКРЕТНЫЙ ключ (service_role) сюда класть нельзя никогда.
 */

export type CabinetConfig = {
  url: string;
  anonKey: string;
};

declare global {
  interface Window {
    __RECEPT_CABINET__?: Partial<CabinetConfig>;
  }
}

/** Значения из сборки — используются, если сайт собирают со своими env. */
const buildTime: Partial<CabinetConfig> = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

const PLACEHOLDER = /^(|ВСТАВЬТЕ.*|https:\/\/ВАШ.*|ЗАМЕНИТЕ.*)$/i;

function clean(value: unknown): string {
  const text = typeof value === 'string' ? value.trim() : '';
  return PLACEHOLDER.test(text) ? '' : text;
}

/**
 * Возвращает настройки либо null, если кабинет ещё не подключён.
 * Никогда не бросает исключение: на статике это рядовая ситуация.
 */
export function readCabinetConfig(): CabinetConfig | null {
  const runtime = typeof window === 'undefined' ? undefined : window.__RECEPT_CABINET__;
  const url = clean(runtime?.url) || clean(buildTime.url);
  const anonKey = clean(runtime?.anonKey) || clean(buildTime.anonKey);
  if (!url || !anonKey) return null;
  if (!/^https:\/\/[a-z0-9.-]+\.supabase\.(co|in)$/i.test(url) && !url.startsWith('http://localhost')) {
    // Чужой адрес в конфиге — повод не отправлять туда ничьи данные.
    return null;
  }
  return { url, anonKey };
}

export const CABINET_CONFIG_FILE = '/kabinet-config.js';

let loader: Promise<CabinetConfig | null> | null = null;

/**
 * Подгружает public/kabinet-config.js, если его ещё нет на странице.
 * Скрипт не кладётся в разметку сайта специально: публичные страницы
 * не должны тянуть ничего лишнего ради кабинета, которым пользуются
 * несколько человек.
 */
export function loadCabinetConfig(): Promise<CabinetConfig | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  const direct = readCabinetConfig();
  if (direct) return Promise.resolve(direct);
  if (loader) return loader;

  loader = new Promise((resolve) => {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
    const src = `${base}${CABINET_CONFIG_FILE}`;
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(readCabinetConfig()), { once: true });
      existing.addEventListener('error', () => resolve(null), { once: true });
      return;
    }
    const el = document.createElement('script');
    el.src = src;
    el.async = true;
    el.addEventListener('load', () => resolve(readCabinetConfig()), { once: true });
    el.addEventListener('error', () => resolve(null), { once: true });
    document.head.appendChild(el);
  });
  return loader;
}
