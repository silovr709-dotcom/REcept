/**
 * МАТЕРИАЛЫ И ФРЕЗЕРОВКИ
 * ======================
 * Данные взяты из рабочего каталога производства, на котором «РЕцепт»
 * размещает заказы (репозиторий silovr709-dotcom/Calculator, выгрузка
 * от 14.10.2026). Это фактура для клиента: что можно выбрать.
 *
 * ЦЕН ЗДЕСЬ НЕТ И БЫТЬ НЕ ДОЛЖНО. В исходнике лежит закупочный прайс
 * производства — публиковать его на сайте нельзя: он показывает
 * себестоимость и наценку. На сайт попадает только выбор, доступный
 * заказчику, и относительные категории, по которым видно «дороже —
 * дешевле» без конкретных сумм.
 *
 * Сняты с производства позиции в счёт не идут: указано только то,
 * что действительно можно заказать сегодня.
 */

export type MaterialFamily = {
  id: string;
  title: string;
  /** Сколько действующих вариантов отделки */
  count: number;
  /** Что это и кому подходит — без рекламы */
  text: string;
  /** Производители, названия которых имеет смысл называть вслух */
  brands: string[];
  /** Чем ограничено */
  caveat: string | null;
};

export const materialFamilies: MaterialFamily[] = [
  {
    id: 'pvc',
    title: 'МДФ в плёнке ПВХ',
    count: 595,
    text:
      'Самый ходовой вариант для фасадов с фрезеровкой: рисунок фрезеруется на плите МДФ и затягивается плёнкой. Матовые, глянцевые и текстурные поверхности, в том числе под дерево.',
    brands: [],
    caveat: 'Плёнка не любит прямой горячий пар — над варочной панелью и у духовки нужен нормальный зазор и вытяжка.',
  },
  {
    id: 'enamel',
    title: 'МДФ в эмали',
    count: 0,
    text:
      'Фасад красится в любой цвет по каталогу RAL или NCS. Единственный способ попасть точно в цвет стен, плитки или уже стоящей мебели. Все 60 фрезеровок доступны в эмали.',
    brands: [],
    caveat: 'Дороже плёнки и дольше по сроку: эмаль сохнет слоями.',
  },
  {
    id: 'hpl',
    title: 'Пластик HPL',
    count: 278,
    text:
      'Для гладких фасадов без фрезеровки. Самая устойчивая к царапинам и влаге поверхность из доступных, включая сверхматовые покрытия с эффектом антиотпечаток.',
    brands: ['ARPA', 'FENIX', 'Rexay'],
    caveat: 'Только прямые фасады: фрезеровать пластик нельзя.',
  },
  {
    id: 'ldsp',
    title: 'ЛДСП',
    count: 228,
    text:
      'Корпуса, а при скромном бюджете — и фасады. Современные текстурные плиты с синхронным тиснением выглядят куда лучше, чем ЛДСП десятилетней давности.',
    brands: ['EGGER', 'Lamarty'],
    caveat: 'Кромка — слабое место: мы ставим её под нормальный клей, а не термо, иначе со временем отходит.',
  },
];

export type Milling = {
  name: string;
  slug: string;
  /** Категория сложности: чем выше, тем дороже фрезеровка */
  category: 1 | 2 | 3 | 4;
  /** В каких покрытиях изготавливается */
  coatings: string[];
  /** Толщина плиты МДФ, мм */
  thickness: string;
};

