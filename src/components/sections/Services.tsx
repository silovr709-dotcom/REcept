import Link from 'next/link';
import Image from 'next/image';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { getContent, getVisibleProjects } from '@/lib/content/store';
import { pickImage } from '@/lib/content/images';

export async function Services({ compact = false }: { compact?: boolean }) {
  const [{ services }, projects] = await Promise.all([
    getContent('texts'),
    getVisibleProjects(),
  ]);
  const shot = pickImage(projects, 'uglovaya-kuhnya-do-potolka', 6);

  // Компактный вид: на главной этот блок дублировал меню и съедал экран.
  // Оставляем суть одной строкой и ссылками на разделы.
  if (compact) {
    return (
      <Section tone="cream" aria-labelledby="services-title">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
            <SectionHeading
              id="services-title"
              eyebrow="Что мы делаем"
              title="Кухни — основное. Но не единственное"
              lead="Чаще всего к нам приходят за кухней, а уезжаем мы с объекта, сделав ещё гардеробную и шкаф в прихожей. В одной стилистике и с одной ответственностью."
            />
            <ul className="flex flex-wrap gap-2.5">
              {services.map((s) => (
                <li key={s.id}>
                  <Link
                    href={s.href}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-bone px-4 py-2.5 text-[0.9375rem] text-ink transition-colors hover:border-brass/50 hover:text-brass"
                  >
                    {s.title}
                    <span aria-hidden="true" className="text-brass">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section tone="cream" aria-labelledby="services-title">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
          {shot ? (
            <Reveal>
              <div className="relative aspect-4/5 overflow-hidden rounded-lg bg-sand sm:aspect-16/10 lg:aspect-4/5">
                <Image
                  src={shot.image.src}
                  alt={shot.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 1023px) 100vw, 42vw"
                  placeholder={shot.image.blurDataURL ? 'blur' : 'empty'}
                  blurDataURL={shot.image.blurDataURL || undefined}
                  className="object-cover"
                />
              </div>
            </Reveal>
          ) : null}

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
