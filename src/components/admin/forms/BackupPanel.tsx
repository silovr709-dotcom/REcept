'use client';

import { useActionState } from 'react';
import { importAction, resetSectionAction } from '@/app/admin/actions';
import { Card } from '../ui';

const SECTIONS: { key: string; label: string }[] = [
  { key: 'site', label: 'Контакты и реквизиты' },
  { key: 'texts', label: 'Все тексты' },
  { key: 'projects', label: 'Проекты портфолио' },
  { key: 'details', label: 'Детали и фактуры' },
  { key: 'reviews', label: 'Отзывы и рейтинг' },
  { key: 'videos', label: 'Видео' },
];

export function BackupPanel({
  snapshot,
  size,
}: {
  snapshot: string;
  size: number;
}) {
  const [importState, importFormAction] = useActionState(importAction, null);
  const [resetState, resetFormAction] = useActionState(resetSectionAction, null);

  function download() {
    const blob = new Blob([snapshot], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `recept-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6">
      <Card title="Скачать копию">
        <p className="text-[0.9375rem] text-stone">
          Размер файла — {Math.round(size / 1024)} КБ. Храните его где-нибудь
          вне сайта: в почте, облаке или на своём компьютере.
        </p>
        <button
          type="button"
          onClick={download}
          className="mt-5 inline-flex min-h-11 items-center rounded-full bg-ink px-6 text-[0.9375rem] font-semibold text-cream"
        >
          Скачать резервную копию
        </button>
      </Card>

      <Card
        title="Восстановить из копии"
        description="Загруженный файл полностью заменит текущий текст и настройки сайта. Фотографии останутся на месте."
      >
        {importState ? (
          <p
            role="status"
            className={`mb-4 rounded-lg border px-4 py-3 text-[0.9375rem] ${
              importState.ok
                ? 'border-brass/40 bg-brass/10 text-ink'
                : 'border-red-300 bg-red-50 text-red-800'
            }`}
          >
            {importState.message}
          </p>
        ) : null}

        <form action={importFormAction} className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            name="file"
            accept="application/json"
            required
            className="text-sm text-ink file:mr-3 file:rounded-full file:border file:border-line file:bg-cream file:px-4 file:py-2 file:text-sm file:text-ink"
          />
          <button
            type="submit"
            className="min-h-11 rounded-full border border-ink/25 px-5 text-[0.9375rem] font-semibold text-ink hover:border-ink/60"
          >
            Восстановить
          </button>
        </form>
      </Card>

      <Card
        title="Вернуть раздел к исходному виду"
        description="Откатывает выбранный раздел к тому состоянию, в котором сайт был сдан. Пригодится, если правки зашли не туда."
      >
        {resetState ? (
          <p
            role="status"
            className={`mb-4 rounded-lg border px-4 py-3 text-[0.9375rem] ${
              resetState.ok
                ? 'border-brass/40 bg-brass/10 text-ink'
                : 'border-red-300 bg-red-50 text-red-800'
            }`}
          >
            {resetState.message}
          </p>
        ) : null}

        <div className="grid gap-2 sm:grid-cols-2">
          {SECTIONS.map((section) => (
            <form
              key={section.key}
              action={resetFormAction}
              onSubmit={(e) => {
                if (
                  !confirm(
                    `Вернуть раздел «${section.label}» к исходному виду? Текущие правки в нём пропадут.`,
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="key" value={section.key} />
              <button
                type="submit"
                className="w-full rounded-lg border border-line px-4 py-3 text-left text-[0.9375rem] text-ink transition-colors hover:border-red-300 hover:text-red-700"
              >
                {section.label}
              </button>
            </form>
          ))}
        </div>
      </Card>
    </div>
  );
}
