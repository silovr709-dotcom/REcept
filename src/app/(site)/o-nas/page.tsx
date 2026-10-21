import type { Metadata } from 'next';
import Image from 'next/image';
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
import { getVisibleProjects } from '@/lib/content/store';
import { pickImage } from '@/lib/content/images';
import { teamShots, teamShotAlt } from '@/data/team-shots';
import { assetUrl } from '@/lib/content/images';

export const metadata: Metadata = {
  title: 'О нас',
  description:
    'РЕцепт — семейное мебельное ателье в Твери. Роберт и Катя ведут каждый проект лично: от замера и проекта до доставки и сборки. Гарантия 24 месяца.',
  alternates: { canonical: '/o-nas' },
  openGraph: {
    images: [{ url: '/og-o-nas.jpg', width: 1200, height: 630, alt: 'Роберт и Катя Шиловы — мебельное ателье «РЕцепт»' }],
  },
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

export default async function AboutPage() {
  const projects = await getVisibleProjects();
  const band = pickImage(projects, 'bolshaya-kuhnya-v-dome', 4);

  return (
    <>
      <PageHero
        eyebrow="О нас"
        title="«РЕцепт» — это Роберт и Катя, а не отдел продаж"
        lead="Семейное мебельное ателье в Твери. Мы делаем кухни и корпусную мебель на заказ и ведём каждый проект вдвоём — от первого разговора до сборки."
        breadcrumbs={[{ name: 'О нас' }]}
        image={teamShots.evening}
        imageAlt=""
        imagePosition="object-[50%_35%]"
      />

      <Section tone="bone" aria-labelledby="story-title">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h2 id="story-title" className="font-display-light text-h2 text-ink">
                Почему семейное дело — это другое качество разговора
              </h2>

              {/* Три абзаца про «участок один — весь» рядом с тем, как
                  этот участок выглядит: Катя за проектом вашей кухни */}
              <Reveal className="mt-10">
                <figure className="relative aspect-4/5 overflow-hidden bg-sand">
                  <Image
                    src={assetUrl(teamShots.katyaPlan.src)}
                    alt={teamShotAlt.katyaPlan}
                    fill
                    loading="lazy"
                    sizes="(max-width: 1023px) 100vw, 36vw"
                    placeholder={
                      teamShots.katyaPlan.blurDataURL ? 'blur' : 'empty'
                    }
                    blurDataURL={teamShots.katyaPlan.blurDataURL || undefined}
                    className="object-cover"
                  />
                </figure>
              </Reveal>
            </div>

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

          {/* Правила набраны полосами на волосяных линиях, а не
              карточками в рамке: рамка вокруг каждого абзаца дробит
              разворот на окошки и выглядит как интерфейс. */}
          <div className="mt-14 grid gap-x-14 gap-y-10 sm:grid-cols-2">
            {principles.map((p, i) => (
              <Reveal
                key={p.title}
                delay={Math.min(i, 3) * 50}
                className="border-t border-goldline/45 pt-6"
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

      {/* На странице «О нас» полосу занимает не кухня, а те, про кого
          эта страница: подпись говорит «ведут сами» — значит, видно,
          кто именно */}
      <PhotoBand
        image={teamShots.heroWide}
        alt={teamShotAlt.hero}
        overlay="quote"
        height="lg"
        objectPosition="object-[58%_28%]"
        caption="Каждый проект Роберт и Катя ведут сами — от планировки до сборки на объекте."
      />

      <Founders />
      <Advantages tone="cream" />

      {/* Восемь условий, отзывы и возражения идут подряд — три
          текстовых раздела. Между ними нужен выдох */}
      {band ? (
        <PhotoBand image={band.image} alt={band.alt} height="md" />
      ) : null}

      <Testimonials tone="cream" photoIndex={11} />
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
