import type { Metadata } from 'next';
import { Hero } from '@/components/sections/Hero';
import { Headache } from '@/components/sections/Headache';
import { Services } from '@/components/sections/Services';
import { PortfolioPreview } from '@/components/sections/PortfolioPreview';
import { Details } from '@/components/sections/Details';
import { VideoWall } from '@/components/sections/VideoWall';
import { Process } from '@/components/sections/Process';
import { Timing } from '@/components/sections/Timing';
import { Advantages } from '@/components/sections/Advantages';
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
    title: site.metaTitle,
    description: site.metaDescription,
    alternates: { canonical: '/' },
  };
}

export default async function HomePage() {
  const projects = await getVisibleProjects();
  const bandHouse = pickImage(projects, 'bolshaya-kuhnya-v-dome', 4);
  const bandClassic = pickImage(projects, 'kuhnya-neoklassika-greyzh', 5);

  return (
    <>
      <Hero />
      <Headache />

      {bandHouse ? (
        <PhotoBand
          image={bandHouse.image}
          alt={bandHouse.alt}
          overlay="quote"
          caption="Хорошая кухня — та, о которой вы перестаёте думать. Всё лежит там, где удобно, и ничего не мешает."
        />
      ) : null}

      <Services />
      <PortfolioPreview />
      <Details tone="cream" />
      <VideoWall />
      <Testimonials tone="cream" />
      <Process tone="bone" />
      <Timing tone="cream" />
      <Advantages tone="bone" />

      {bandClassic ? (
        <PhotoBand
          image={bandClassic.image}
          alt={bandClassic.alt}
          overlay="quote"
          caption="Мы делаем не «кухонный гарнитур», а мебель под конкретное помещение, конкретную технику и конкретных людей."
        />
      ) : null}

      <Price tone="cream" />
      <Founders />
      <Objections tone="bone" />
      <Faq />
      <FinalCta />
      <FaqJsonLd />
    </>
  );
}
