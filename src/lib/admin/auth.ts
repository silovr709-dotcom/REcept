import 'server-only';

import { cookies } from 'next/headers';
import { SESSION_COOKIE, signSession, verifySession } from './session';

/**
 * ДОСТУП В АДМИНКУ
 * ================
 * Один пароль на владельцев — без регистраций, ролей и базы пользователей.
 * Пароль задаётся переменной окружения ADMIN_PASSWORD и в коде не хранится.
 *
 * Сессия — подписанная кука: внутри только срок действия, подделать её
 * без AUTH_SECRET нельзя. Подпись считается Web Crypto, поэтому одинаково
 * работает и в middleware, и в серверных экшенах.
 */

const COOKIE = SESSION_COOKIE;
const MAX_AGE = 60 * 60 * 12; // 12 часов

export function adminIsConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.AUTH_SECRET);
}

/* ------------------------- защита от перебора ------------------------- */

const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 8;
const LOCK_MS = 10 * 60 * 1000;

export function checkAttempts(ip: string) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && entry.until > now && entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, waitMinutes: Math.ceil((entry.until - now) / 60000) };
  }
  return { allowed: true, waitMinutes: 0 };
}

export function registerFailure(ip: string) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.until < now) {
    attempts.set(ip, { count: 1, until: now + LOCK_MS });
  } else {
    entry.count += 1;
  }
}

export function clearAttempts(ip: string) {
  attempts.delete(ip);
}

/** Сравнение без утечки времени: не даёт угадывать пароль по скорости ответа. */
export function passwordMatches(input: string) {
  const expected = process.env.ADMIN_PASSWORD ?? '';
  if (expected.length === 0) return false;
  const a = new TextEncoder().encode(input);
  const b = new TextEncoder().encode(expected);
  let diff = a.length ^ b.length;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

/* ----------------------------- сессия ----------------------------- */

export async function createSession() {
  const token = await signSession(
    Date.now() + MAX_AGE * 1000,
    process.env.AUTH_SECRET ?? '',
  );
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isAuthed() {
  const jar = await cookies();
  return verifySession(jar.get(COOKIE)?.value, process.env.AUTH_SECRET);
}

/** Вызывать в начале каждого серверного экшена, меняющего данные. */
export async function requireAdmin() {
  if (!(await isAuthed())) {
    throw new Error('Нужно войти в админку заново');
  }
}

