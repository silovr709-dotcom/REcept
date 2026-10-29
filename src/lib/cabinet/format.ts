/** Форматирование дат, сумм и размеров файлов. Везде русская локаль. */

const dateFmt = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const shortFmt = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
});

const timeFmt = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDate(value: string | null | undefined, fallback = 'Дата уточняется') {
  if (!value) return fallback;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : dateFmt.format(d);
}

export function formatShort(value: string | null | undefined, fallback = '—') {
  if (!value) return fallback;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : shortFmt.format(d);
}

export function formatDateTime(value: string | null | undefined, fallback = '—') {
  if (!value) return fallback;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : timeFmt.format(d);
}

/** «2 часа назад» — для ленты изменений. */
export function formatAgo(value: string | null | undefined) {
  if (!value) return '';
  const d = new Date(value).getTime();
  if (Number.isNaN(d)) return '';
  const diff = Date.now() - d;
  const min = Math.round(diff / 60000);
  if (min < 1) return 'только что';
  if (min < 60) return `${min} ${plural(min, 'минуту', 'минуты', 'минут')} назад`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `${hours} ${plural(hours, 'час', 'часа', 'часов')} назад`;
  const days = Math.round(hours / 24);
  if (days <= 30) return `${days} ${plural(days, 'день', 'дня', 'дней')} назад`;
  return formatDate(value, '');
}

export function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

const moneyFmt = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

export function formatMoney(value: number | null | undefined, fallback = '—') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return fallback;
  return moneyFmt.format(Number(value));
}

export function formatSize(bytes: number | null | undefined) {
  if (!bytes || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

export function isImage(mime: string | null | undefined, name?: string) {
  if (mime?.startsWith('image/')) return true;
  return /\.(jpe?g|png|webp|gif|heic)$/i.test(name ?? '');
}

export function isPdf(mime: string | null | undefined, name?: string) {
  return mime === 'application/pdf' || /\.pdf$/i.test(name ?? '');
}

/** Имя пользователя для подписи: ФИО, иначе почта до собачки. */
export function personName(
  profile: { full_name?: string | null; email?: string | null } | null | undefined,
  fallback = 'Сотрудник «РЕцепт»',
) {
  if (!profile) return fallback;
  if (profile.full_name?.trim()) return profile.full_name.trim();
  if (profile.email) return profile.email.split('@')[0];
  return fallback;
}
