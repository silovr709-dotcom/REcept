import { getContent } from '@/lib/content/store';
import { ReviewsForm } from '@/components/admin/forms/ReviewsForm';

export default async function AdminReviewsPage() {
  const reviews = await getContent('reviews');
  return (
    <div>
      <h1 className="font-display text-[1.75rem] text-ink sm:text-[2.125rem]">
        Отзывы и рейтинг
      </h1>
      <p className="mt-2 max-w-3xl text-stone">
        Здесь цитаты с Яндекс Карт. Копируйте текст дословно и отмечайте
        сокращения многоточием — рядом на сайте стоит живой виджет Яндекса, и
        любой посетитель может сверить. Придуманный отзыв обесценит все
        остальные.
      </p>
      <div className="mt-8">
        <ReviewsForm reviews={reviews} />
      </div>
    </div>
  );
}