/** 60 действующих фрезеровок фасадов, каталог 2026 */
export const millings: Milling[] = [
  { name: 'Арина', slug: 'arina', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Арка', slug: 'arka', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Арка 2', slug: 'arka-2', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Арка Р', slug: 'arka-r', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Валенсия', slug: 'valensiya', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Дали', slug: 'dali', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Дуэт', slug: 'duet', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Квадрат', slug: 'kvadrat', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Квадро', slug: 'kvadro', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Классика', slug: 'klassika', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Классика 2', slug: 'klassika-2', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Лучи', slug: 'luchi', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Модерн', slug: 'modern', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Мыло', slug: 'mylo', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Мюнхен', slug: 'myunhen', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Ницца', slug: 'nicca', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Петра', slug: 'petra', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Пирамида', slug: 'piramida', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Ретро', slug: 'retro', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Ромб', slug: 'romb', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Рондо', slug: 'rondo', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Симпа', slug: 'simpa', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Ситро', slug: 'sitro', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Ситро Р', slug: 'sitro-r', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Стрит', slug: 'strit', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Флоренция', slug: 'florenciya', category: 1, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Византия', slug: 'vizantiya', category: 2, coatings: ['эмаль'], thickness: '19' },
  { name: 'Византия 2', slug: 'vizantiya-2', category: 2, coatings: ['ПВХ', 'эмаль'], thickness: '19' },
  { name: 'Джулия', slug: 'dzhuliya', category: 2, coatings: ['ПВХ', 'эмаль'], thickness: '19' },
  { name: 'Лжевыборка', slug: 'lzhevyborka', category: 2, coatings: ['ПВХ', 'эмаль'], thickness: '19' },
  { name: 'Лорето', slug: 'loreto', category: 2, coatings: ['ПВХ', 'эмаль'], thickness: '19' },
  { name: 'Марко', slug: 'marko', category: 2, coatings: ['эмаль'], thickness: '19' },
  { name: 'Марокко', slug: 'marokko', category: 2, coatings: ['ПВХ', 'эмаль'], thickness: '19' },
  { name: 'Марокко 2', slug: 'marokko-2', category: 2, coatings: ['ПВХ', 'эмаль'], thickness: '19' },
  { name: 'Монако', slug: 'monako', category: 2, coatings: ['ПВХ', 'эмаль'], thickness: '19' },
  { name: 'Нео', slug: 'neo', category: 2, coatings: ['ПВХ', 'эмаль'], thickness: '19' },
  { name: 'Паллада', slug: 'pallada', category: 2, coatings: ['ПВХ', 'эмаль'], thickness: '19' },
  { name: 'Рим', slug: 'rim', category: 2, coatings: ['ПВХ', 'эмаль'], thickness: '19' },
  { name: 'Римини', slug: 'rimini', category: 2, coatings: ['эмаль'], thickness: '19' },
  { name: 'Тоскана', slug: 'toskana', category: 2, coatings: ['ПВХ', 'эмаль'], thickness: '19' },
  { name: 'Фостер', slug: 'foster', category: 2, coatings: ['эмаль'], thickness: '19' },
  { name: 'Арецио', slug: 'arecio', category: 3, coatings: ['ПВХ', 'эмаль'], thickness: '22' },
  { name: 'Барнео', slug: 'barneo', category: 3, coatings: ['ПВХ', 'эмаль'], thickness: '22' },
  { name: 'Бергамо', slug: 'bergamo', category: 3, coatings: ['ПВХ', 'эмаль'], thickness: '22' },
  { name: 'Бридж', slug: 'bridzh', category: 3, coatings: ['ПВХ', 'эмаль'], thickness: '22' },
  { name: 'Венеция', slug: 'veneciya', category: 3, coatings: ['ПВХ', 'эмаль'], thickness: '22' },
  { name: 'Волна', slug: 'volna', category: 3, coatings: ['ПВХ', 'эмаль'], thickness: '22' },
  { name: 'Дублин', slug: 'dublin', category: 3, coatings: ['эмаль'], thickness: '22' },
  { name: 'Жалюзи', slug: 'zhalyuzi', category: 3, coatings: ['эмаль'], thickness: '16-19' },
  { name: 'Мадрид', slug: 'madrid', category: 3, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Мальта', slug: 'malta', category: 3, coatings: ['ПВХ', 'эмаль'], thickness: '22' },
  { name: 'Олимпия', slug: 'olimpiya', category: 3, coatings: ['ПВХ', 'эмаль'], thickness: '16' },
  { name: 'Палермо', slug: 'palermo', category: 3, coatings: ['эмаль'], thickness: '22' },
  { name: 'София', slug: 'sofiya', category: 3, coatings: ['эмаль'], thickness: '22' },
  { name: 'Фабио', slug: 'fabio', category: 3, coatings: ['ПВХ', 'эмаль'], thickness: '22' },
  { name: 'Белладжо', slug: 'belladzho', category: 4, coatings: ['эмаль'], thickness: '25' },
  { name: 'Капелла', slug: 'kapella', category: 4, coatings: ['эмаль'], thickness: '25' },
  { name: 'Луиджи', slug: 'luidzhi', category: 4, coatings: ['ПВХ', 'эмаль'], thickness: '25' },
  { name: 'Паола', slug: 'paola', category: 4, coatings: ['эмаль'], thickness: '25' },
  { name: 'Помпея', slug: 'pompeya', category: 4, coatings: ['ПВХ', 'эмаль'], thickness: '25' },
];

/* ====================================================================
   ЧТО ВНУТРИ: ФУРНИТУРА, МЕХАНИЗМЫ, СВЕТ
   ====================================================================
   Самая недооценённая часть кухни. Снаружи два одинаковых фасада
   могут скрывать петлю за сто рублей и петлю за тысячу — разницу
   человек обнаруживает через год, когда дверца начинает провисать.

   Поэтому здесь показан не «список брендов», а то, что в этих
   позициях есть выбор и он влияет на цену. Врать, что мы ставим
   всем подряд топовую фурнитуру, нельзя: в каталоге есть и базовые
   линейки, и верхние. Честно — назвать обе.
   ==================================================================== */

export type HardwareGroup = {
  id: string;
  title: string;
  /** Сколько позиций доступно в этой группе */
  count: number;
  text: string;
  /** От базового к верхнему — именно в этом порядке */
  brands: string[];
};

export const hardwareGroups: HardwareGroup[] = [
  {
    id: 'hinges',
    title: 'Петли и доводчики',
    count: 65,
    text: 'От петли зависит, будет ли дверца через год закрываться сама или с хлопком. Базовые линейки работают нормально, верхние — заметно тише и дольше держат регулировку.',
    brands: ['Боярд', 'Titus', 'Hettich', 'Blum'],
  },
  {
    id: 'drawers',
    title: 'Ящики и направляющие',
    count: 48,
    text: 'Главное отличие верхних систем — ящик выдвигается полностью и не проседает под весом посуды. Это то, чем вы пользуетесь по двадцать раз в день.',
    brands: ['Боярд', 'Blum Tandembox', 'Blum Legrabox'],
  },
  {
    id: 'lift',
    title: 'Подъёмные механизмы',
    count: 44,
    text: 'Для верхних шкафов, которые открываются вверх. Нужны там, где распашная дверца била бы вас по голове у плиты или мешала на узкой кухне.',
    brands: ['Blum Aventos'],
  },
  {
    id: 'gola',
    title: 'Профиль-ручка GOLA',
    count: 73,
    text: 'Кухня без единой ручки: вместо них алюминиевый профиль в торце фасада. Есть варианты со встроенной подсветкой рабочей зоны — тогда отдельные светильники не нужны.',
    brands: ['GOLATIME', 'GOLIGHT', 'SCHÜCO'],
  },
  {
    id: 'light',
    title: 'Свет',
    count: 42,
    text: 'Врезные светильники, светодиодные ленты и блоки питания. Схему подсветки считаем заранее — вместе со схемой розеток, которую отдаём вашему электрику до штробления.',
    brands: [],
  },
  {
    id: 'filling',
    title: 'Наполнение ящиков',
    count: 83,
    text: 'Лотки под приборы, рейлинги, посудосушители, бутылочницы и карго. Подбираем под то, что у вас реально лежит на кухне, а не по типовой схеме.',
    brands: ['Firmax'],
  },
];

export type Countertop = {
  id: string;
  title: string;
  count: number;
  text: string;
  brands: string[];
};

/** Столешницы, доступные к заказу вместе с кухней */
export const countertopLines: Countertop[] = [
  {
    id: 'compact',
    title: 'Компакт-плита',
    count: 133,
    text: 'Плита высокого давления без основы из ДСП: не боится воды по кромке, тонкая по торцу, выдерживает горячее. Лучший выбор для зоны мойки.',
    brands: ['Arkobaleno', 'Slotex'],
  },
  {
    id: 'postforming',
    title: 'Постформинг',
    count: 136,
    text: 'Разумный вариант при ограниченном бюджете. Решает всё аккуратность стыков и обработка выреза под мойку — именно там такие столешницы обычно и умирают.',
    brands: ['Мир Столешниц', 'СОЮЗ'],
  },
];

/** Стекло и зеркала в фасадах витрин */
export const glassOptions = {
  count: 177,
  kinds: ['Стекло', 'Зеркала', 'Фацет', 'Пескоструй', 'Фотопечать'],
};
