import type { Metadata } from 'next';
import { Hero } from '@/components/sections/Hero';
import { Headache } from '@/components/sections/Headache';
import { Services } from '@/components/sections/Services';
import { PortfolioPreview } from '@/components/sections/PortfolioPreview';
import { Process } from '@/components/sections/Process';
import { Timing } from '@/components/sections/Timing';
import { Advantages } from '@/components/sections/Advantages';
import { Price } from '@/components/sections/Price';
import { Founders } from '@/components/sections/Founders';
import { Objections } from '@/components/sections/Objections';
import { Testimonials } from '@/components/sections/Testimonials';
import { Faq } from '@/components/sections/Faq';
import { FinalCta } from '@/components/sections/FinalCta';
import { FaqJsonLd } from '@/components/JsonLd';

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
      <Services />
      <PortfolioPreview />
      <Process />
      <Timing />
      <Advantages />
      <Price />
      <Founders />
      <Objections />
      <Testimonials />
      <Faq />
      <FinalCta />
      <FaqJsonLd />
    </>
  );
}
