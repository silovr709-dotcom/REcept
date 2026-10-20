import type { StaticImageData } from 'next/image';

import brass from '@public/images/textures/brass.jpg';
import woodStone from '@public/images/textures/wood-stone.jpg';
import reeded from '@public/images/textures/reeded.jpg';
import lacquer from '@public/images/textures/lacquer.jpg';
import flutedGlass from '@public/images/textures/fluted-glass.jpg';
import veneer from '@public/images/textures/veneer.jpg';
import stone from '@public/images/textures/stone.jpg';
import hardware from '@public/images/textures/hardware.jpg';
import light from '@public/images/textures/light.jpg';
import edge from '@public/images/textures/edge.jpg';
import tverHandle from '@public/images/textures/tver-handle.webp';
import tverSink from '@public/images/textures/tver-sink.webp';
import tverDrawer from '@public/images/textures/tver-drawer.webp';
import tverColumn from '@public/images/textures/tver-column.webp';

// Детали конкретных проектов: каждая снята на той же кухне, что и общий план
import p01Gola from '@/assets/details/p01-gola.webp';
import p01Stone from '@/assets/details/p01-stone.webp';
import p01Hood from '@/assets/details/p01-hood.webp';
import p01Oven from '@/assets/details/p01-oven.webp';
import p02Bar from '@/assets/details/p02-bar.webp';
import p02Sink from '@/assets/details/p02-sink.webp';
import p02Gap from '@/assets/details/p02-gap.webp';
import p02Light from '@/assets/details/p02-light.webp';
import p03Reeded from '@/assets/details/p03-reeded.webp';

