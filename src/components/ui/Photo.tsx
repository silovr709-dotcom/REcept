import type { ImageRef } from '@/lib/content/types';
import { assetUrl, srcSetOf } from '@/lib/content/images';

/**
 * КРУПНАЯ ФОТОГРАФИЯ
 * ==================
 *
 * Обычный `<img>`, но с двумя источниками: исходным файлом и файлом
 * `@2x`, который готовит `scripts/photo-2x.mjs`. Браузер сам выбирает
 * нужный по ширине блока и плотности экрана — телефон качает лёгкий,
 * ноутбук с retina-экраном крупный.
 *
 * Почему не `next/image`. Витрина собирается в статику, оптимизатор
 * картинок там отключён, и `next/image` превращается в тот же `<img>`,
 * только без возможности подставить свой `srcset`. Ровно из-за этого
 * фотографии на весь экран и выглядели мягкими: файл шириной 1536 px
 * растягивался на 2880 физических точек. В мелких карточках разницы
 * нет, там `next/image` и остался.
 *
 * `fill` повторяет поведение одноимённого режима `next/image`:
 * картинка растягивается на родителя, у которого есть `position`.
 */
export function Photo({
  image,
  alt,
  sizes,
  className = '',
  fill = false,
  priority = false,
}: {
  image: ImageRef;
  /** Пустая строка — только для декоративных подложек */
  alt: string;
  /** Ширина блока в разных раскладках: по ней браузер и выбирает файл */
  sizes: string;
  className?: string;
  fill?: boolean;
  /** Для кадров первого экрана: грузить сразу, а не лениво */
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={assetUrl(image.src)}
      srcSet={srcSetOf(image)}
      sizes={sizes}
      alt={alt}
      width={image.width}
      height={image.height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={
        fill ? `absolute inset-0 size-full ${className}` : className
      }
    />
  );
}
