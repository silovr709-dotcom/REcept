import { ButtonLink } from '@/components/ui/Button';
import { MarginNote } from '@/components/ui/MarginNote';

/**
 * СТРАНИЦА «НЕ НАЙДЕНО»
 * =====================
 * Обычно это самое мёртвое место на сайте: извинение и кнопка «на
 * главную». Между тем человек сюда попал не по своей вине, и именно
 * здесь уместно говорить по-человечески, а не корпоративно.
 *
 * Последний абзац переворачивает роли: не мы помогаем посетителю, а
 * просим помочь нам. Это и есть слом четвёртой стены — и заодно
 * рабочий способ узнать о битой ссылке, которую иначе никто не найдёт.
 */
export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center bg-cream pt-24">
      <div className="container-page">
        <p className="text-eyebrow font-bold uppercase text-brass">
          Ошибка 404
        </p>

        <h1 className="font-display mt-5 max-w-3xl text-h1 text-ink">
          Такой страницы нет
        </h1>

        <p
          className="mt-7 max-w-xl font-(family-name:--font-hand) text-[1.5rem] leading-snug text-stone sm:text-[1.75rem]"
          style={{ transform: 'rotate(-0.6deg)' }}
        >
          Зато кухни на месте — мы проверили.
        </p>

        <p className="mt-7 max-w-lg text-lead text-stone">
          Скорее всего, ссылка устарела или в адресе опечатка. Отсюда можно
          уйти в две стороны:
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/portfolio" variant="primary" size="lg" withArrow>
            Посмотреть проекты
          </ButtonLink>
          <ButtonLink href="/kontakty" variant="outline" size="lg">
            Написать нам
          </ButtonLink>
        </div>

        <MarginNote author="Роберт" className="mt-14">
          А если вы попали сюда по ссылке с нашего же сайта — напишите,
          пожалуйста. Починим. Это тот редкий случай, когда помогаете нам
          вы, а не мы вам.
        </MarginNote>
      </div>
    </section>
  );
}
