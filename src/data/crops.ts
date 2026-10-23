/**
 * ФРАГМЕНТЫ РЕАЛЬНЫХ ПРОЕКТОВ
 * ===========================
 * Это кропы, вырезанные из собственных фотографий Роберта и Кати:
 * ручка, кромка, подсветка, стык камня и дерева. Они лежали в
 * `public/images/details/` без дела, пока страницы оставались
 * текстовыми; теперь ими закрываются карточки, где раньше был
 * один голый абзац.
 *
 * Снимки небольшие по разрешению — это фрагменты, снятые на телефон
 * на объектах. Поэтому показываем их маленькими: в превью карточки
 * или в плитке, но никогда не на всю ширину экрана.
 */
export type Crop = {
  src: string;
  width: number;
  height: number;
  /** Что именно на кадре. Используется и как alt, и как подпись */
  alt: string;
};

export const crops = {
  blackColumn: {
    src: '/images/details/black-column.webp',
    width: 304,
    height: 434,
    alt: 'Чёрная колонна с встроенной техникой рядом со светлым фасадом',
  },
  brassFrames: {
    src: '/images/details/brass-frames.webp',
    width: 420,
    height: 206,
    alt: 'Витрина в латунной рамке с подсветкой полки',
  },
  brassGola: {
    src: '/images/details/brass-gola.webp',
    width: 521,
    height: 261,
    alt: 'Профиль-ручка GOLA в цвете латуни на фасадах ящиков',
  },
  brassHandles: {
    src: '/images/details/brass-handles.webp',
    width: 339,
    height: 242,
    alt: 'Латунные ручки на фасадах с фрезеровкой',
  },
  brassHood: {
    src: '/images/details/brass-hood.webp',
    width: 348,
    height: 434,
    alt: 'Круглая вытяжка в цвете латуни в нише со светлыми стенками',
  },
  flutedWhite: {
    src: '/images/details/fluted-white.webp',
    width: 339,
    height: 401,
    alt: 'Светлые рифлёные фасады верхних шкафов крупным планом',
  },
  graphiteWood: {
    src: '/images/details/graphite-wood.webp',
    width: 608,
    height: 326,
    alt: 'Графитовые фасады с деревянной столешницей и фартуком',
  },
  islandWood: {
    src: '/images/details/island-wood.webp',
    width: 583,
    height: 284,
    alt: 'Остров с деревянной столешницей и рифлёным основанием',
  },
  marbleSplash: {
    src: '/images/details/marble-splash.webp',
    width: 482,
    height: 579,
    alt: 'Фартук под мрамор за варочной панелью',
  },
  openNiche: {
    src: '/images/details/open-niche.webp',
    width: 394,
    height: 342,
    alt: 'Открытая ниша с деревянными полками и подсветкой',
  },
  quartzTop: {
    src: '/images/details/quartz-top.webp',
    width: 651,
    height: 348,
    alt: 'Кварцевая столешница с интегрированной мойкой',
  },
  reededGreen: {
    src: '/images/details/reeded-green.webp',
    width: 510,
    height: 405,
    alt: 'Зелёные рифлёные фасады и деревянная столешница',
  },
  ribbedGlassGold: {
    src: '/images/details/ribbed-glass-gold.webp',
    width: 430,
    height: 224,
    alt: 'Рифлёное стекло в золотой рамке на дверце верхнего шкафа',
  },
  stoneTopTap: {
    src: '/images/details/stone-top-tap.webp',
    width: 463,
    height: 261,
    alt: 'Каменная столешница с врезной мойкой и латунным смесителем',
  },
  vitrineBlack: {
    src: '/images/details/vitrine-black.webp',
    width: 376,
    height: 401,
    alt: 'Витрина с рифлёным стеклом в тёмной рамке и подсветкой',
  },
  woodBacksplash: {
    src: '/images/details/wood-backsplash.webp',
    width: 526,
    height: 263,
    alt: 'Деревянный фартук с подсветкой под верхними шкафами',
  },
  woodGrey: {
    src: '/images/details/wood-grey.webp',
    width: 640,
    height: 451,
    alt: 'Серые фасады с деревянной столешницей и фартуком в ёлочку',
  },
  woodTopGreen: {
    src: '/images/details/wood-top-green.webp',
    width: 608,
    height: 261,
    alt: 'Тёмно-зелёные рифлёные фасады с деревянной столешницей',
  },
} satisfies Record<string, Crop>;

export type CropId = keyof typeof crops;
