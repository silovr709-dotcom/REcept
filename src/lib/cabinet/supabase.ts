'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loadCabinetConfig, readCabinetConfig } from './config';

/**
 * Единственный экземпляр клиента Supabase на вкладку.
 * Создаётся лениво: на сервере при сборке страниц его нет вовсе.
 */

let instance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;
  if (instance) return instance;

  const config = readCabinetConfig();
  if (!config) return null;

  instance = createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'recept-cabinet-auth',
      flowType: 'pkce',
    },
    global: {
      headers: { 'x-application-name': 'recept-cabinet' },
    },
  });
  return instance;
}

/** Подключён ли кабинет вообще (есть адрес и ключ). */
export function cabinetIsConfigured() {
  return readCabinetConfig() !== null;
}

/**
 * Дожидается загрузки public/kabinet-config.js и возвращает готовый клиент.
 * Используется один раз при старте кабинета.
 */
export async function initSupabase(): Promise<SupabaseClient | null> {
  if (typeof window === 'undefined') return null;
  await loadCabinetConfig();
  return getSupabase();
}

/**
 * Человеческий текст ошибки.
 * Наружу не должно утекать ни SQL, ни внутренние детали сервера —
 * поэтому известные случаи переводим, а неизвестные обобщаем.
 */
export function humanError(error: unknown): string {
  const raw =
    typeof error === 'string'
      ? error
      : error && typeof error === 'object' && 'message' in error
        ? String((error as { message: unknown }).message)
        : '';

  const map: Array<[RegExp, string]> = [
    [/invalid login credentials/i, 'Неверная почта или пароль'],
    [/email not confirmed/i, 'Почта ещё не подтверждена — проверьте письмо'],
    [/user already registered/i, 'Такая почта уже зарегистрирована — войдите'],
    [/password should be at least/i, 'Пароль должен быть не короче 8 знаков'],
    [/rate limit|too many requests/i, 'Слишком много попыток — подождите минуту'],
    [/row-level security|permission denied|violates row-level/i, 'Нет доступа к этим данным'],
    [/jwt expired|invalid claim/i, 'Сессия истекла — войдите заново'],
    [/failed to fetch|networkerror/i, 'Нет связи с сервером кабинета'],
    [/duplicate key|already exists/i, 'Такая запись уже есть'],
    [/exceeded the maximum allowed size|payload too large/i, 'Файл больше допустимого размера'],
    [/mime type .* is not supported/i, 'Такой тип файла загружать нельзя'],
  ];
  for (const [re, text] of map) if (re.test(raw)) return text;

  // Сообщения наших же функций в базе написаны по-русски — их показываем как есть.
  if (/[А-Яа-яЁё]/.test(raw)) return raw;
  return 'Не получилось выполнить действие. Попробуйте ещё раз';
}
