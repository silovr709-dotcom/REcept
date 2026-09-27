import type { StaticImageData } from 'next/image';

import brassHood from '@public/images/details/brass-hood.webp';
import brassGola from '@public/images/details/brass-gola.webp';
import stoneTopTap from '@public/images/details/stone-top-tap.webp';
import brassFrames from '@public/images/details/brass-frames.webp';
import blackColumn from '@public/images/details/black-column.webp';
import reededGreen from '@public/images/details/reeded-green.webp';
import woodTopGreen from '@public/images/details/wood-top-green.webp';
import ribbedGlassGold from '@public/images/details/ribbed-glass-gold.webp';
import woodBacksplash from '@public/images/details/wood-backsplash.webp';
import openNiche from '@public/images/details/open-niche.webp';
import flutedWhite from '@public/images/details/fluted-white.webp';
import vitrineBlack from '@public/images/details/vitrine-black.webp';
import brassHandles from '@public/images/details/brass-handles.webp';
import marbleSplash from '@public/images/details/marble-splash.webp';
import islandWood from '@public/images/details/island-wood.webp';
import graphiteWood from '@public/images/details/graphite-wood.webp';
import quartzTop from '@public/images/details/quartz-top.webp';
import woodGrey from '@public/images/details/wood-grey.webp';

/**
 * ДЕТАЛИ РАБОТ
 * ============
 * Это не отдельная съёмка и не сток: каждый кадр — фрагмент реальной
 * фотографии из папки public/images/kitchens, вырезанный в исходном
 * разрешении. Подписи описывают ровно то, что видно на кадре.
 *
 * Зачем: индивидуальная мебель отличается от магазинной именно в мелочах —
 * профилях, кромках, стыках, подсветке и фактурах. Общий план этого не
 * показывает.
 */

export type Detail = {
  id: string;
  image: StaticImageData;
  /** Что изображено */
  title: string;
  /** Короткое пояснение, зачем так сделано */
  note: string;
  /** Проект-источник кадра */
  project: string;
  projectTitle: string;
  alt: string;
};

