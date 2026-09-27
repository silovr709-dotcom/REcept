import { yandex } from '@/data/site';

/**
 * Официальный виджет отзывов Яндекс Карт.
 * Показывает живые отзывы и рейтинг, которые мы не можем отредактировать, —
 * это и есть доказательство. Грузится лениво, поэтому на скорость страницы
 * почти не влияет.
 */
export function YandexReviewsWidget({ height = 620 }: { height?: number }) {
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
export function YandexMapWidget({ height = 420 }: { height?: number }) {
  const src = `https://yandex.ru/map-widget/v1/org/${yandex.orgId}/?indoorLevel=1&lang=ru_RU`;

  return (
    <div
      className="overflow-hidden rounded-lg border border-line bg-sand"
      style={{ height }}
    >
      <iframe
        src={src}
        title="Мебельное ателье «РЕцепт» на карте Твери: проспект Калинина, 13А"
        loading="lazy"
        allowFullScreen
        className="size-full border-0"
      />
    </div>
  );
}
