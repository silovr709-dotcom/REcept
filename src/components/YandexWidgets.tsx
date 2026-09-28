import { getSiteView } from '@/lib/content/view';

/**
 * Официальный виджет отзывов Яндекс Карт.
 * Показывает живые отзывы и рейтинг, которые мы не можем отредактировать, —
 * это и есть доказательство. Грузится лениво, поэтому на скорость страницы
 * почти не влияет.
 */
export async function YandexReviewsWidget({ height = 620 }: { height?: number }) {
  const { yandex } = await getSiteView();
  if (!yandex) return null;

  return (
    <div
      className="overflow-hidden rounded-lg border border-line bg-cream"
      style={{ height }}
    >
      <iframe
        src={yandex.widgetUrl}
        title="Живые отзывы о мебельном ателье «РЕцепт» на Яндекс Картах"
        loading="lazy"
        className="size-full border-0"
      />
    </div>
  );
}

/**
 * Карта с карточкой организации.
 * Заодно показывает актуальные часы работы — мы не дублируем их текстом,
 * чтобы на сайте не висело устаревшее расписание.
 */
export async function YandexMapWidget({ height = 420 }: { height?: number }) {
  const { yandex, address } = await getSiteView();
  if (!yandex) return null;

  return (
    <div
      className="overflow-hidden rounded-lg border border-line bg-sand"
      style={{ height }}
    >
      <iframe
        src={yandex.mapWidgetUrl}
        title={`Мебельное ателье «РЕцепт» на карте: ${address ?? 'Тверь'}`}
        loading="lazy"
        allowFullScreen
        className="size-full border-0"
      />
    </div>
  );
}
