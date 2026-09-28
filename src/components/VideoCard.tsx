'use client';

import Image from 'next/image';
import { useState } from 'react';
import { reachGoal } from '@/lib/analytics';
import type { ImageRef } from '@/lib/content/types';

/**
 * Видео с отложенной загрузкой плеера.
 * Раньше три ролика ВКонтакте тянули стороннюю библиотеку сразу при открытии
 * главной. Теперь до нажатия показывается лёгкая обложка, а плеер
 * подключается только когда человек действительно захотел посмотреть.
 *
 * Если обложка не загружена в админке, рисуем фирменную заглушку —
 * чужих картинок и стоп-кадров «наугад» здесь нет.
 */
export function VideoCard({
  embedUrl,
  linkUrl,
  title,
  duration,
  poster,
  light,
}: {
  embedUrl: string;
  linkUrl: string;
  title: string;
  duration: string;
  poster: ImageRef | null;
  light: boolean;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div
        className={`relative aspect-9/16 overflow-hidden rounded-lg ${light ? 'bg-coal' : 'bg-sand'}`}
      >
        <iframe
          src={`${embedUrl}&autoplay=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; screen-wake-lock; fullscreen"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        reachGoal('messenger_click', { place: 'video' });
        setPlaying(true);
      }}
      aria-label={`Смотреть видео: ${title}`}
      className={`group relative block aspect-9/16 w-full overflow-hidden rounded-lg ${
        light ? 'bg-coal' : 'bg-sand'
      }`}
    >
      {poster ? (
        <Image
          src={poster.src}
          alt=""
          fill
          loading="lazy"
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
          placeholder={poster.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={poster.blurDataURL || undefined}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        <span
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center bg-linear-to-b from-coal to-ink"
        >
          <svg viewBox="0 0 120 90" className="w-2/3 opacity-30" fill="none">
            <g stroke="#CFC4B2" strokeWidth="2">
              <rect x="14" y="8" width="38" height="26" />
              <rect x="68" y="8" width="38" height="26" />
              <rect x="14" y="52" width="92" height="30" />
            </g>
            <rect x="10" y="40" width="100" height="5" rx="1" fill="#C79A54" />
          </svg>
        </span>
      )}

      <span
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-ink/70 via-transparent to-transparent"
      />

      <span
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cream/90 text-ink shadow-lg transition-transform duration-300 group-hover:scale-110"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5.5v13l11-6.5z" />
        </svg>
      </span>

      <span className="absolute bottom-0 right-0 bg-ink/75 px-2.5 py-1.5 text-[0.6875rem] font-semibold tracking-[0.1em] text-cream backdrop-blur-sm">
        {duration}
      </span>

      <span className="sr-only">
        Откроется плеер ВКонтакте. Ссылка на оригинал: {linkUrl}
      </span>
    </button>
  );
}
