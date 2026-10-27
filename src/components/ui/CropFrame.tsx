import Image from 'next/image';
import type { Crop } from '@/data/crops';
import { assetUrl } from '@/lib/content/images';

/**
 * Небольшая рамка под фрагмент реального проекта.
 *
 * Отдельный компонент нужен по одной причине: эти кадры сняты на
 * объектах телефоном и небольшие по разрешению. Правило «показываем
 * их только маленькими» должно жить в одном месте, а не в каждой
 * странице заново — поэтому размеры задаются пропорцией контейнера,
 * а `sizes` по умолчанию описывает превью, а не полосу во всю ширину.
 */
export function CropFrame({
  crop,
  ratio = 'aspect-16/10',
  sizes = '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw',
  caption = false,
  className = '',
}: {
  crop: Crop;
  /** Класс пропорции: aspect-16/10, aspect-4/5, aspect-square… */
  ratio?: string;
  sizes?: string;
  /** Подписать кадр тем же текстом, что и alt */
  caption?: boolean;
  className?: string;
}) {
  return (
    <figure
      className={`relative overflow-hidden bg-sand ${ratio} ${className}`}
    >
      <Image
        src={assetUrl(crop.src)}
        alt={crop.alt}
        fill
        loading="lazy"
        sizes={sizes}
        className="object-cover"
      />
      {caption ? (
        <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/85 to-transparent p-4 pt-10 text-small font-medium text-cream">
          {crop.alt}
        </figcaption>
      ) : null}
    </figure>
  );
}
