import Image from 'next/image';
import { Accordion } from '../ui/Accordion';
import { CtaButton } from '../CtaButton';
import { Section, SectionHeading } from '../ui/Section';
import { getContent, getVisibleProjects } from '@/lib/content/store';
import { assetUrl, pickImage } from '@/lib/content/images';

export async function Faq({
  index,
  limit,
  tone = 'bone',
}: {
  index?: string;
  limit?: number;
  tone?: 'cream' | 'bone';
}) {
  const [{ faq }, projects] = await Promise.all([
    getContent('texts'),
    getVisibleProjects(),
  ]);
  const items = (limit ? faq.slice(0, limit) : faq).map((f) => ({
    q: f.q,
    a: <p>{f.a}</p>,
  }));
  // Левая колонка — заголовок и одна кнопка, а справа шесть вопросов.
  // На десктопе под кнопкой оставалось пустое кремовое поле во весь
  // экран: самое плоское место страницы. Туда встаёт кадр.
  const shot = pickImage(projects, 'kuhnya-gostinaya-s-ostrovom', 1);

  return (
    <Section tone={tone} id="faq" aria-labelledby="faq-title">
      <div className="container-page">
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <SectionHeading
              stacked
              index={index}
              id="faq-title"
              eyebrow="Вопросы"
              title="Коротко о главном"
              lead="Если вашего вопроса здесь нет — просто спросите. Мы отвечаем и тем, кто пока только выбирает."
            />
            <CtaButton
              source="faq"
              variant="outline"
              size="md"
              withArrow
              className="mt-8 max-sm:w-full"
              modalTitle="Спросите у нас"
              modalLead="Напишите свой вопрос — ответим честно и без попытки сразу продать кухню."
              submitLabel="Отправить вопрос"
            >
              Задать свой вопрос
            </CtaButton>

            {shot ? (
              <figure className="relative mt-12 aspect-3/2 overflow-hidden bg-sand lg:aspect-4/5">
                <Image
                  src={assetUrl(shot.image.src)}
                  alt={shot.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 1023px) 100vw, 40vw"
                  placeholder={shot.image.blurDataURL ? 'blur' : 'empty'}
                  blurDataURL={shot.image.blurDataURL || undefined}
                  className="object-cover"
                />
              </figure>
            ) : null}
          </div>

          <Accordion items={items} defaultOpen={0} />
        </div>
      </div>
    </Section>
  );
}
