import Image from 'next/image';
import Link from 'next/link';
import { CtaButton } from '../CtaButton';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { RenderBadge } from '../ui/RenderBadge';
import { getVisibleDetails } from '@/lib/content/store';
import type { DetailItem } from '@/lib/content/types';
import {
  assetUrl,
  fitRatio,
  isIllustrativeProjectDetail,
} from '@/lib/content/images';

/**
 * ДЕТАЛИ.
 * Общий план показывает, что кухня красивая. Деталь показывает, что она
 * сделана под конкретное помещение: профиль, кромка, стык, подсветка, фактура.
 * Именно это отличает мебель на заказ от коробки из магазина.
 *
 * Фото готовых работ и иллюстрации отдельных проектных решений здесь
 * различаются прямо на кадре: крупные планы с меткой «Визуализация»
 * показывают идею и отделку, а не снимок с объекта.
 */

/**
 * Пропорции плиток.
 *
 * Ритм в сетке нужен, но раньше он был жёстко прошит: каждая вторая
 * плитка — 4:5, и в неё насильно загонялся горизонтальный кадр 3:2.
 * Почти половина фотографии уезжала за край — профиль-ручка или
 * стык фактур, то есть ровно то, ради чего кадр и сняли.
 *
 * Теперь пропорция подбирается под сам файл: вертикальный кадр
 * получает вертикальную плитку, горизонтальный — горизонтальную.
 * Ритм остаётся, потому что кадры в каталоге разные, а обрезка
 * падает с 47 % до ~10 %. И это само собой учтёт новые фотографии,
 * которые добавят в папку позже.
 */
const wishlist = ['aspect-4/5', 'aspect-square', 'aspect-square', 'aspect-4/5'];

/**
 * Крупная плитка.
 *
 * Все восемь изображений одного размера читались как ровный коврик:
 * глазу не за что зацепиться, и крупные детали решений терялись.
 * Поэтому каждая пятая плитка занимает две колонки: получается
 * ритм «крупное — мелкое», в котором лучше читаются фактура и замысел.
 *
 * Работает только когда плиток хотя бы шесть: на четырёх крупная
 * оставила бы в строке дырку.
 */
const isFeature = (index: number, total: number) =>
  total >= 6 && index % 5 === 0;

