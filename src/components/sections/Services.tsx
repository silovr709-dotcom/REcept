import Link from 'next/link';
import Image from 'next/image';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { getContent, getVisibleProjects } from '@/lib/content/store';
import { assetUrl, pickImage, ratioOf } from '@/lib/content/images';
import { rooms } from '@/data/rooms';
import type { ImageRef } from '@/lib/content/types';

/**
 * Кадр под направление. Кухни иллюстрируем проектом, остальные
 * направления — визуализациями соответствующих помещений, которые уже
 * лежат в src/data/rooms.ts. Когда появится своя съёмка, достаточно
 * заменить файлы в public/images/rooms/.
 */
function serviceVisual(
  id: string,
  kitchen: { image: ImageRef; alt: string } | null,
) {
  const room = (roomId: string) => {
    const r = rooms.find((x) => x.id === roomId);
    return r ? { src: r.image.src, alt: r.alt, blurDataURL: r.image.blurDataURL } : null;
  };
  if (id === 'kitchens') {
    return kitchen
      ? {
          src: assetUrl(kitchen.image.src),
          alt: kitchen.alt,
          blurDataURL: kitchen.image.blurDataURL || undefined,
        }
      : null;
  }
  if (id === 'wardrobes') return room('wardrobe');
  if (id === 'bathroom') return room('bathroom');
  return room('hall');
}


export async function Services({
  index,
  compact = false,
}: {
  index?: string;
  compact?: boolean;
}) {
  const [{ services }, projects] = await Promise.all([
    getContent('texts'),
    getVisibleProjects(),
  ]);
  const shot = pickImage(projects, 'uglovaya-kuhnya-do-potolka', 6);

  // Компактный вид на главной. Раньше это был список текстовых ссылок —
  // единственный блок страницы вообще без изображений, и направления в нём
  // приходилось домысливать. Теперь каждое направление показано кадром.
  if (compact) {
    const cards = services.map((s) => ({
      ...s,
      visual: serviceVisual(s.id, shot),
    }));

    return (
      <Section tone="cream" aria-labelledby="services-title">
        <div className="container-page">
          <SectionHeading
            index={index}
            id="services-title"
            eyebrow="Что мы делаем"
            title="Кухни — основное. Но не единственное"
            lead="Чаще всего к нам приходят за кухней, а уезжаем мы с объекта, сделав ещё гардеробную и шкаф в прихожей. В одной стилистике и с одной ответственностью."
          />

          <ul className="mt-16 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4 lg:gap-x-8">
            {cards.map((s, i) => (
              <li key={s.id}>
                <Reveal delay={i * 60}>
                  <Link href={s.href} className="group block">
                    {s.visual ? (
                      <div className="media-reveal relative aspect-4/5 overflow-hidden bg-sand">
                        <Image
                          src={s.visual.src}
                          alt={s.visual.alt}
                          fill
                          loading="lazy"
                          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                          placeholder={s.visual.blurDataURL ? 'blur' : 'empty'}
                          blurDataURL={s.visual.blurDataURL}
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      </div>
                    ) : null}
                    <p className="font-display mt-5 text-[1.375rem] leading-tight text-ink transition-colors group-hover:text-gold">
                      {s.title}
                    </p>
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-stone">
                      {s.text}
                    </p>
                    <span className="label-xs mt-4 inline-flex items-center gap-2 text-gold">
                      Смотреть
                      <span aria-hidden="true">→</span>
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
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
              <div
                /* Вертикальная рамка хороша для вертикального кадра;
                   горизонтальный в ней терял почти половину кухни */
                className={`relative overflow-hidden rounded-lg bg-sand ${
                  ratioOf(shot.image) > 1.2
                    ? 'aspect-4/3 sm:aspect-16/10 lg:aspect-4/3'
                    : 'aspect-4/5 sm:aspect-16/10 lg:aspect-4/5'
                }`}
              >
                <Image
                  src={assetUrl(shot.image.src)}
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

            <ul className="mt-10 grid gap-px overflow-hidden bg-line sm:grid-cols-2">
              {services.map((s, i) => (
                <li key={s.id}>
                  <Link
                    href={s.href}
                    className="group flex h-full flex-col bg-cream p-7 transition-colors hover:bg-bone sm:p-8"
                  >
                    <span className="text-eyebrow font-bold uppercase text-stone">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-display mt-3 text-[1.25rem] text-ink">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-stone">
                      {s.text}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gold">
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
