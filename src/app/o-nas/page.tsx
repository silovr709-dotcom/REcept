import type { Metadata } from 'next';
import { PageHero } from '@/components/PageHero';
import { Founders } from '@/components/sections/Founders';
import { Advantages } from '@/components/sections/Advantages';
import { Objections } from '@/components/sections/Objections';
import { Testimonials } from '@/components/sections/Testimonials';
import { FinalCta } from '@/components/sections/FinalCta';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { PhotoBand } from '@/components/PhotoBand';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import bandIsland from '@public/images/kitchens/kitchen-04.webp';

export const metadata: Metadata = {
  title: 'О нас: семейное мебельное ателье «РЕцепт» в Твери',
  description:
    'РЕцепт — семейное мебельное ателье в Твери. Роберт и Катя ведут каждый проект лично: от замера и проектирования до доставки, сборки и связи после установки. Гарантия 24 месяца.',
  alternates: { canonical: '/o-nas' },
};

const principles = [
  {
    title: 'Мы не продаём кухню, пока не поняли задачу',
    text: 'Сначала разбираемся, как вы живёте и готовите. Иногда в процессе выясняется, что нужна вообще другая планировка — и хорошо, что это выяснилось до производства.',
  },
  {
    title: 'Мы говорим «так делать не стоит», когда так делать не стоит',
    text: 'Даже если этот вариант дороже и нам выгоднее. Кухня остаётся у вас на много лет, а наша репутация в Твери — на ещё дольше.',
  },
  {
    title: 'Мы исправляем свои ошибки',
    text: 'Без поиска виноватых и без разговоров о том, что «так было в проекте». Ошиблись — переделали.',
  },
  {
    title: 'Мы не исчезаем после сборки',
    text: 'Гарантия 24 месяца. Но и после неё телефон, по которому вы с нами общались, продолжает работать.',
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="О нас"
        title="«РЕцепт» — это Роберт и Катя, а не отдел продаж"
        lead="Семейное мебельное ателье в Твери. Мы делаем кухни и корпусную мебель на заказ и ведём каждый проект вдвоём — от первого разговора до сборки."
        breadcrumbs={[{ name: 'О нас' }]}
      />

      <Section tone="bone" aria-labelledby="story-title">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <h2
              id="story-title"
              className="font-display text-h2 text-ink lg:sticky lg:top-28 lg:self-start"
            >
              Почему семейное дело — это другое качество разговора
            </h2>

            <div className="grid gap-6 text-lead text-stone">
              <p>
                В большой мебельной компании у вашей кухни нет одного хозяина.
                Есть менеджер, который принял заказ, конструктор, который его не
                видел, производство, которое читает чертёж, и сборщики, которые
                приехали первый раз. Если что-то пойдёт не так, каждый честно
                скажет: «это не наш участок».
              </p>
              <p>
                У нас участок один — весь. Роберт и Катя сами приезжают на замер,
                сами проектируют, сами согласовывают с вашими мастерами, сами
                привозят и собирают. Это медленнее, чем конвейер, и мы не можем
                вести бесконечное число проектов одновременно. Зато вы всегда
                знаете, кому звонить.
              </p>
              <p>
                И ещё одна простая вещь: следующий заказ к нам приходит от тех,
                кому мы уже что-то сделали, и от их знакомых. В городе размера
                Твери плохо сделанная кухня — это не строчка в отчёте, а
                конкретный человек, с которым вы ещё встретитесь.
              </p>
            </div>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {principles.map((p, i) => (
              <Reveal
                key={p.title}
                delay={Math.min(i, 3) * 50}
                className="rounded-lg border border-line bg-cream p-7 sm:p-8"
              >
                <h3 className="font-display text-[1.1875rem] leading-snug text-ink">
                  {p.title}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-stone">
                  {p.text}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <PhotoBand
        image={bandIsland}
        alt="Графитовая кухня с островом, изготовленная и собранная ателье «РЕцепт» в Твери"
        overlay="quote"
        caption="Каждую кухню в портфолио Роберт и Катя проектировали, привозили и собирали сами."
      />

      <Founders />
      <Advantages tone="cream" />
      <Testimonials tone="cream" />
      <Objections tone="bone" />

      <FinalCta
        title="Познакомимся?"
        lead="Самый простой способ понять, подходим ли мы друг другу, — обсудить вашу задачу. Это бесплатно и ни к чему не обязывает: иногда после разговора мы честно говорим, что в вашем случае лучше обратиться к кому-то другому."
        submitLabel="Написать Роберту и Кате"
        source="about-final"
      />

      <BreadcrumbJsonLd items={[{ name: 'О нас', url: '/o-nas' }]} />
    </>
  );
}
