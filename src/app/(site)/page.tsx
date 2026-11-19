import type { Metadata } from 'next';
import { Advantages } from '@/components/sections/Advantages';
import { Brief } from '@/components/sections/Brief';
import { Details } from '@/components/sections/Details';
import { Faq } from '@/components/sections/Faq';
import { FinalCta } from '@/components/sections/FinalCta';
import { Founders } from '@/components/sections/Founders';
import { Headache } from '@/components/sections/Headache';
import { Hero } from '@/components/sections/Hero';
import { PortfolioPreview } from '@/components/sections/PortfolioPreview';
import { Price } from '@/components/sections/Price';
import { Process } from '@/components/sections/Process';
import { Services } from '@/components/sections/Services';
import { Suppliers } from '@/components/sections/Suppliers';
import { Testimonials } from '@/components/sections/Testimonials';
import { PhotoBand } from '@/components/PhotoBand';
import { FaqJsonLd } from '@/components/JsonLd';
import { getVisibleProjects } from '@/lib/content/store';
import { getSiteView } from '@/lib/content/view';
import { pickImage } from '@/lib/content/images';
import { teamShots, teamShotAlt } from '@/data/team-shots';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteView();
  return {
    title: { absolute: site.metaTitle },
    description: site.metaDescription,
    alternates: { canonical: '/' },
  };
}

/**
 * Главная ведёт по воронке без лишних кругов:
 * предложение и действие → понятный процесс → причины выбрать нас →
 * ранний расчёт → подход и доказательства → ответы на сомнения → заявка.
 */
export default async function HomePage() {
  const projects = await getVisibleProjects();
  const bandClassic = pickImage(projects, 'kuhnya-neoklassika-greyzh', 5);
  const bandBeforeFaq = pickImage(projects, 'kuhnya-gostinaya-s-ostrovom', 1);

  return (
    <>
      {/* Кто мы, что обещаем и как с нами связаться — сразу, без поиска. */}
      <Hero />

      {/* Сначала снимаем неопределённость: показываем весь путь в пяти этапах. */}
      <Process index="01" tone="cream" overview />

      {/* Сразу после процесса — конкретные причины выбрать ателье. */}
      <Advantages index="02" tone="bone" />

      {/* Высоко на странице — короткий путь к персональному расчёту. */}
      <Brief index="03" tone="cream" />

      {/* Наш подход: клиенту не нужно координировать подрядчиков самому. */}
      <Headache index="04" />
      <PhotoBand
        image={teamShots.robertSite}
        alt={teamShotAlt.robertSite}
        overlay="quote"
        height="lg"
        objectPosition="object-[50%_22%]"
        caption="Звонки прорабу, электрику и сборщикам Роберт делает сам — клиенту не приходится быть посредником."
      />
      <Founders index="05" />

      {/* После обещаний — подтверждение реальными проектами и деталями. */}
      <PortfolioPreview index="06" limit={4} />
      <Details
        index="07"
        tone="cream"
        limit={3}
        columns={3}
        frame="aspect-4/3"
        spread
        pick={['p01-profile', 'p08-flutes', 'p06-vitrine']}
      />
      {bandClassic ? (
        <PhotoBand
          image={bandClassic.image}
          alt={bandClassic.alt}
          overlay="quote"
          reveal="doors"
          caption="Мы делаем не «кухонный гарнитур», а мебель под конкретное помещение, технику и людей."
        />
      ) : null}
      <Suppliers tone="ink" variant="compact" />
      <Services index="08" compact />

      {/* Социальное доказательство предшествует объяснению цены. */}
      <Testimonials index="09" tone="cream" />
      <Price index="10" tone="bone" />

      {bandBeforeFaq ? (
        <PhotoBand
          image={bandBeforeFaq.image}
          alt={bandBeforeFaq.alt}
          height="md"
        />
      ) : null}

      {/* Закрываем последние сомнения и сразу даём простую форму заявки. */}
      <Faq index="11" limit={6} tone="bone" />
      <FinalCta />
      <FaqJsonLd limit={6} />
    </>
  );
}
