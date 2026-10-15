import type { StaticImageData } from 'next/image';
import type { ImageRef } from '@/lib/content/types';

import heroShot from '@public/images/team/hero-rob-kate.webp';
import measureShot from '@public/images/team/robert-measure.webp';
import planShot from '@public/images/team/katya-plan.webp';
import eveningShot from '@public/images/team/rob-kate-evening.webp';
import sampleShot from '@public/images/team/katya-sample.webp';
import siteShot from '@public/images/team/robert-site.webp';

/**
 * РОБЕРТ И КАТЯ НА САЙТЕ
 * ======================
 * Это постановочные кадры, собранные по личным фотографиям владельцев
 * и с их прямого согласия: лица, сложение и возраст — их собственные,
 * а обстановка и одежда подобраны под конкретный раздел сайта.
 * Исходные снимки лежат в `images/team/` в репозитории и на сайт
 * не выкладываются — владельцы попросили использовать внешность,
 * а не сами фотографии.
 *
 * ПРАВИЛО ПРИ ЗАМЕНЕ. Подставлять сюда чужое лицо или «похожего
 * человека» нельзя ни при каких условиях: под кадром стоят настоящие
 * имя, фамилия и телефон. Если понадобится новый кадр — он собирается
 * с тех же исходников (`reference/team/`, описание внешности —
 * `reference/team/ОПИСАНИЕ.md`). Если исходников под рукой нет,
 * лучше оставить блок без фотографии: вёрстка это выдерживает.
 *
 * Путь в `src` намеренно публичный, а не хешированный: статическая
 * витрина лежит в подпапке, и префикс дописывает `assetUrl()`.
 * Из импорта берутся только размеры и размытая заглушка.
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
  /** Первый экран: оба в готовой кухне, кухня слева, люди справа */
  hero: ref(heroShot, '/images/team/hero-rob-kate.webp'),
  /** Роберт на замере в квартире на стадии ремонта */
  robertMeasure: ref(measureShot, '/images/team/robert-measure.webp'),
  /** Катя за проектом: чертёж, образцы, профиль-ручка */
  katyaPlan: ref(planShot, '/images/team/katya-plan.webp'),
  /** Оба вечером у острова — тёплый кадр для финального экрана */
  evening: ref(eveningShot, '/images/team/rob-kate-evening.webp'),
  /** Катя протягивает образец прямо в объектив — «четвёртая стена» */
  katyaSample: ref(sampleShot, '/images/team/katya-sample.webp'),
  /** Роберт на объекте с чертежом и телефоном — координация подрядчиков */
  robertSite: ref(siteShot, '/images/team/robert-site.webp'),
};

export const teamShotAlt = {
  hero: 'Роберт и Катя из мебельного ателье «РЕцепт» в готовой кухне на заказ в Твери',
  robertMeasure:
    'Роберт Шилов снимает размеры кухни на объекте в Твери перед изготовлением',
  katyaPlan:
    'Екатерина Шилова работает над проектом кухни: чертёж фасадов и образцы материалов',
  evening:
    'Роберт и Катя у острова готовой кухни — проект они ведут вдвоём от замера до сборки',
  katyaSample:
    'Екатерина Шилова показывает образец зелёного матового фасада и другие образцы материалов',
  robertSite:
    'Роберт Шилов на объекте в Твери: чертёж кухни в руках, согласование по телефону с подрядчиками',
};
