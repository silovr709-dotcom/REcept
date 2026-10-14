import Image from 'next/image';
import { CtaButton } from '../CtaButton';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { MarginNote } from '../ui/MarginNote';
import { getContent, getVisibleProjects } from '@/lib/content/store';
import { assetUrl, pickImage } from '@/lib/content/images';

/**
 * ЦЕНТРАЛЬНЫЙ ПРОДАЮЩИЙ БЛОК.
 * Главная мысль: чтобы получить хорошую кухню, не нужно самому
 * становиться специалистом по кухням и координатором стройки.
 */
export async function Headache({ index }: { index?: string } = {}) {
  const [{ headache }, projects] = await Promise.all([
    getContent('texts'),
    getVisibleProjects(),
  ]);
  const backdrop = pickImage(projects, 'temno-siniaya-kuhnya-latun', 9);

  return (
    <Section
      tone="ink"
      aria-labelledby="headache-title"
      className="relative isolate overflow-hidden"
    >
      {/* Кадр не иллюстрирует текст, а снимает «однотон»: на длинном
          тёмном блоке без него остаётся только плоская заливка.
          Плотность завала сверху максимальная — там лежит заголовок,
          ниже кадр проступает сильнее, но контраст светлого текста
          даже в худшем случае держится выше 8:1 */}
      {backdrop ? (
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <Image
            src={assetUrl(backdrop.image.src)}
            alt=""
            fill
            loading="lazy"
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-linear-to-b from-ink/95 via-ink/82 to-ink/68" />
        </div>
      ) : null}

      <div className="container-page">
        <SectionHeading
          index={index}
          id="headache-title"
          tone="light"
          eyebrow={headache.eyebrow}
          title={headache.title}
          lead={headache.lead}
        />

        <div className="mt-14 grid gap-6 lg:mt-16 lg:grid-cols-2 lg:gap-8">
          <Reveal className="rounded-lg border border-cream/12 bg-cream/[0.03] p-7 sm:p-9">
            <h3 className="text-eyebrow font-bold uppercase text-cream/60">
              Как это обычно происходит
            </h3>
            <ul className="mt-7 grid gap-5">
              {headache.pains.map((pain) => (
                <li key={pain} className="flex gap-4 text-cream/55">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-cream/25"
                  >
                    <path
                      d="M7 7l10 10M17 7L7 17"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>{pain}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal
            delay={80}
            className="rounded-lg border border-brass/35 bg-linear-to-b from-brass/12 to-transparent p-7 sm:p-9"
          >
            <h3 className="text-eyebrow font-bold uppercase text-brasslight">
              Как это происходит с «РЕцептом»
            </h3>
            <ul className="mt-7 grid gap-5">
              {headache.reliefs.map((relief) => (
                <li key={relief} className="flex gap-4 text-cream/85">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-brasslight"
                  >
                    <path
                      d="m5 12.5 4.5 4.5L19 7"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{relief}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Главная мысль блока сказана не от лица ателье, а голосом Кати:
            после двух колонок списков человеку нужен живой человек,
            а не ещё один абзац корпоративного текста */}
        <Reveal className="mt-14 flex flex-col items-start gap-8 sm:flex-row sm:items-end sm:justify-between">
          <MarginNote author="Катя" tone="light">
            Вам не нужно разбираться в петлях, доводчиках и углах открывания
            двери холодильника. Расскажите, как вы живёте и что вас бесит на
            нынешней кухне, — остальное правда наша работа.
          </MarginNote>
          <CtaButton
            source="headache"
            variant="light"
            size="lg"
            withArrow
            className="w-full shrink-0 sm:w-auto"
            modalTitle="Расскажите про вашу задачу"
            modalLead="Достаточно пары фраз: где кухня, что не устраивает сейчас и чего хочется. Дальше разберёмся вместе."
            submitLabel="Обсудить мою задачу"
          >
            Обсудить мою задачу
          </CtaButton>
        </Reveal>
      </div>
    </Section>
  );
}
