'use client';

import { saveTextsAction } from '@/app/admin/actions';
import { AdminForm, Card } from '../ui';
import { ListEditor } from '../ListEditor';
import type { TextsContent } from '@/lib/content/types';

export function QuestionsForm({ texts }: { texts: TextsContent }) {
  return (
    <AdminForm action={saveTextsAction}>
      <div className="grid gap-6">
        <Card
          title="Блок «А если…»"
          description="Прямые страхи клиента и честные ответы на них. Формулируйте страх так, как его произносит сам человек."
        >
          <ListEditor
            name="json:objections"
            initial={texts.objections as unknown as Record<string, unknown>[]}
            addLabel="Добавить сомнение"
            itemTitle={(item) => String(item.fear ?? '')}
            newItem={() => ({ fear: '', answer: '' })}
            fields={[
              {
                key: 'fear',
                label: 'Сомнение клиента',
                type: 'text',
                placeholder: 'А если вы ошибётесь?',
              },
              { key: 'answer', label: 'Ответ', type: 'textarea', rows: 4 },
            ]}
          />
        </Card>

        <Card
          title="Частые вопросы"
          description="Попадают в микроразметку FAQ. Отвечайте конкретно: обтекаемые ответы поисковики не любят так же, как люди."
        >
          <ListEditor
            name="json:faq"
            initial={texts.faq as unknown as Record<string, unknown>[]}
            addLabel="Добавить вопрос"
            itemTitle={(item) => String(item.q ?? '')}
            newItem={() => ({ q: '', a: '' })}
            fields={[
              { key: 'q', label: 'Вопрос', type: 'text' },
              { key: 'a', label: 'Ответ', type: 'textarea', rows: 4 },
            ]}
          />
        </Card>
      </div>
    </AdminForm>
  );
}
