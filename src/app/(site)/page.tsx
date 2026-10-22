import type { Metadata } from 'next';
import { Hero } from '@/components/sections/Hero';
import { Headache } from '@/components/sections/Headache';
import { Services } from '@/components/sections/Services';
import { PortfolioPreview } from '@/components/sections/PortfolioPreview';
import { Details } from '@/components/sections/Details';
import { Suppliers } from '@/components/sections/Suppliers';
import { Process } from '@/components/sections/Process';
import { Price } from '@/components/sections/Price';
import { Brief } from '@/components/sections/Brief';
import { Founders } from '@/components/sections/Founders';
import { Testimonials } from '@/components/sections/Testimonials';
import { Faq } from '@/components/sections/Faq';
import { FinalCta } from '@/components/sections/FinalCta';
import { PhotoBand } from '@/components/PhotoBand';
import { FaqJsonLd } from '@/components/JsonLd';
import { getVisibleProjects } from '@/lib/content/store';
import { getSiteView } from '@/lib/content/view';
import { pickImage } from '@/lib/content/images';
import { teamShots, teamShotAlt } from '@/data/team-shots';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteView();
  return {
    // absolute — иначе к заголовку приклеится ещё и шаблон из корневого layout
    title: { absolute: site.metaTitle },
    description: site.metaDescription,
    alternates: { canonical: '/' },
  };
}

/**
 * ПОСАДОЧНАЯ СТРАНИЦА
 * ===================
 * Порядок подчинён одному пути: внимание → доверие → снятие страха →
 * обращение. Раньше страница пыталась быть ещё и каталогом: на ней
 * лежали все восемнадцать проектов, сроки, преимущества и подробный
 * процесс — к середине человек уставал раньше, чем доходил до формы.
 *
 * Теперь на посадочной только то, что двигает к разговору. Подробности
 * никуда не делись: полный процесс и сроки — на странице кухонь, все
 * проекты — в портфолио, все отзывы — на своей странице.
 */
export default async function HomePage() {
  const projects = await getVisibleProjects();
  const bandClassic = pickImage(projects, 'kuhnya-neoklassika-greyzh', 5);
  /*
    Самый длинный текстовый перегон страницы — отзывы, возражения и
    зачёркнутые штампы подряд. Между ним и вопросами нужна пауза,
    на которой глаз отдыхает и вспоминает, ради чего он всё это читает.
  */
  const bandBeforeFaq = pickImage(projects, 'kuhnya-gostinaya-s-ostrovom', 1);

  return (
    <>
      <Hero />

      {/* Сайт личного бренда: люди идут сразу за первым экраном,
          раньше услуг, портфолио и любых объяснений */}
      <Founders index="01" />

      <Headache index="02" />

      {/* Сразу после блока про головную боль — тот, кто её на себя
          забирает. Кухня здесь была бы красивее, но слабее: обещание
          «мы разберёмся с вашими подрядчиками» подтверждает человек
          с чертежом и телефоном, а не фасады */}
      <PhotoBand
        image={teamShots.robertSite}
        alt={teamShotAlt.robertSite}
        overlay="quote"
        height="lg"
        /* На полосе 3:1 центр кадра приходится на грудь, и голову
           срезало по самые брови. Привязка к верхней трети */
        objectPosition="object-[50%_22%]"
        caption="Эти звонки — прорабу, электрику, сборщикам — Роберт делает сам. Это и есть та головная боль, которую мы забираем."
      />

      {/* Визуальное доказательство */}
      <Services index="03" compact />
      {/* Четыре работы вместо шести: редакционная сетка 7+5 / 5+7 остаётся
          целой, а пять экранов пролистывания превращаются в три. Все девять
          кухонь лежат в портфолио, ссылка на него — тут же */}
      <PortfolioPreview index="04" limit={4} />
      {/* На главной — три детали; весь набор живёт в портфолио и на странице кухонь */}
      <Details index="05" tone="cream" limit={3} />

      {/* Сразу за фактурами — названия. Фотография фасада показывает,
          как это выглядит; строчка «Увадрев · Ламарти · Egger»
          показывает, из чего это сделано. Второе проверяется, и
          именно поэтому его стоит сказать вслух на главной, а не
          прятать на отдельной странице. */}
      <Suppliers tone="bone" variant="compact" />

      {/* Как это устроено и сколько стоит */}
      <Process index="06" tone="cream" limit={5} />
      <Price index="07" tone="bone" />

      {/* Сразу после цены: вопрос «а сколько у меня» уже возник,
          и вместо формы «имя и телефон» человеку предлагается
          самое дешёвое действие — рассказать про свою кухню */}
      <Brief index="08" tone="bone" />

      {bandClassic ? (
        <PhotoBand
          image={bandClassic.image}
          alt={bandClassic.alt}
          overlay="quote"
          caption="Мы делаем не «кухонный гарнитур», а мебель под конкретное помещение, конкретную технику и конкретных людей."
        />
      ) : null}

      {/*
        Доверие и остаточные сомнения.

        Раньше здесь шли подряд «Отзывы» + «Возражения» + «Клише»:
        три блока почти на 8 500 пикселей, то есть десять экранов телефона
        между фотолентой и вопросами. Мы измерили главную на 390 px —
        она была 38 600 пикселей, 46 экранов, и до финального призыва
        дочитывали единицы.

        Теперь «Возражения» живут на странице «О нас», где они и были
        продублированы, «Клише» переехали туда же, а здесь остались отзывы.
        Ни один текст не потерян — изменился только порядок чтения.
      */}
      <Testimonials index="09" tone="cream" />

      {bandBeforeFaq ? (
        <PhotoBand
          image={bandBeforeFaq.image}
          alt={bandBeforeFaq.alt}
          height="md"
        />
      ) : null}

      <Faq index="10" limit={6} tone="cream" />

      <FinalCta />
      {/* Столько же вопросов, сколько видно в блоке выше */}
      <FaqJsonLd limit={6} />
    </>
  );
}
