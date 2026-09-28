import type { Metadata } from 'next';
import { Hero } from '@/components/sections/Hero';
import { Headache } from '@/components/sections/Headache';
import { Services } from '@/components/sections/Services';
import { PortfolioPreview } from '@/components/sections/PortfolioPreview';
import { Details } from '@/components/sections/Details';
import { Process } from '@/components/sections/Process';
import { Price } from '@/components/sections/Price';
import { Founders } from '@/components/sections/Founders';
import { Objections } from '@/components/sections/Objections';
import { Testimonials } from '@/components/sections/Testimonials';
import { Faq } from '@/components/sections/Faq';
import { FinalCta } from '@/components/sections/FinalCta';
import { PhotoBand } from '@/components/PhotoBand';
import { FaqJsonLd } from '@/components/JsonLd';
import { getVisibleProjects } from '@/lib/content/store';
import { getSiteView } from '@/lib/content/view';
import { pickImage } from '@/lib/content/images';

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
  const bandHouse = pickImage(projects, 'kuhnya-gostinaya-v-dvuh-tonah', 4);
  const bandClassic = pickImage(projects, 'chernaya-kuhnya-s-kamnem', 5);

  return (
    <>
      <Hero />

      {/* 01 — зачем мы нужны: главная боль, ради которой к нам приходят */}
      <Headache />

      {bandHouse ? (
        <PhotoBand
          image={bandHouse.image}
          alt={bandHouse.alt}
          overlay="quote"
          caption="Хорошая кухня — та, о которой вы перестаёте думать. Всё лежит там, где удобно, и ничего не мешает."
        />
      ) : null}

      {/* 02–04 — визуальное доказательство */}
      <Services compact />
      <PortfolioPreview limit={6} />
      <Details tone="cream" limit={4} />

      {/* 05–06 — как это устроено и сколько стоит */}
      <Process tone="bone" limit={5} />
      <Price tone="cream" />

      {bandClassic ? (
        <PhotoBand
          image={bandClassic.image}
          alt={bandClassic.alt}
          overlay="quote"
          caption="Мы делаем не «кухонный гарнитур», а мебель под конкретное помещение, конкретную технику и конкретных людей."
        />
      ) : null}

      {/* 07–09 — доверие и остаточные сомнения */}
      <Founders />
      <Testimonials tone="cream" />
      <Objections tone="bone" />
      <Faq limit={6} tone="cream" />

      <FinalCta />
      {/* Столько же вопросов, сколько видно в блоке выше */}
      <FaqJsonLd limit={6} />
    </>
  );
}
