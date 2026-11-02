import type { StaticImageData } from 'next/image';
import type { ImageRef } from '@/lib/content/types';

import coupleWideImage from '@public/images/team/couple-wide.webp';
import coupleTableImage from '@public/images/team/couple-at-table.webp';
import coupleCloseImage from '@public/images/team/couple-close.webp';
import robertPortraitImage from '@public/images/team/robert-portrait.webp';
import katyaPortraitImage from '@public/images/team/katya-portrait.webp';

/**
 * ФОТО РОБЕРТА И КАТИ
 * ===================
 * Публичные WebP — оптимизированные версии снимков, переданных владельцами;
 * исходники лежат в `images/team/`. Отдельный портрет Кати — аккуратный
 * кроп совместной фотографии, а не новая или сгенерированная сцена.
 *
 * Фотографии владельцев показывают самих людей и не используются как
 * подтверждение того, что интерьер на снимке — выполненный проект ателье.
 * Для визуализаций интерьеров по-прежнему нужна отдельная плашка.
 *
 * Публичные пути не хешируются: статическая витрина лежит в подпапке,
 * а префикс дописывает `assetUrl()`. Из импорта берутся размеры и
 * размытая заглушка.
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
  /** Роберт и Катя вместе в интерьере кухни — широкий кадр. */
  coupleWide: ref(coupleWideImage, '/images/team/couple-wide.webp'),
  /** Совместный портрет за столом — вертикальный кадр для мобильной версии. */
  coupleAtTable: ref(coupleTableImage, '/images/team/couple-at-table.webp'),
  /** Совместный портрет крупным планом. */
  coupleClose: ref(coupleCloseImage, '/images/team/couple-close.webp'),
  /** Портрет Роберта на фоне осеннего парка. */
  robertPortrait: ref(robertPortraitImage, '/images/team/robert-portrait.webp'),
  /** Портрет Кати, вырезанный из совместного кадра за столом. */
  katyaPortrait: ref(katyaPortraitImage, '/images/team/katya-portrait.webp'),
};

export const teamShotAlt = {
  coupleWide:
    'Роберт и Екатерина Шиловы стоят рядом на фоне кухни со светлыми деревянными фасадами.',
  coupleAtTable:
    'Роберт и Екатерина Шиловы сидят вместе за столом в интерьере кухни.',
  coupleClose:
    'Совместный портрет Роберта и Екатерины Шиловых крупным планом в интерьере кухни.',
  robertPortrait:
    'Роберт Шилов — портрет на фоне осеннего парка.',
  katyaPortrait:
    'Екатерина Шилова — портрет в интерьере кухни; рядом видна часть Роберта.',
};