export const details: Detail[] = [
  {
    id: 'brass-hood',
    image: brassHood,
    title: 'Вытяжка в цвете латуни',
    note: 'Техника не прячется, а работает как акцент',
    project: 'kuhnya-v-nishe-latun',
    projectTitle: 'Прямая кухня в нише с латунью',
    alt: 'Цилиндрическая вытяжка в цвете латуни на фоне деревянной ниши — фрагмент кухни ателье «РЕцепт»',
  },
  {
    id: 'brass-gola',
    image: brassGola,
    title: 'Профиль-ручка в цвете латуни',
    note: 'Ящики открываются без выступающих ручек',
    project: 'kuhnya-v-nishe-latun',
    projectTitle: 'Прямая кухня в нише с латунью',
    alt: 'Фрагмент фасадов кухни с латунным профилем-ручкой вместо накладных ручек',
  },
  {
    id: 'stone-top-tap',
    image: stoneTopTap,
    title: 'Каменная столешница и латунный смеситель',
    note: 'Скруглённая кромка и врезная мойка',
    project: 'kuhnya-v-nishe-latun',
    projectTitle: 'Прямая кухня в нише с латунью',
    alt: 'Каменная столешница со скруглённой кромкой, врезная мойка и латунный смеситель',
  },
  {
    id: 'brass-frames',
    image: brassFrames,
    title: 'Открытые модули в латунной рамке',
    note: 'Подсветка внутри секции, а не снаружи',
    project: 'kuhnya-v-nishe-latun',
    projectTitle: 'Прямая кухня в нише с латунью',
    alt: 'Открытые верхние модули кухни в латунной рамке с внутренней подсветкой',
  },
  {
    id: 'black-column',
    image: blackColumn,
    title: 'Колонна со встроенной техникой',
    note: 'Духовой шкаф на удобной высоте, без наклонов',
    project: 'kuhnya-v-nishe-latun',
    projectTitle: 'Прямая кухня в нише с латунью',
    alt: 'Высокая колонна кухни со встроенной техникой в чёрном исполнении',
  },
  {
    id: 'reeded-green',
    image: reededGreen,
    title: 'Рифлёные фасады глубокого зелёного',
    note: 'Фактура вместо декора — работает даже на маленькой кухне',
    project: 'kompaktnaya-kuhnya-zelenye-reyki',
    projectTitle: 'Компактная кухня с зелёными рейками',
    alt: 'Крупный план зелёных рифлёных фасадов кухни и деревянной столешницы',
  },
  {
    id: 'wood-top-green',
    image: woodTopGreen,
    title: 'Деревянная столешница на рейках',
    note: 'Тёплое дерево уравновешивает глубокий цвет',
    project: 'kompaktnaya-kuhnya-zelenye-reyki',
    projectTitle: 'Компактная кухня с зелёными рейками',
    alt: 'Столешница в текстуре дерева над зелёными рифлёными фасадами',
  },
  {
    id: 'ribbed-glass-gold',
    image: ribbedGlassGold,
    title: 'Рифлёное стекло в золотой рамке',
    note: 'Видно, что внутри что-то есть — но не видно, что именно',
    project: 'uglovaya-kuhnya-do-potolka',
    projectTitle: 'Угловая кухня до потолка',
    alt: 'Антресоли кухни с рифлёным стеклом в тонкой золотой рамке',
  },
  {
    id: 'wood-backsplash',
    image: woodBacksplash,
    title: 'Деревянный фартук с подсветкой',
    note: 'Свет спрятан под корпусом и не слепит',
    project: 'uglovaya-kuhnya-do-potolka',
    projectTitle: 'Угловая кухня до потолка',
    alt: 'Деревянный фартук кухни с линейной подсветкой рабочей зоны',
  },
  {
    id: 'open-niche',
    image: openNiche,
    title: 'Открытые ниши в текстуре дерева',
    note: 'Разбивают сплошной фронт фасадов',
    project: 'uglovaya-kuhnya-do-potolka',
    projectTitle: 'Угловая кухня до потолка',
    alt: 'Открытые ниши-полки в текстуре дерева между закрытыми секциями кухни',
  },
  {
    id: 'fluted-white',
    image: flutedWhite,
    title: 'Рифлёные фасады верхнего яруса',
    note: 'Классика читается мягче за счёт вертикального ритма',
    project: 'kuhnya-neoklassika-greyzh',
    projectTitle: 'Неоклассика в цвете грейж',
    alt: 'Крупный план рифлёных фасадов верхнего яруса кухни в стиле неоклассики',
  },
  {
    id: 'vitrine-black',
    image: vitrineBlack,
    title: 'Витрины в тонких чёрных рамках',
    note: 'Вечером работают как мягкий свет в комнате',
    project: 'kuhnya-neoklassika-greyzh',
    projectTitle: 'Неоклассика в цвете грейж',
    alt: 'Стеклянные витрины кухни в тонких чёрных рамках с внутренней подсветкой',
  },
  {
    id: 'brass-handles',
    image: brassHandles,
    title: 'Ручки-скобы и фрезеровка',
    note: 'Неглубокая фрезеровка не утяжеляет фасад',
    project: 'kuhnya-neoklassika-greyzh',
    projectTitle: 'Неоклассика в цвете грейж',
    alt: 'Фасады кухни с фрезеровкой и ручками-скобами в цвете латуни',
  },
  {
    id: 'marble-splash',
    image: marbleSplash,
    title: 'Мраморный фартук и белые рейки',
    note: 'Светлый верх разгружает тёмную базу',
    project: 'kuhnya-grafit-i-belye-reyki',
    projectTitle: 'Графит и белые рейки',
    alt: 'Фартук в мраморной текстуре и белые рифлёные фасады над графитовой базой',
  },
  {
    id: 'island-wood',
    image: islandWood,
    title: 'Барная столешница острова',
    note: 'Дерево превращает рабочую зону в обеденную',
    project: 'kuhnya-gostinaya-s-ostrovom',
    projectTitle: 'Кухня-гостиная с островом',
    alt: 'Деревянная барная столешница острова на кухне-гостиной',
  },
  {
    id: 'graphite-wood',
    image: graphiteWood,
    title: 'Матовый графит и дерево',
    note: 'Матовая поверхность не бликует и не собирает отпечатки',
    project: 'kuhnya-grafit-s-ostrovom',
    projectTitle: 'Графитовая кухня с островом',
    alt: 'Сочетание матовых графитовых фасадов с деревянной столешницей и фартуком',
  },
  {
    id: 'quartz-top',
    image: quartzTop,
    title: 'Столешница из искусственного камня',
    note: 'Бесшовный угол и врезная мойка',
    project: 'p-obraznaya-kuhnya-bezh',
    projectTitle: 'П-образная кухня в бежевом',
    alt: 'Светлая столешница из искусственного камня с врезной мойкой',
  },
  {
    id: 'wood-grey',
    image: woodGrey,
    title: 'Смена фактур на одной стене',
    note: 'Рифлёные и гладкие фасады задают ритм',
    project: 'bolshaya-kuhnya-v-dome',
    projectTitle: 'Большая кухня в частном доме',
    alt: 'Рифлёные и гладкие фасады кухни рядом с фартуком в текстуре дерева',
  },
];

export const getDetail = (id: string) => details.find((d) => d.id === id);

export const getDetailsFor = (ids: readonly string[]) =>
  ids.map(getDetail).filter((d): d is Detail => Boolean(d));

/** Подборка для главной: максимально разные фактуры и металлы. */
export const featuredDetails = getDetailsFor([
  'brass-hood',
  'reeded-green',
  'ribbed-glass-gold',
  'marble-splash',
  'brass-gola',
  'vitrine-black',
  'wood-backsplash',
  'quartz-top',
]);