export async function Details({
  index,
  tone = 'cream',
  items,
  eyebrow = 'Детали',
  title = 'Индивидуальная мебель видна в мелочах',
  lead = 'Профиль-ручка вместо накладной, кромка столешницы, стык фактур, свет под корпусом, рифлёное стекло вместо прозрачного. Это нельзя купить готовым — это проектируется под конкретную кухню.',
  footnote = 'Нажмите на любой кадр, чтобы посмотреть проект целиком.',
  showCta = true,
  columns = 4,
  limit,
  frame,
  spread = false,
  pick,
}: {
  index?: string;
  tone?: 'cream' | 'bone';
  items?: DetailItem[];
  eyebrow?: string;
  title?: string;
  lead?: string;
  footnote?: string;
  showCta?: boolean;
  columns?: 3 | 4;
  limit?: number;
  /**
   * Общая рамка для всех плиток: в короткой строке из трёх изображений
   * разная высота читается как брак вёрстки, а не как замысел.
   * fitRatio всё равно откажется от рамки, если она съест больше трети кадра.
   */
  frame?: string;
  /**
   * Брать детали из разных проектов.
   * Без этого короткий список — это три кадра одной кухни подряд,
   * и вместо «вот сколько мы умеем» получается «вот одна кухня».
   */
  spread?: boolean;
  /**
   * Явный список деталей по id — когда важен не только разный проект,
   * но и разный сюжет: два похожих кадра рядом выглядят как повтор,
   * даже если это разные кухни.
   */
  pick?: string[];
}) {
  const all = await getVisibleDetails();

  /*
   * Короткая строка на главной.
   *
   * `spread` берёт детали из разных проектов: три кадра одной кухни подряд
   * читаются как «у нас одна кухня», а не как «вот сколько мы умеем».
   *
   * Если задана общая рамка, сначала отбираем изображения, которые в неё
   * действительно влезают: иллюстрации деталей имеют разные пропорции,
   * и вертикальный кадр в горизонтальной рамке либо обрежется наполовину,
   * либо выпадет из общей высоты и разломает строку.
   */
  const fits = frame ? all.filter((d) => fitRatio(d.image, frame) === frame) : all;
  const byProject = (source: typeof all) =>
    source.filter(
      (d, i, arr) => arr.findIndex((x) => x.project === d.project) === i,
    );
  const pool = spread
    ? [...byProject(fits), ...byProject(all)].filter(
        (d, i, arr) => arr.findIndex((x) => x.id === d.id) === i,
      )
    : all;
  const picked = pick
    ? (pick.map((id) => all.find((d) => d.id === id)).filter(Boolean) as typeof all)
    : null;
  const list = items ?? (picked?.length ? picked : pool.slice(0, limit ?? 6));
  if (list.length === 0) return null;

  /*
    Телефон. Две колонки превращали макросъёмку в почтовые марки
    шириной 160 px: именно та фактура, ради которой кадр и снимали,
    переставала читаться. Короткая подборка (до четырёх кадров)
    разворачивается в одну колонку во всю ширину экрана, длинная
    остаётся в двух — иначе страница материалов не кончится никогда.
  */
  const narrow = list.length <= 4;
  const mobileCols = narrow ? 'grid-cols-1 min-[560px]:grid-cols-2' : 'grid-cols-2';
  const cols =
    columns === 3
      ? `${mobileCols} lg:grid-cols-3`
      : `${mobileCols} lg:grid-cols-4`;
  const sizes =
    columns === 3
      ? narrow
        ? '(max-width: 559px) 92vw, (max-width: 1023px) 46vw, 30vw'
        : '(max-width: 639px) 46vw, (max-width: 1023px) 46vw, 30vw'
      : narrow
        ? '(max-width: 559px) 92vw, (max-width: 1023px) 46vw, 22vw'
        : '(max-width: 639px) 46vw, (max-width: 1023px) 46vw, 22vw';
  const bigSizes =
    columns === 3
      ? '(max-width: 1023px) 94vw, 60vw'
      : '(max-width: 1023px) 94vw, 45vw';

  return (
    <Section tone={tone} id="detali" aria-labelledby="details-title">
      <div className="container-page">
        <SectionHeading
          index={index}
          id="details-title"
          eyebrow={eyebrow}
          title={title}
          lead={lead}
        />

        {list.some((detail) => isIllustrativeProjectDetail(detail.image)) ? (
          <p className="mt-5 max-w-3xl border-l-2 border-gold/60 pl-4 text-small leading-relaxed text-stone">
            Крупные планы с плашкой «Визуализация» показывают проектные решения и отделку, а не фотографии с объекта.
          </p>
        ) : null}

        <ul className={`mt-10 grid gap-x-5 gap-y-10 sm:mt-14 sm:gap-x-8 sm:gap-y-12 lg:mt-24 ${cols}`}>
          {list.map((d, i) => {
            const big = isFeature(i, list.length);
            /*
             * Сетка из двух колонок и нечётное число плиток оставляли
             * последний кадр висеть половинкой строки. Пусть он займёт
             * строку целиком: до больших экранов это читается как
             * намеренный крупный план, а не как забытая ячейка.
             */
            const fillsRow =
              !big &&
              list.length % 2 === 1 &&
              i === list.length - 1 &&
              list.length < 6;
            return (
            <li
              key={d.id}
              className={
                big
                  ? narrow
                    ? 'min-[560px]:col-span-2'
                    : 'col-span-2'
                  : fillsRow
                    ? narrow
                      ? 'min-[560px]:col-span-2 lg:col-span-1'
                      : 'col-span-2 lg:col-span-1'
                    : undefined
              }
            >
              <Reveal delay={Math.min(i, 5) * 40}>
                <Link href={`/portfolio/${d.project}`} className="group block">
                  <div
                    className={`media-reveal relative overflow-hidden rounded-md bg-sand ${fitRatio(
                      d.image,
                      big
                        ? 'aspect-3/2'
                        : (frame ?? (narrow ? 'aspect-3/2' : wishlist[i % wishlist.length])),
                    )}`}
                  >
                    <Image
                      src={assetUrl(d.image.src)}
                      alt={
                        isIllustrativeProjectDetail(d.image)
                          ? `Иллюстрация. ${d.alt}`
                          : d.alt
                      }
                      fill
                      loading="lazy"
                      sizes={big ? bigSizes : sizes}
                      placeholder={d.image.blurDataURL ? 'blur' : 'empty'}
                      blurDataURL={d.image.blurDataURL || undefined}
                      className="photo-calm object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                    />
                    {isIllustrativeProjectDetail(d.image) ? (
                      <RenderBadge label="Визуализация" />
                    ) : null}
                  </div>
                  {/* Подпись набрана как подпись к иллюстрации: линия,
                      название антиквой, пояснение мелким кеглем. Тот же
                      приём, что и у карточек работ, — страница держится
                      на одном правиле, а не на трёх разных. */}
                  <p
                    className={`font-display mt-3 border-t border-line pt-3 leading-snug text-ink transition-colors group-hover:text-gold ${
                      big ? 'text-big' : 'text-big'
                    }`}
                  >
                    {d.title}
                  </p>
                  <p className="mt-1.5 text-small leading-snug text-stone">
                    {d.note}
                  </p>
                </Link>
              </Reveal>
            </li>
            );
          })}
        </ul>

        {showCta ? (
          <Reveal className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-stone">{footnote}</p>
            <CtaButton
              source="details"
              variant="primary"
              size="md"
              withArrow
              className="shrink-0 max-sm:w-full"
              modalTitle="Покажем образцы вживую"
              modalLead="Фактуру, металл и кромку лучше один раз потрогать. Договоримся о встрече — привезём образцы и посмотрим их при вашем свете."
              submitLabel="Посмотреть образцы"
            >
              Посмотреть образцы вживую
            </CtaButton>
          </Reveal>
        ) : null}
      </div>
    </Section>
  );
}
