/**
 * Проверка подписи сессии.
 * Вынесена отдельным файлом без зависимостей от next/headers и Node API,
 * потому что тем же кодом пользуется middleware — а он выполняется
 * в облегчённой среде, где ни того, ни другого нет.
 */

export const SESSION_COOKIE = 'recept_admin';

function toBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = '';
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string) {
  return atob(value.replace(/-/g, '+').replace(/_/g, '/'));
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

export async function signSession(expiresAt: number, secret: string) {
  const payload = toBase64Url(new TextEncoder().encode(String(expiresAt)));
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload),
  );
  return `${payload}.${toBase64Url(sig)}`;
}

export async function verifySession(
  token: string | undefined,
  secret: string | undefined,
) {
  if (!token || !secret) return false;
  const [payload] = token.split('.');
  if (!payload) return false;

  try {
    const exp = Number(fromBase64Url(payload));
    if (!Number.isFinite(exp) || exp <= Date.now()) return false;
    // Пересчитываем подпись и сравниваем целиком: подделать без секрета нельзя
    return (await signSession(exp, secret)) === token;
  } catch {
    return false;
  }
}
