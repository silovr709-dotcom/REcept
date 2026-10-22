import type { StaticImageData } from 'next/image';

import flutedGlass from '@public/images/textures/fluted-glass.jpg';
import veneer from '@public/images/textures/veneer.jpg';
import stone from '@public/images/textures/stone.jpg';
import hardware from '@public/images/textures/hardware.jpg';
import light from '@public/images/textures/light.jpg';
import edge from '@public/images/textures/edge.jpg';

// Детали конкретных проектов: тот же объект, что и на общем плане
import p01Profile from '@public/images/textures/p01-profile.webp';
import p01Stone from '@public/images/textures/p01-stone.webp';
import p01Hood from '@public/images/textures/p01-hood.webp';
import p02Bar from '@public/images/textures/p02-bar.webp';
import p02Hood from '@public/images/textures/p02-hood.webp';
import p02Gap from '@public/images/textures/p02-gap.webp';
import p03Corner from '@public/images/textures/p03-corner.webp';
import p03Hood from '@public/images/textures/p03-hood.webp';
import p03Niche from '@public/images/textures/p03-niche.webp';


/**
 * ДЕТАЛИ И ФАКТУРЫ
 * ===============
 * Крупные планы того, что не разглядеть на общем плане: профиль-ручка,
 * кромка камня, рифлёное стекло, подсветка, зазор между фасадами.
 *
 * ЧТО ЭТО ЗА КАДРЫ. Общие планы в портфолио — фотографии реальных
 * кухонь. А вот эти макро-кадры — визуализации фактур и узлов, а не
 * съёмка конкретного объекта. Поэтому подпись говорит только о решении
 * и материале: ничего о заказчике, сроках и бюджете здесь не
 * утверждается.
 *
 * СЛЕДУЮЩИЙ ШАГ. Фактуры заменяются детальными кадрами тех самых девяти
 * кухонь из портфолио (фрагмент того же снимка или кадр, собранный по
 * нему). Как только у проекта появляются свои детали, его id
 * прописывается в `detailIds` в data/projects.ts, а фактура-заглушка
 * отсюда уходит.
 */

export type Detail = {
  id: string;
  image: StaticImageData;
  /** Что изображено */
  title: string;
  /** Короткое пояснение, зачем так сделано */
  note: string;
  /** Проект, к которому относится решение */
  project: string;
  projectTitle: string;
  alt: string;
};

