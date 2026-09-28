import { ButtonLink } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center bg-cream pt-24">
      <div className="container-page">
        <p className="text-eyebrow font-bold uppercase text-brass">
          Страница не найдена
        </p>
        <h1 className="font-display mt-5 max-w-2xl text-h1 text-ink">
          Такой страницы нет — но кухня всё ещё возможна
        </h1>
        <p className="mt-5 max-w-lg text-lead text-stone">
          Возможно, ссылка устарела. Посмотрите наши работы или напишите нам — мы
          подскажем, что вам нужно.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/portfolio" variant="primary" size="lg" withArrow>
            Посмотреть проекты
          </ButtonLink>
          <ButtonLink href="/kontakty" variant="outline" size="lg">
            Связаться с нами
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
