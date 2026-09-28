import { Accordion } from '../ui/Accordion';
import { CtaButton } from '../CtaButton';
import { Section, SectionHeading } from '../ui/Section';
import { getContent } from '@/lib/content/store';

export async function Faq({
  limit,
  tone = 'bone',
}: {
  limit?: number;
  tone?: 'cream' | 'bone';
}) {
  const { faq } = await getContent('texts');
  const items = (limit ? faq.slice(0, limit) : faq).map((f) => ({
    q: f.q,
    a: <p>{f.a}</p>,
  }));

  return (
    <Section tone={tone} id="faq" aria-labelledby="faq-title">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading
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
          </div>

          <Accordion items={items} defaultOpen={0} />
        </div>
      </div>
    </Section>
  );
}
