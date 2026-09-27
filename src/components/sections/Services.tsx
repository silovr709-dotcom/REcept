import Link from 'next/link';
import Image from 'next/image';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { services } from '@/data/content';
import kitchenShot from '@public/images/kitchens/kitchen-07.webp';

export function Services() {
  return (
    <Section tone="cream" aria-labelledby="services-title">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
          <Reveal>
            <div className="relative aspect-4/5 overflow-hidden rounded-lg bg-sand sm:aspect-16/10 lg:aspect-4/5">
              <Image
                src={kitchenShot}
                alt="Угловая кухня на заказ до потолка, изготовленная ателье «РЕцепт»"
                fill
                loading="lazy"
                sizes="(max-width: 1023px) 100vw, 42vw"
                placeholder="blur"
                className="object-cover"
              />
            </div>
          </Reveal>

          <div>
            <SectionHeading
              id="services-title"
              eyebrow="Что мы делаем"
              title="Кухни — основное. Но не единственное"
              lead="Чаще всего к нам приходят за кухней, а уезжаем мы с объекта, сделав ещё гардеробную и шкаф в прихожей. В одной стилистике, из тех же материалов и с одной ответственностью."
            />

            <ul className="mt-10 grid gap-px overflow-hidden rounded-lg bg-line sm:grid-cols-2">
              {services.map((s, i) => (
                <li key={s.id}>
                  <Link
                    href={s.href}
                    className="group flex h-full flex-col bg-cream p-6 transition-colors hover:bg-bone sm:p-7"
                  >
                    <span className="text-eyebrow font-bold uppercase text-brass">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-display mt-3 text-[1.25rem] text-ink">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-stone">
                      {s.text}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brass">
                      Смотреть направление
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                        className="transition-transform group-hover:translate-x-1"
                      >
                        <path
                          d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}
