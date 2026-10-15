import type { ImageRef } from '@/lib/content/types';
import { Photo } from './ui/Photo';

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
  objectPosition = 'object-center',
}: {
  image: ImageRef;
  alt: string;
  caption?: string;
  overlay?: 'none' | 'quote';
  height?: 'sm' | 'md' | 'lg';
  /**
   * Полоса очень широкая — до 3:1, — а кадры приходят в 3:2 или 16:9.
   * По умолчанию кадрируем по центру, но если на снимке человек,
   * центр приходится на грудь и голову срезает. Для таких кадров
   * сюда передаётся класс вроде `object-[50%_20%]`.
   */
  objectPosition?: string;
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
        <Photo
          image={image}
          alt={alt}
          fill
          sizes="100vw"
          className={`object-cover ${objectPosition}`}
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
