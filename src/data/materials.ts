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
