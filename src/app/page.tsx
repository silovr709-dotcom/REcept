import type { Metadata } from 'next';
import { Hero } from '@/components/sections/Hero';
import { Headache } from '@/components/sections/Headache';
import { Services } from '@/components/sections/Services';
import { PortfolioPreview } from '@/components/sections/PortfolioPreview';
import { Details } from '@/components/sections/Details';
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
import bandHouse from '@public/images/kitchens/kitchen-05.webp';
import bandClassic from '@public/images/kitchens/kitchen-06.webp';

export const metadata: Metadata = {
  title: 'Кухни на заказ в Твери — мебельное ателье «РЕцепт»',
  description:
    'Кухни на заказ в Твери от семейного ателье «РЕцепт». Роберт и Катя лично ведут проект: замер, бесплатное проектирование и схемы электрики, производство, доставка и сборка. Гарантия 24 месяца, оплата 50/50.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Headache />

      <PhotoBand
        image={bandHouse}
        alt="Кухня на заказ в частном доме под Тверью: светло-серые фасады, шкафы в тёмной древесной текстуре, витрины с подсветкой"
        overlay="quote"
        caption="Хорошая кухня — та, о которой вы перестаёте думать. Всё лежит там, где удобно, и ничего не мешает."
      />

      <Services />
      <PortfolioPreview />
      <Details tone="cream" />
      <Process tone="bone" />
      <Timing tone="cream" />
      <Advantages tone="bone" />

      <PhotoBand
        image={bandClassic}
        alt="Кухня в стиле неоклассики от ателье «РЕцепт»: фасады цвета грейж с фрезеровкой, рифлёные вставки и витрины с подсветкой"
        overlay="quote"
        caption="Мы делаем не «кухонный гарнитур», а мебель под конкретное помещение, конкретную технику и конкретных людей."
      />

      <Price tone="cream" />
      <Founders />
      <Objections tone="bone" />
      <Testimonials tone="cream" />
      <Faq />
      <FinalCta />
      <FaqJsonLd />
    </>
  );
}
