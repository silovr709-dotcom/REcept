'use client';

import { useId, useRef, useState } from 'react';
import { Button } from './ui/Button';
import { useSite } from './SiteProvider';

type Status = 'idle' | 'sending' | 'success' | 'error';

const MAX_FILES = 3;
const MAX_FILE_MB = 8;

export function LeadForm({
  tone = 'dark',
  compact = false,
  submitLabel = 'Обсудить мою кухню',
  source = 'site',
  onSuccess,
}: {
  tone?: 'dark' | 'light';
  compact?: boolean;
  submitLabel?: string;
  source?: string;
  onSuccess?: () => void;
}) {
  const { contacts: activeContacts } = useSite();
  const [status, setStatus] = useState<Status>('idle');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const id = useId();

  const light = tone === 'light';

  const fieldCls = [
    'w-full rounded-md border bg-transparent px-4 py-3.5 text-[1rem] outline-none transition-colors',
    'min-h-13',
    light
      ? 'border-cream/20 text-cream placeholder:text-cream/55 focus:border-brasslight'
      : 'border-line text-ink placeholder:text-stone focus:border-brass bg-white/60',
  ].join(' ');

  const labelCls = `mb-2 block text-[0.8125rem] font-semibold ${
    light ? 'text-cream/75' : 'text-stone'
  }`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'sending') return;

    const form = e.currentTarget;
    const data = new FormData(form);
    data.set('source', source);
    data.set('page', typeof window !== 'undefined' ? window.location.pathname : '');

    // Файлы добавляем вручную — так проще контролировать лимиты
    data.delete('files');
    for (const f of files) data.append('files', f);

    setStatus('sending');
    setErrorText(null);

    try {
      const res = await fetch('/api/lead', { method: 'POST', body: data });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Не удалось отправить заявку');
      }

      setStatus('success');
      setFiles([]);
      form.reset();
      onSuccess?.();
    } catch (err) {
      setStatus('error');
      setErrorText(
        err instanceof Error && err.message
          ? err.message
          : 'Что-то пошло не так. Попробуйте ещё раз или напишите нам напрямую.',
      );
    }
  }

  function handleFiles(list: FileList | null) {
    if (!list) return;
    const picked = Array.from(list)
      .filter((f) => f.size <= MAX_FILE_MB * 1024 * 1024)
      .slice(0, MAX_FILES);
    setFiles(picked);
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`rounded-lg border p-7 sm:p-9 ${
          light ? 'border-brasslight/30 bg-cream/[0.04]' : 'border-brass/25 bg-bone'
        }`}
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-brass/15">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m4.5 12.5 5 5 10-11"
              stroke="#8F6530"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3
          className={`font-display mt-5 text-h3 ${light ? 'text-cream' : 'text-ink'}`}
        >
          Заявка отправлена
        </h3>
        <p className={`mt-3 ${light ? 'text-cream/70' : 'text-stone'}`}>
          Роберт или Катя свяжутся с вами, зададут пару вопросов о помещении
          и подскажут, с чего лучше начать: с замера, с планировки или просто
          с разговора. Ничего оплачивать и ни на что соглашаться на этом этапе
          не нужно.
        </p>
        {activeContacts.length > 0 ? (
          <p className={`mt-4 text-sm ${light ? 'text-cream/55' : 'text-stone'}`}>
            Если удобнее написать первым — вот прямые контакты:{' '}
            {activeContacts.map((c, i) => (
              <span key={c.id}>
                {i > 0 ? ', ' : ''}
                <a
                  href={c.href}
                  className="underline decoration-brass/50 underline-offset-4 hover:text-brass"
                >
                  {c.label}
                </a>
              </span>
            ))}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className={`mt-6 text-sm font-semibold underline decoration-brass/40 underline-offset-4 ${
            light ? 'text-cream/70 hover:text-cream' : 'text-stone hover:text-ink'
          }`}
        >
          Отправить ещё одну заявку
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate={false}
      className="relative w-full"
    >
      {/* Ловушка для ботов — скрыта от людей и скринридеров */}
      <div className="absolute left-[-9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor={`${id}-company`}>Не заполняйте это поле</label>
        <input id={`${id}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={compact ? 'grid gap-4' : 'grid gap-4 sm:grid-cols-2'}>
        <div>
          <label htmlFor={`${id}-name`} className={labelCls}>
            Как вас зовут
          </label>
          <input
            id={`${id}-name`}
            name="name"
            type="text"
            required
            autoComplete="name"
            enterKeyHint="next"
            placeholder="Имя"
            className={fieldCls}
          />
        </div>

        <div>
          <label htmlFor={`${id}-contact`} className={labelCls}>
            Как с вами связаться
          </label>
          <input
            id={`${id}-contact`}
            name="contact"
            type="text"
            required
            inputMode="tel"
            autoComplete="tel"
            enterKeyHint="next"
            placeholder="Телефон или ник в Telegram"
            className={fieldCls}
            aria-describedby={`${id}-contact-hint`}
          />
          <p
            id={`${id}-contact-hint`}
            className={`mt-2 text-xs ${light ? 'text-cream/60' : 'text-stone'}`}
          >
            Напишем туда, куда вам удобнее
          </p>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor={`${id}-message`} className={labelCls}>
          Пара слов о задаче{' '}
          <span className={light ? 'text-cream/60' : 'text-stone'}>
            — необязательно
          </span>
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={compact ? 3 : 4}
          placeholder="Например: кухня 9 м² в новостройке, ремонт ещё не начали, хотим без ручек и со встроенной техникой"
          className={`${fieldCls} resize-y`}
        />
      </div>

      {/* Вложения */}
      <div className="mt-4">
        <label
          htmlFor={`${id}-files`}
          className={`flex cursor-pointer items-center gap-3 rounded-md border border-dashed px-4 py-3.5 text-sm transition-colors ${
            light
              ? 'border-cream/20 text-cream/60 hover:border-cream/40 hover:text-cream/80'
              : 'border-line text-stone hover:border-brass/50 hover:text-ink'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
            <path
              d="M21 12.5V7a4 4 0 0 0-8 0v10a2.5 2.5 0 0 0 5 0V8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path d="M3 20h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span>
            {files.length > 0
              ? `Выбрано файлов: ${files.length}`
              : 'Прикрепить фото помещения или планировку'}
          </span>
        </label>
        <input
          id={`${id}-files`}
          name="files"
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={(e) => handleFiles(e.target.files)}
          className="sr-only"
        />
        {files.length > 0 ? (
          <ul className={`mt-2 text-xs ${light ? 'text-cream/60' : 'text-stone'}`}>
            {files.map((f) => (
              <li key={f.name}>• {f.name}</li>
            ))}
          </ul>
        ) : (
          <p className={`mt-2 text-xs ${light ? 'text-cream/60' : 'text-stone'}`}>
            До {MAX_FILES} файлов, каждый до {MAX_FILE_MB} МБ. Помогает, но не обязательно.
          </p>
        )}
      </div>

      {status === 'error' ? (
        <div
          role="alert"
          className="mt-5 rounded-md border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm"
        >
          <p className={light ? 'text-red-200' : 'text-red-700'}>{errorText}</p>
          {activeContacts.length > 0 ? (
            <p className={`mt-1 ${light ? 'text-red-200/80' : 'text-red-700/80'}`}>
              Можно написать нам напрямую:{' '}
              {activeContacts.map((c, i) => (
                <span key={c.id}>
                  {i > 0 ? ', ' : ''}
                  <a href={c.href} className="underline underline-offset-2">
                    {c.value}
                  </a>
                </span>
              ))}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-4">
        <Button
          type="submit"
          variant="brass"
          size="lg"
          withArrow
          disabled={status === 'sending'}
          className="w-full sm:w-auto"
        >
          {status === 'sending' ? 'Отправляем…' : submitLabel}
        </Button>

        <p className={`text-xs leading-relaxed ${light ? 'text-cream/60' : 'text-stone'}`}>
          Без обязательств: сначала обсудим задачу и поймём, что вам
          действительно нужно. Нажимая кнопку, вы соглашаетесь с{' '}
          <a
            href="/politika-konfidencialnosti"
            className="underline decoration-brass/40 underline-offset-2 hover:text-brass"
          >
            политикой обработки персональных данных
          </a>
          .
        </p>
      </div>
    </form>
  );
}
