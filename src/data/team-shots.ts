import type { StaticImageData } from 'next/image';
import type { ImageRef } from '@/lib/content/types';

import coupleWideImage from '@public/images/team/couple-wide.webp';
import coupleTableImage from '@public/images/team/couple-at-table.webp';
import coupleProjectImage from '@public/images/team/couple-project.webp';
import robertStudioImage from '@public/images/team/robert-studio.webp';
import katyaMaterialsImage from '@public/images/team/katya-materials.webp';

/**
 * ФОТО И СЦЕНЫ С РОБЕРТОМ И КАТЕЙ
 * ===============================
 * В рамке на первом экране и в шапке «О нас» оставлены исходные снимки,
 * которые владельцы сочли уместными. Для остальных контекстов созданы
 * новые редакционные сцены по переданным фотографиям-референсам, чтобы
 * не размножать один и тот же кадр и сохранить узнаваемость владельцев.
 *
 * Сгенерированные сцены — не свидетельство съёмки на конкретном объекте
 * и не фотографии выполненных заказов. Публичные WebP оптимизированы;
 * исходники и референсы лежат в `images/team/`.
 *
 * Пути не хешируются: статическая витрина лежит в подпапке, а префикс
 * дописывает `assetUrl()`. Из импорта берутся размеры и размытая заглушка.
 */
function ref(img: StaticImageData, publicPath: string): ImageRef {
  return {
    src: publicPath,
    width: img.width,
    height: img.height,
    blurDataURL: img.blurDataURL ?? '',
  };
}

export const teamShots = {
  /** Исходное совместное фото в рамке на первом экране. */
  coupleAtTable: ref(coupleTableImage, '/images/team/couple-at-table.webp'),
  /** Исходное широкое фото в шапке страницы «О нас». */
  coupleWide: ref(coupleWideImage, '/images/team/couple-wide.webp'),
  /** Новая сцена: Роберт и Катя вместе обсуждают план в студии. */
  coupleProject: ref(coupleProjectImage, '/images/team/couple-project.webp'),
  /** Новая сцена Роберта у рабочего стола с планом кухни. */
  robertStudio: ref(robertStudioImage, '/images/team/robert-studio.webp'),
  /** Новая сцена Кати за подбором фасадов и материалов. */
  katyaMaterials: ref(katyaMaterialsImage, '/images/team/katya-materials.webp'),
};

export const teamShotAlt = {
  coupleAtTable:
    'Роберт и Екатерина Шиловы сидят вместе за столом в интерьере кухни.',
  coupleWide:
    'Роберт и Екатерина Шиловы стоят рядом на фоне кухни со светлыми деревянными фасадами.',
  coupleProject:
    'Роберт и Катя обсуждают план кухни и образцы материалов за рабочим столом в студии.',
  robertStudio:
    'Роберт изучает план кухни за рабочим столом в студии.',
  katyaMaterials:
    'Катя выбирает образцы фасадов и материалов за столом в студии.',
};
