import { promises as fs } from 'node:fs';
import path from 'node:path';

type Lead = {
  name?: string;
  contact?: string;
  message?: string;
  source?: string;
  page?: string;
  receivedAt?: string;
  note?: string;
};

async function readLeads(): Promise<Lead[]> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), '.leads', 'leads.jsonl'),
      'utf8',
    );
    return raw
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as Lead;
        } catch {
          return null;
        }
      })
      .filter((l): l is Lead => l !== null)
      .reverse();
  } catch {
    return [];
  }
}

export default async function AdminLeadsPage() {
  const leads = await readLeads();
  const mailConfigured = Boolean(process.env.SMTP_HOST && process.env.LEAD_EMAIL_TO);

  return (
    <div>
      <h1 className="font-display text-[1.75rem] text-ink sm:text-[2.125rem]">
        Заявки с сайта
      </h1>
      <p className="mt-2 max-w-3xl text-stone">
        Основной путь заявки — письмо на почту. Этот журнал нужен как страховка:
        сюда заявка попадает, даже если почта не настроена или письмо не ушло.
      </p>

      <div
        className={`mt-6 rounded-xl border p-5 ${
          mailConfigured
            ? 'border-brass/40 bg-brass/10'
            : 'border-amber-300 bg-amber-50'
        }`}
      >
        {mailConfigured ? (
          <p className="text-[0.9375rem] text-ink">
            Почта настроена — заявки уходят письмом и дублируются здесь.
          </p>
        ) : (
          <div className="text-[0.9375rem] text-ink">
            <p className="font-semibold">Почта пока не настроена</p>
            <p className="mt-1.5 text-stone">
              Заявки не теряются и сохраняются в этот журнал, но письмо вам не
              приходит. Чтобы включить почту, добавьте доступы SMTP в файл
              <code className="mx-1 text-ink">.env.local</code> и перезапустите сайт.
            </p>
          </div>
        )}
      </div>

      {leads.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-line px-6 py-12 text-center text-stone">
          Заявок пока нет
        </p>
      ) : (
        <ul className="mt-6 grid gap-3">
          {leads.map((lead, i) => (
            <li
              key={i}
              className="rounded-xl border border-line bg-cream p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="font-display text-[1.25rem] text-ink">
                  {lead.name || 'Без имени'}
                </p>
                <p className="text-sm text-stone">{lead.receivedAt}</p>
              </div>

              {lead.contact ? (
                <p className="mt-2">
                  <a
                    href={
                      /@/.test(lead.contact)
                        ? `mailto:${lead.contact}`
                        : `tel:${lead.contact.replace(/[^\d+]/g, '')}`
                    }
                    className="text-[1.0625rem] font-semibold text-ink underline decoration-brass/50 underline-offset-4"
                  >
                    {lead.contact}
                  </a>
                </p>
              ) : null}

              {lead.message ? (
                <p className="mt-3 whitespace-pre-line text-[0.9375rem] text-stone">
                  {lead.message}
                </p>
              ) : null}

              <p className="mt-3 text-xs text-stone">
                Откуда: {lead.source || '—'} · {lead.page || '/'}
                {lead.note ? ` · ${lead.note}` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
