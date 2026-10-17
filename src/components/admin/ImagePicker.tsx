'use client';

import Image from 'next/image';
import { useState, useTransition } from 'react';
import { uploadImageAction } from '@/app/admin/actions';
import type { ImageRef } from '@/lib/content/types';

/**
 * Загрузка фотографии.
 * Файл уходит на сервер, там его поворачивают по EXIF, уменьшают, переводят
 * в WebP и считают размытую заглушку. Обратно приходит готовая ссылка
 * с размерами — поэтому на сайте не будет ни тяжёлых картинок,
 * ни «прыгающей» вёрстки.
 */
export function ImagePicker({
  value,
  onChange,
  label = 'Фотография',
  hint,
}: {
  value: ImageRef | null;
  onChange: (image: ImageRef | null) => void;
  label?: string;
  hint?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    const data = new FormData();
    data.set('file', file);
    startTransition(async () => {
      const result = await uploadImageAction(null, data);
      if (result.ok && result.image) {
        onChange(result.image);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div>
      <p className="mb-1.5 text-[0.8125rem] font-semibold text-ink">{label}</p>

      <div className="flex flex-wrap items-start gap-4">
        <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-lg border border-line bg-bone">
          {value ? (
            <Image
              src={value.src}
              alt=""
              fill
              sizes="160px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="grid size-full place-items-center text-xs text-stone">
              Нет фото
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="inline-flex cursor-pointer items-center rounded-full border border-line bg-cream px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink/40">
            {pending ? 'Загружаем…' : value ? 'Заменить фото' : 'Загрузить фото'}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={pending}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </label>

          {value ? (
            <>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="text-left text-sm text-stone underline underline-offset-4 hover:text-ink"
              >
                Убрать фото
              </button>
              <p className="text-xs text-stone">
                {value.width} × {value.height} px
              </p>
            </>
          ) : null}

          {hint ? <p className="max-w-xs text-xs text-stone">{hint}</p> : null}
          {error ? <p className="max-w-xs text-xs text-red-700">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
