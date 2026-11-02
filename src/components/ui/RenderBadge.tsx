/**
 * ПЛАШКА ТИПА ИЗОБРАЖЕНИЯ
 * =======================
 *
 * Иллюстрации деталей и интерьеров, которые можно принять за фотографии
 * выполненных работ, помечаются «Визуализация». Портреты владельцев не
 * показывают результат заказа и отдельной плашки не требуют.
 *
 * Подпись рядом с разделом легко пропустить, а визуализацию можно принять
 * за документальное свидетельство. Поэтому её тип указан прямо поверх
 * изображения. Компонент принимает label для других явно обозначенных типов.
 */
export function RenderBadge({
  className = '',
  label = 'Визуализация',
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={`pointer-events-none absolute bottom-3 left-3 z-10 bg-ink/70 px-2.5 py-1 text-caption font-semibold uppercase tracking-[0.16em] text-cream/90 backdrop-blur-[2px] ${className}`}
    >
      {label}
    </span>
  );
}