/**
 * ДЕТАЛИ И ФАКТУРЫ
 * ===============
 * Крупные планы того, что не разглядеть на общем плане: профиль-ручка,
 * кромка камня, рифлёное стекло, подсветка, зазор между фасадами.
 *
 * Как и остальные изображения на сайте, это визуализации, а не съёмка
 * готовых объектов. Подписи описывают решение и материал — ничего
 * о конкретном заказчике, сроках или бюджете здесь не утверждается.
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
    id: 'brass',
    image: brass,
    title: 'Профиль-ручка в цвете латуни',
    note: 'Ящик открывается без единой выступающей детали',
    project: 'kuhnya-v-nishe-latun',
    projectTitle: 'Прямая кухня в нише с латунью',
    alt: 'Латунный профиль-ручка, утопленный в верхнюю кромку фасада под каменной столешницей',
  },
  {
    id: 'wood-stone',
    image: woodStone,
    title: 'Дерево и камень рядом',
    note: 'Стык двух материалов — место, где видно точность',
    project: 'kuhnya-v-nishe-latun',
    projectTitle: 'Прямая кухня в нише с латунью',
    alt: 'Стык деревянной и каменной столешниц крупным планом',
  },
  {
    id: 'stone',
    image: stone,
    title: 'Камень столешницы',
    note: 'Матовая поверхность, запил кромки, врезная мойка',
    project: 'p-obraznaya-kuhnya-bezh',
    projectTitle: 'П-образная кухня в бежевом',
    alt: 'Столешница из камня с матовой поверхностью и аккуратным запилом кромки',
  },
  {
    id: 'reeded',
    image: reeded,
    title: 'Рифлёный фасад',
    note: 'Рельеф вместо декора: свет сам рисует ритм',
    project: 'kompaktnaya-kuhnya-zelenye-reyki',
    projectTitle: 'Компактная кухня с зелёными рейками',
    alt: 'Рифлёный фасад глубокого приглушённого зелёного с вертикальными рёбрами',
  },
  {
    id: 'veneer',
    image: veneer,
    title: 'Шпон ореха',
    note: 'Продолжающийся рисунок волокон и врезная ручка по кромке',
    project: 'bolshaya-kuhnya-v-dome',
    projectTitle: 'Большая кухня в частном доме',
    alt: 'Фасад из шпона ореха с непрерывным рисунком волокон и врезной ручкой',
  },
  {
    id: 'lacquer',
    image: lacquer,
    title: 'Матовая эмаль',
    note: 'Бархатистая поверхность и чистая кромка на стыке фасадов',
    project: 'kuhnya-gostinaya-s-ostrovom',
    projectTitle: 'Кухня-гостиная с островом',
    alt: 'Матовая эмаль на фасаде: бархатистая поверхность и тонкий теневой зазор',
  },
  {
    id: 'fluted-glass',
    image: flutedGlass,
    title: 'Рифлёное стекло в рамке',
    note: 'Видно, что внутри что-то есть, но не видно, что именно',
    project: 'uglovaya-kuhnya-do-potolka',
    projectTitle: 'Угловая кухня до потолка',
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
  {
    id: 'tver-handle',
    image: tverHandle,
    title: 'Зазор 4 мм и ручка по центру',
    note: 'Заводской допуск фабрики — один и тот же шов по всей кухне',
    project: 'uglovaya-kuhnya-gribnoy-mat',
    projectTitle: 'Угловая кухня в грибном матовом тоне',
    alt: 'Два фасада ящиков крупным планом: ровный теневой зазор и две одинаковые чёрные ручки на одной линии',
  },
  {
    id: 'tver-drawer',
    image: tverDrawer,
    title: 'Ящик с доводчиком и лотком',
    note: 'Металлический бок, скрытые направляющие, лоток под приборы',
    project: 'uglovaya-kuhnya-gribnoy-mat',
    projectTitle: 'Угловая кухня в грибном матовом тоне',
    alt: 'Полностью выдвинутый кухонный ящик с деревянным лотком для столовых приборов',
  },
  {
    id: 'tver-sink',
    image: tverSink,
    title: 'Мойка под столешницу у окна',
    note: 'Подстольный монтаж: крошки сметаются прямо в чашу',
    project: 'uglovaya-kuhnya-gribnoy-mat',
    projectTitle: 'Угловая кухня в грибном матовом тоне',
    alt: 'Чёрная мойка, встроенная под серую столешницу у окна, со смесителем по центру чаши',
  },
  {
    id: 'tver-column',
    image: tverColumn,
    title: 'Колонна с духовкой и СВЧ',
    note: 'Приборы в одну вертикаль, одинаковый отступ по периметру',
    project: 'uglovaya-kuhnya-gribnoy-mat',
    projectTitle: 'Угловая кухня в грибном матовом тоне',
    alt: 'Кухонная колонна: компактная СВЧ над духовым шкафом, вертикальные чёрные ручки на дверях',
  },
  {
    id: 'p01-gola',
    image: p01Gola,
    title: 'Латунный профиль вместо ручки',
    note: 'Зазор 4 мм по всей длине — одна линия на весь фронт',
    project: 'kuhnya-v-nishe-latun',
    projectTitle: 'Прямая кухня в нише с латунью',
    alt: 'Латунный профиль-ручка между двумя фасадами ящиков под каменной столешницей',
  },
  {
    id: 'p01-stone',
    image: p01Stone,
    title: 'Камень встык с деревом',
    note: 'Шов без герметика и накладной планки',
    project: 'kuhnya-v-nishe-latun',
    projectTitle: 'Прямая кухня в нише с латунью',
    alt: 'Торец каменной столешницы в месте стыка с деревянной панелью ниши',
  },
  {
    id: 'p01-hood',
    image: p01Hood,
    title: 'Латунный цилиндр над варочной',
    note: 'По центру панели, 700 мм над столешницей',
    project: 'kuhnya-v-nishe-latun',
    projectTitle: 'Прямая кухня в нише с латунью',
    alt: 'Цилиндрическая вытяжка из латуни снизу, на фоне деревянной стеновой панели',
  },
  {
    id: 'p01-oven',
    image: p01Oven,
    title: 'Колонна с двумя духовыми шкафами',
    note: 'Приборы точно в проёме, отступ одинаковый по кругу',
    project: 'kuhnya-v-nishe-latun',
    projectTitle: 'Прямая кухня в нише с латунью',
    alt: 'Высокая колонна со встроенными чёрными духовыми шкафами и матовыми фасадами',
  },
  {
    id: 'p02-bar',
    image: p02Bar,
    title: 'Дубовая плита на каменной столешнице',
    note: 'Ступень 40 мм: обед отделён от рабочей зоны',
    project: 'kuhnya-gostinaya-s-ostrovom',
    projectTitle: 'Кухня-гостиная с островом',
    alt: 'Стык толстой дубовой барной плиты и тёмной каменной столешницы острова',
  },
  {
    id: 'p02-sink',
    image: p02Sink,
    title: 'Мойка под камень',
    note: 'Смеситель стоит по центру чаши, борт спрятан под столешницу',
    project: 'kuhnya-gostinaya-s-ostrovom',
    projectTitle: 'Кухня-гостиная с островом',
    alt: 'Чёрная мойка подстольного монтажа в тёмной каменной столешнице с матовым чёрным смесителем',
  },
  {
    id: 'p02-gap',
    image: p02Gap,
    title: 'Фасады без единой ручки',
    note: 'Нажимное открывание, вертикальный зазор 4 мм',
    project: 'kuhnya-gostinaya-s-ostrovom',
    projectTitle: 'Кухня-гостиная с островом',
    alt: 'Угол острова: матовые бежевые фасады без ручек с ровными теневыми зазорами',
  },
  {
    id: 'p02-light',
    image: p02Light,
    title: 'Вытяжка убрана в потолок',
    note: 'Над островом не висит ничего — вид на комнату открыт',
    project: 'kuhnya-gostinaya-s-ostrovom',
    projectTitle: 'Кухня-гостиная с островом',
    alt: 'Встроенная в потолок вытяжка рядом с чёрным трековым светильником и линейной подсветкой',
  },
  {
    id: 'p03-reeded',
    image: p03Reeded,
    title: 'Рейка, которая не сбивается',
    note: 'Рисунок продолжается через зазор между фасадами',
    project: 'kompaktnaya-kuhnya-zelenye-reyki',
    projectTitle: 'Компактная кухня с зелёными рейками',
    alt: 'Крупный план зелёных рифлёных фасадов: вертикальные рейки совпадают на соседних фасадах',
  },
];

export const getDetail = (id: string) => details.find((d) => d.id === id);

export const getDetailsFor = (ids: readonly string[]) =>
  ids.map(getDetail).filter((d): d is Detail => Boolean(d));

export const featuredDetails = details.slice(0, 8);
