'use client';

import Image from 'next/image';
import { useState } from 'react';
import { reachGoal } from '@/lib/analytics';
import type { ImageRef } from '@/lib/content/types';
import { assetUrl } from '@/lib/content/images';

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
          src={assetUrl(poster.src)}
          alt=""
          fill
          loading="lazy"
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
          placeholder={poster.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={poster.blurDataURL || undefined}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        /*
         * Обложки у роликов нет — ВКонтакте отдаёт её только в плеере.
         * Раньше на этом месте была схема кухни тонкими линиями: три
         * прямоугольника читались не как заставка, а как значок
         * «картинка не загрузилась», и три таких плитки подряд
         * выглядели сломанной страницей.
         *
         * Теперь это осознанная фирменная заставка: тёмное поле,
         * тонкая золотая рамка и монограмма. Ничего не обещает
         * и не притворяется кадром из видео.
         */
        <span
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center bg-linear-to-br from-coal via-ink to-soot"
        >
          <span className="absolute inset-4 border border-goldsoft/25" />
          {/* Надписи разведены к краям: по центру стоит кнопка
              воспроизведения, и всё, что окажется под ней, пропадёт */}
          <span className="absolute inset-x-6 top-9 flex flex-col items-center gap-2.5">
            <span className="font-display text-head leading-none text-cream/45">
              РЕцепт
            </span>
            <span className="h-px w-8 bg-goldsoft/50" />
          </span>
          <span className="absolute inset-x-6 bottom-10 text-center text-caption font-semibold uppercase tracking-[0.22em] text-cream/60">
            Видео с объекта
          </span>
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

      <span className="absolute bottom-0 right-0 bg-ink/75 px-2.5 py-1.5 text-caption font-semibold tracking-[0.1em] text-cream backdrop-blur-sm">
        {duration}
      </span>

      <span className="sr-only">
        Откроется плеер ВКонтакте. Ссылка на оригинал: {linkUrl}
      </span>
    </button>
  );
}
