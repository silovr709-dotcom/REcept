import Image from 'next/image';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { textures } from '@/data/textures';

/**
 * ОБРАЗЦЫ МАТЕРИАЛОВ.
 * Единственное место на сайте, где показаны не наши объекты, а сами
 * материалы крупно и при одинаковом свете. На общих планах кухонь фактуру
 * эмали, шпона или рифлёного стекла разглядеть невозможно.
 *
 * Подпись под блоком говорит об этом прямо: подменять образцами портфолио
 * нельзя, иначе обесценятся настоящие фотографии работ.
 */
export function Textures({ tone = 'ink' }: { tone?: 'ink' | 'bone' }) {
  const light = tone === 'ink';

  return (
    <Section tone={tone} aria-labelledby="textures-title">
      <div className="container-page">
        <SectionHeading
          id="textures-title"
          tone={light ? 'light' : 'dark'}
          eyebrow="Образцы"
          title="Как выглядят материалы вблизи"
          lead="Разница между эмалью и плёнкой, между шпоном и имитацией, между аккуратным и приблизительным зазором видна только на расстоянии вытянутой руки. Здесь материалы сняты крупно и при одинаковом свете."
        />

        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:mt-16 lg:grid-cols-5">
          {textures.map((t, i) => (
            <li key={t.id}>
              <Reveal delay={Math.min(i, 6) * 40}>
                <div
                  className={`media-reveal relative aspect-4/5 overflow-hidden rounded-md ${
                    light ? 'bg-coal' : 'bg-sand'
                  }`}
                >
                  <Image
                    src={t.image}
                    alt={t.alt}
                    fill
                    loading="lazy"
                    sizes="(max-width: 639px) 46vw, (max-width: 1023px) 30vw, 18vw"
                    placeholder="blur"
                    className="object-cover"
                  />
                </div>
                <p
                  className={`mt-3 text-[0.9375rem] font-semibold leading-snug ${
                    light ? 'text-cream' : 'text-ink'
                  }`}
                >
                  {t.title}
                </p>
                <p
                  className={`mt-1 text-[0.8125rem] leading-snug ${
                    light ? 'text-cream/60' : 'text-stone'
                  }`}
                >
                  {t.note}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>

        <p
          className={`mt-10 max-w-3xl text-sm ${light ? 'text-cream/60' : 'text-stone'}`}
        >
          Это образцы материалов и фактур, а не фотографии наших объектов.
          Выполненные кухни — в{' '}
          <a
            href="/portfolio"
            className={`link-sweep font-semibold ${light ? 'text-cream' : 'text-ink'}`}
          >
            портфолио
          </a>
          : там всё снято на реальных объектах в Твери.
        </p>
      </div>
    </Section>
  );
}