export const details: Detail[] = [
  {
    id: 'p01-profile',
    image: p01Profile,
    title: 'Латунный профиль вместо ручки',
    note: 'Профиль идёт по всей длине ящика и заканчивается ровно с фасадом. Ничего не выступает в проход, зацепиться рукавом не за что.',
    project: 'kuhnya-v-nishe-latun',
    projectTitle: 'Прямая кухня в нише с латунью',
    alt: 'Крупный план: латунный профиль-ручка по верхней кромке ящика под каменной столешницей, светлый матовый фасад',
  },
  {
    id: 'p01-stone',
    image: p01Stone,
    title: 'Кромка камня, мойка и смеситель',
    note: 'Мойка врезана заподлицо, смеситель стоит ровно по центру чаши. Столешница остаётся одной плоскостью — ни бортика, ни шва, где копится вода.',
    project: 'kuhnya-v-nishe-latun',
    projectTitle: 'Прямая кухня в нише с латунью',
    alt: 'Крупный план: каменная столешница со скруглённой кромкой, белая мойка и латунный смеситель по центру чаши',
  },
  {
    id: 'p01-hood',
    image: p01Hood,
    title: 'Латунная вытяжка в деревянной нише',
    note: 'Вытяжка, профиль-ручка и смеситель — один металл. Подсветка убрана под полку: светит на столешницу, а не в глаза.',
    project: 'kuhnya-v-nishe-latun',
    projectTitle: 'Прямая кухня в нише с латунью',
    alt: 'Крупный план: латунная цилиндрическая вытяжка на фоне деревянной ниши с полками и скрытой подсветкой',
  },
  {
    id: 'p02-bar',
    image: p02Bar,
    title: 'Стык дуба и камня на острове',
    note: 'Дубовая барная столешница толще рабочей и лежит ниже. Готовка и еда разделены по высоте, но остров читается как один предмет.',
    project: 'kuhnya-gostinaya-s-ostrovom',
    projectTitle: 'Кухня-гостиная с островом',
    alt: 'Крупный план: стык дубовой барной столешницы и серой каменной столешницы острова, рифлёная боковина снизу',
  },
  {
    id: 'p02-hood',
    image: p02Hood,
    title: 'Вытяжка, встроенная в потолок',
    note: 'Над островом нет ничего на уровне глаз: панель вытяжки встала заподлицо с потолком, рядом только трек и линия карнизной подсветки.',
    project: 'kuhnya-gostinaya-s-ostrovom',
    projectTitle: 'Кухня-гостиная с островом',
    alt: 'Крупный план: квадратная вытяжная панель заподлицо с потолком, чёрный световой трек и тёплая линия подсветки',
  },
  {
    id: 'p02-gap',
    image: p02Gap,
    title: 'Зазор 4 мм и свет под шкафами',
    note: 'Между фасадами без ручек везде одинаковые 4 мм. Это и отличает аккуратную кухню от обычной: рисунок зазоров виден раньше, чем цвет.',
    project: 'kuhnya-gostinaya-s-ostrovom',
    projectTitle: 'Кухня-гостиная с островом',
    alt: 'Крупный план: два светлых фасада без ручек с ровным зазором, тёмная столешница и подсветка под дубовым шкафом',
  },
  {
    id: 'p03-corner',
    image: p03Corner,
    title: 'Угол столешницы в ус',
    note: 'Две части столешницы сведены по диагонали угла: без ступеньки по высоте и без щели у стены. Самое заметное место в маленькой кухне.',
    project: 'kompaktnaya-kuhnya-zelenye-reyki',
    projectTitle: 'Компактная кухня с зелёными рейками',
    alt: 'Крупный план: угловой стык двух дубовых столешниц, запиленный в ус, на фоне серой бетонной стены',
  },
  {
    id: 'p03-hood',
    image: p03Hood,
    title: 'Вытяжка и свет на бетонной стене',
    note: 'Наклонная вытяжка не отнимает голову у того, кто стоит у плиты, а подвесы висят рядом, а не по центру рабочей зоны.',
    project: 'kompaktnaya-kuhnya-zelenye-reyki',
    projectTitle: 'Компактная кухня с зелёными рейками',
    alt: 'Крупный план: чёрная наклонная вытяжка на серой бетонной стене и чёрный подвес с лампой накаливания',
  },
  {
    id: 'p03-niche',
    image: p03Niche,
    title: 'Ниша в дубовой рамке',
    note: 'Открытая ниша разбивает глухой зелёный фронт и забирает то, чем пользуются каждый день: иначе это стоит на столешнице.',
    project: 'kompaktnaya-kuhnya-zelenye-reyki',
    projectTitle: 'Компактная кухня с зелёными рейками',
    alt: 'Крупный план: открытая ниша в дубовой рамке среди тёмно-зелёных реечных фасадов',
  },
  {
    id: 'stone',
    image: stone,
    title: 'Камень столешницы',
    note: 'Матовая поверхность, запил кромки, врезная мойка',
    project: 'malenkaya-kuhnya-p-obraznaya',
    projectTitle: 'Маленькая П-образная кухня',
    alt: 'Столешница из камня с матовой поверхностью и аккуратным запилом кромки',
  },
  {
    id: 'veneer',
    image: veneer,
    title: 'Шпон ореха',
    note: 'Продолжающийся рисунок волокон и врезная ручка по кромке',
    project: 'bolshaya-kuhnya-v-dome',
    projectTitle: 'Большая кухня в доме',
    alt: 'Фасад из шпона ореха с непрерывным рисунком волокон и врезной ручкой',
  },
  {
    id: 'fluted-glass',
    image: flutedGlass,
    title: 'Рифлёное стекло в рамке',
    note: 'Видно, что внутри что-то есть, но не видно, что именно',
    project: 'uglovaya-kuhnya-s-derevyannym-fartukom',
    projectTitle: 'Угловая кухня с деревянным фартуком',
    alt: 'Дверца с рифлёным стеклом в тонкой рамке и тёплой подсветкой внутри',
  },
  {
    id: 'light',
    image: light,
    title: 'Скрытая подсветка',
    note: 'Свет спрятан под корпусом и не бьёт в глаза',
    project: 'kuhnya-grafit-s-ostrovom',
    projectTitle: 'Графитовая кухня с островом',
    alt: 'Тёплая линейная подсветка, спрятанная под навесным шкафом над столешницей',
  },
  {
    id: 'hardware',
    image: hardware,
    title: 'Наполнение и фурнитура',
    note: 'Направляющие с доводчиком и разделители из дуба',
    project: 'kuhnya-neoklassika-greyzh',
    projectTitle: 'Неоклассика в цвете грейж',
    alt: 'Выдвижной ящик с дубовыми разделителями и направляющей с доводчиком',
  },
  {
    id: 'edge',
    image: edge,
    title: 'Зазоры и примыкания',
    note: 'Ровная тонкая линия — признак точной сборки',
    project: 'kuhnya-grafit-i-belye-reyki',
    projectTitle: 'Графит и белые рейки',
    alt: 'Ровный теневой зазор между двумя матовыми фасадами',
  },
];

export const getDetail = (id: string) => details.find((d) => d.id === id);

export const getDetailsFor = (ids: readonly string[]) =>
  ids.map(getDetail).filter((d): d is Detail => Boolean(d));

export const featuredDetails = details.slice(0, 8);
