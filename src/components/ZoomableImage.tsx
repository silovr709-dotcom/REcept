'use client';

import Image from 'next/image';
import type { ImageRef } from '@/lib/content/types';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Фотография, которую можно рассмотреть.
 * Для мебели это не украшательство: качество работы видно на стыках,
 * кромках и фурнитуре, а на маленьком превью их не разглядеть.
 *
 * Компонент самодостаточный — никаких провайдеров и библиотек.
 * Оверлей монтируется только когда его открыли, поэтому на вес страницы
 * он практически не влияет.
 */
export function ZoomableImage({
  image,
  alt,
  caption,
  sizes,
  className = '',
  wrapperClassName = '',
  priority = false,
}: {
  image: ImageRef;
  alt: string;
  caption?: string;
  sizes: string;
  className?: string;
  wrapperClassName?: string;
  priority?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        e.preventDefault();
        closeRef.current?.focus();
      }
    };

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => closeRef.current?.focus(), 50);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = prevOverflow;
      window.clearTimeout(t);
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Рассмотреть фотографию: ${alt}`}
        className={`group relative block w-full cursor-zoom-in overflow-hidden bg-sand ${wrapperClassName}`}
      >
        <Image
          src={image.src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          placeholder={image.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={image.blurDataURL || undefined}
          className={`object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] ${className}`}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 right-3 grid size-9 place-items-center rounded-full bg-ink/55 text-cream opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M13.5 13.5 18 18M9 6.5v5M6.5 9h5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          className="fixed inset-0 z-110 flex cursor-zoom-out flex-col items-center justify-center bg-ink/95 p-4 sm:p-8"
        >
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Закрыть просмотр фотографии"
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream/20"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="animate-fade-up relative max-h-[82vh] w-full max-w-6xl cursor-default">
            <Image
              src={image.src}
              alt={alt}
              width={image.width}
              height={image.height}
              sizes="100vw"
              placeholder={image.blurDataURL ? 'blur' : 'empty'}
              blurDataURL={image.blurDataURL || undefined}
              className="mx-auto h-auto max-h-[82vh] w-auto max-w-full rounded-md object-contain"
            />
          </div>

          {caption ? (
            <p className="mt-4 max-w-2xl text-center text-sm text-cream/70">
              {caption}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
