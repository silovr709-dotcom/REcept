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

/**
 * ИЛЛЮСТРАЦИИ МАТЕРИАЛОВ
 * ======================
 *
 * ВНИМАНИЕ. Это НЕ фотографии наших работ.
 * Это студийные изображения материалов и фактур: как выглядит шпон, эмаль,
 * рифлёное стекло, камень, профиль-ручка, скрытая подсветка.
 *
 * Они нужны там, где нужно показать сам материал крупно и одинаково
 * ровным светом — на общих планах объектов этого не видно.
 *
 * Показываются только на странице «Материалы» и всегда с подписью
 * о том, что это образцы, а не объекты. В портфолио, отзывах и везде,
 * где речь о выполненных проектах, используются исключительно реальные
 * фотографии из public/images/kitchens и public/images/details.
 */

export type Texture = {
  id: string;
  image: StaticImageData;
  title: string;
  note: string;
  alt: string;
};

export const textures: Texture[] = [
  {
    id: 'lacquer',
    image: lacquer,
    title: 'Матовая эмаль',
    note: 'Бархатистая поверхность и чистая кромка на стыке фасадов',
    alt: 'Образец матовой эмали на фасаде: бархатистая поверхность и тонкий теневой зазор между панелями',
  },
  {
    id: 'veneer',
    image: veneer,
    title: 'Шпон ореха',
    note: 'Продолжающийся рисунок волокон и врезная ручка по кромке',
    alt: 'Образец фасада из шпона ореха с непрерывным рисунком волокон и врезной ручкой',
  },
  {
    id: 'reeded',
    image: reeded,
    title: 'Рифлёный фасад',
    note: 'Рельеф вместо декора: свет сам рисует ритм',
    alt: 'Образец рифлёного фасада в глубоком приглушённом зелёном с вертикальными рёбрами',
  },
  {
    id: 'stone',
    image: stone,
    title: 'Камень столешницы',
    note: 'Матовая поверхность, запил кромки, врезная мойка',
    alt: 'Образец столешницы из камня с матовой поверхностью и аккуратным запилом кромки',
  },
  {
    id: 'wood-stone',
    image: woodStone,
    title: 'Дерево и камень рядом',
    note: 'Стык двух материалов — место, где видно точность',
    alt: 'Образец стыка деревянной и каменной столешниц',
  },
  {
    id: 'brass',
    image: brass,
    title: 'Профиль-ручка',
    note: 'Ящик открывается без единой выступающей детали',
    alt: 'Образец профиль-ручки из латуни, утопленной в верхнюю кромку фасада',
  },
  {
    id: 'fluted-glass',
    image: flutedGlass,
    title: 'Рифлёное стекло',
    note: 'Видно, что внутри что-то есть, но не видно, что именно',
    alt: 'Образец дверцы с рифлёным стеклом в тонкой чёрной рамке и тёплой подсветкой внутри',
  },
  {
    id: 'hardware',
    image: hardware,
    title: 'Наполнение и фурнитура',
    note: 'Направляющие с доводчиком и разделители из дуба',
    alt: 'Образец выдвижного ящика с дубовыми разделителями и направляющей с доводчиком',
  },
  {
    id: 'light',
    image: light,
    title: 'Скрытая подсветка',
    note: 'Свет спрятан под корпусом и не бьёт в глаза',
    alt: 'Образец тёплой линейной подсветки, спрятанной под навесным шкафом',
  },
  {
    id: 'edge',
    image: edge,
    title: 'Зазоры и примыкания',
    note: 'Ровная тонкая линия — признак точной сборки',
    alt: 'Образец ровного теневого зазора между двумя матовыми фасадами',
  },
];
