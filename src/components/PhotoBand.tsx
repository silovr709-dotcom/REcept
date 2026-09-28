import Image from 'next/image';
import type { ImageRef } from '@/lib/content/types';

/**
 * Широкая фотополоса между текстовыми блоками.
 * Задача — дать глазу отдохнуть и напомнить, о чём вообще речь,
 * когда подряд идут несколько смысловых секций.
 */
export function PhotoBand({
  image,
  alt,
  caption,
  overlay = 'none',
  height = 'md',
}: {
  image: ImageRef;
  alt: string;
  caption?: string;
  overlay?: 'none' | 'quote';
  height?: 'sm' | 'md' | 'lg';
}) {
  const heights = {
    sm: 'h-[42vw] max-h-[22rem] min-h-[13rem]',
    md: 'h-[52vw] max-h-[30rem] min-h-[15rem]',
    lg: 'h-[62vw] max-h-[38rem] min-h-[18rem]',
  } as const;

  return (
    <figure className="relative bg-ink">
      <div
        className={`band-parallax relative w-full overflow-hidden ${heights[height]}`}
      >
        <Image
          src={image.src}
          alt={alt}
          fill
          loading="lazy"
          sizes="100vw"
          placeholder={image.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={image.blurDataURL || undefined}
          className="object-cover"
        />
        {overlay === 'quote' ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/20 to-transparent"
          />
        ) : null}

        {caption && overlay === 'quote' ? (
          <figcaption className="absolute inset-x-0 bottom-0">
            <div className="container-page pb-8 sm:pb-10">
              <p className="font-display max-w-2xl text-[1.25rem] leading-snug text-cream sm:text-[1.75rem]">
                {caption}
              </p>
            </div>
          </figcaption>
        ) : null}
      </div>

      {caption && overlay === 'none' ? (
        <figcaption className="bg-cream">
          <div className="container-page py-4">
            <p className="text-sm text-stone">{caption}</p>
          </div>
        </figcaption>
      ) : null}
    </figure>
  );
}
