'use client';

import { saveReviewsAction } from '@/app/admin/actions';
import { AdminForm, Card, Checkbox, Field, Input } from '../ui';
import { ListEditor } from '../ListEditor';
import type { ReviewsContent } from '@/lib/content/types';

export function ReviewsForm({ reviews }: { reviews: ReviewsContent }) {
  return (
    <AdminForm action={saveReviewsAction}>
      <div className="grid gap-6">
        <Card
          title="Рейтинг"
          description="Сверяйте цифры с карточкой организации. Виджет на странице «Отзывы» обновляется сам, а эти числа — нет."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Оценка">
              <Input name="value" defaultValue={reviews.rating.value} placeholder="5,0" />
            </Field>
            <Field label="Источник">
              <Input name="source" defaultValue={reviews.rating.source} />
            </Field>
            <Field label="Сколько отзывов">
              <Input name="reviewsCount" type="number" defaultValue={reviews.rating.reviewsCount} />
            </Field>
            <Field label="Сколько оценок">
              <Input name="scoresCount" type="number" defaultValue={reviews.rating.scoresCount} />
            </Field>
            <Field label="Когда сверяли" hint="Показывается мелким шрифтом на странице отзывов">
              <Input name="checkedAt" defaultValue={reviews.rating.checkedAt} />
            </Field>
          </div>
          <div className="mt-5">
            <Checkbox
              name="show"
              label="Показывать рейтинг на сайте"
              defaultChecked={reviews.rating.show}
            />
          </div>
        </Card>

        <Card
          title="Цитаты"
          description="Первые три показываются на главной, все — на странице «Отзывы»."
        >
          <ListEditor
            name="items"
            initial={reviews.items as unknown as Record<string, unknown>[]}
            addLabel="Добавить отзыв"
            itemTitle={(item) =>
              `${item.author || 'Без подписи'} — ${item.highlight ?? ''}`
            }
            newItem={() => ({
              author: '',
              date: '',
              highlight: '',
              text: '',
              hidden: false,
            })}
            fields={[
              { key: 'author', label: 'Автор', type: 'text', hint: 'Пусто — покажем «Без подписи»' },
              { key: 'date', label: 'Дата', type: 'text', placeholder: '17 июня' },
              {
                key: 'highlight',
                label: 'О чём отзыв',
                type: 'text',
                wide: true,
                hint: 'Короткая суть — это заголовок карточки. Например: «Кривые стены и газовый котёл посередине»',
              },
              {
                key: 'text',
                label: 'Текст отзыва',
                type: 'textarea',
                rows: 6,
                hint: 'Дословно. Сокращения отмечайте многоточием',
              },
              { key: 'hidden', label: 'Скрыт', type: 'checkbox', hint: 'Скрыть с сайта' },
            ]}
          />
        </Card>
      </div>
    </AdminForm>
  );
}
