import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILES = 3;
const MAX_FILE_BYTES = 8 * 1024 * 1024;

/** Примитивная защита от спама: не больше 5 заявок с одного IP за 10 минут. */
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function checkRate(ip: string) {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_PER_WINDOW) return false;
  entry.count += 1;
  return true;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

type Lead = {
  name: string;
  contact: string;
  message: string;
  source: string;
  page: string;
  receivedAt: string;
};

/** Резервное сохранение — чтобы заявка не потерялась, даже если почта отвалилась. */
async function saveFallback(lead: Lead, note: string) {
  try {
    const dir = path.join(process.cwd(), '.leads');
    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(
      path.join(dir, 'leads.jsonl'),
      `${JSON.stringify({ ...lead, note })}\n`,
      'utf8',
    );
  } catch (err) {
    console.error('[lead] не удалось сохранить резервную копию заявки', err);
  }
}

async function sendEmail(
  lead: Lead,
  attachments: { filename: string; content: Buffer }[],
) {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    LEAD_EMAIL_TO,
    LEAD_EMAIL_FROM,
  } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !LEAD_EMAIL_TO) {
    return { sent: false, reason: 'SMTP не настроен' };
  }

  // Динамический импорт: nodemailer не попадёт в бандл, если почта не используется
  const nodemailer = (await import('nodemailer')).default;

  const port = Number(SMTP_PORT ?? 465);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });

  const rows: [string, string][] = [
    ['Имя', lead.name],
    ['Связаться', lead.contact],
    ['Сообщение', lead.message || '—'],
    ['Откуда', `${lead.source} · ${lead.page || '/'}`],
    ['Когда', lead.receivedAt],
  ];

  await transporter.sendMail({
    from: LEAD_EMAIL_FROM || `"Сайт РЕцепт" <${SMTP_USER}>`,
    to: LEAD_EMAIL_TO,
    replyTo: /@/.test(lead.contact) ? lead.contact : undefined,
    subject: `Заявка с сайта: ${lead.name} — ${lead.contact}`,
    text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
    html: `<table style="font-family:Arial,sans-serif;font-size:15px;border-collapse:collapse">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="padding:6px 14px 6px 0;color:#777;vertical-align:top">${k}</td><td style="padding:6px 0"><b>${escapeHtml(v)}</b></td></tr>`,
  )
  .join('\n')}
</table>`,
    attachments,
  });

  return { sent: true as const };
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRate(ip)) {
      return NextResponse.json(
        { ok: false, error: 'Слишком много заявок подряд. Попробуйте позже или напишите нам напрямую.' },
        { status: 429 },
      );
    }

    const form = await request.formData();

    // Honeypot: боты заполняют скрытое поле
    if (String(form.get('company') ?? '').trim() !== '') {
      return NextResponse.json({ ok: true });
    }

    const name = String(form.get('name') ?? '').trim().slice(0, 120);
    const contact = String(form.get('contact') ?? '').trim().slice(0, 160);
    const message = String(form.get('message') ?? '').trim().slice(0, 4000);
    const source = String(form.get('source') ?? 'site').slice(0, 60);
    const page = String(form.get('page') ?? '').slice(0, 200);

    if (name.length < 2) {
      return NextResponse.json(
        { ok: false, error: 'Напишите, пожалуйста, как к вам обращаться.' },
        { status: 400 },
      );
    }
    if (contact.length < 5) {
      return NextResponse.json(
        { ok: false, error: 'Укажите телефон или ник в Telegram, чтобы мы могли ответить.' },
        { status: 400 },
      );
    }

    const lead: Lead = {
      name,
      contact,
      message,
      source,
      page,
      receivedAt: new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }),
    };

    const attachments: { filename: string; content: Buffer }[] = [];
    for (const entry of form.getAll('files')) {
      if (attachments.length >= MAX_FILES) break;
      if (typeof entry === 'string') continue;
      if (entry.size === 0 || entry.size > MAX_FILE_BYTES) continue;
      attachments.push({
        filename: entry.name.slice(0, 120) || 'file',
        content: Buffer.from(await entry.arrayBuffer()),
      });
    }

    try {
      const result = await sendEmail(lead, attachments);
      if (!result.sent) {
        // Почта ещё не настроена — не теряем заявку и не врём пользователю об ошибке
        console.warn('[lead] SMTP не настроен, заявка сохранена локально:', lead);
        await saveFallback(lead, result.reason);
      }
    } catch (err) {
      console.error('[lead] ошибка отправки письма', err);
      await saveFallback(lead, 'Ошибка отправки письма');
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[lead] необработанная ошибка', err);
    return NextResponse.json(
      { ok: false, error: 'Не удалось отправить заявку. Попробуйте ещё раз.' },
      { status: 500 },
    );
  }
}
