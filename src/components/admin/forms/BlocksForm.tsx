'use client';

import { saveTextsAction } from '@/app/admin/actions';
import { AdminForm, Card, Field, Input, TextArea } from '../ui';
import { ListEditor } from '../ListEditor';
import type { TextsContent } from '@/lib/content/types';

export function BlocksForm({ texts }: { texts: TextsContent }) {
  return (
    <AdminForm action={saveTextsAction}>
      <div className="grid gap-6">
        <Card
          title="Что мы делаем"
          description="Направления работы. Показываются на главной карточками со ссылками."
        >
          <ListEditor
            name="json:services"
            initial={texts.services as unknown as Record<string, unknown>[]}
            addLabel="Добавить направление"
            itemTitle={(item) => String(item.title ?? '')}
            newItem={() => ({ id: `svc-${Date.now()}`, title: '', text: '', href: '/kuhni-na-zakaz' })}
            fields={[
              { key: 'title', label: 'Название', type: 'text' },
              { key: 'href', label: 'Ссылка', type: 'text', placeholder: '/mebel-na-zakaz' },
              { key: 'text', label: 'Описание', type: 'textarea', rows: 2 },
            ]}
          />
        </Card>

        <Card
          title="Преимущества"
          description="Каждое условие связано с выгодой для клиента, а не просто названо. Первый пункт показывается крупным блоком."
        >
          <ListEditor
            name="json:advantages"
            initial={texts.advantages as unknown as Record<string, unknown>[]}
            addLabel="Добавить преимущество"
            itemTitle={(item) => String(item.title ?? '')}
            newItem={() => ({ id: `adv-${Date.now()}`, title: '', benefit: '' })}
            fields={[
              { key: 'title', label: 'Условие', type: 'text' },
              {
                key: 'benefit',
                label: 'Что это даёт клиенту',
                type: 'textarea',
                rows: 3,
                hint: 'Не «мы работаем качественно», а что человек почувствует на себе',
              },
            ]}
          />
        </Card>

        <Card
          title="Как проходит работа"
          description="Шаги процесса. Колонка «от вас» показывает, как мало усилий требуется от клиента, — это снимает страх."
        >
          <ListEditor
            name="json:processSteps"
            initial={texts.processSteps as unknown as Record<string, unknown>[]}
            addLabel="Добавить шаг"
            itemTitle={(item) => `${item.n ?? ''} ${item.title ?? ''}`}
            newItem={() => ({ n: '', title: '', text: '', yourEffort: '' })}
            fields={[
              { key: 'n', label: 'Номер', type: 'text', placeholder: '01' },
              { key: 'title', label: 'Название шага', type: 'text' },
              { key: 'text', label: 'Описание', type: 'textarea', rows: 3 },
              { key: 'yourEffort', label: 'Что требуется от клиента', type: 'text' },
            ]}
          />
        </Card>

        <Card
          title="Когда к нам приходить"
          description="Честная причина не откладывать — вместо таймеров и «скидок только сегодня»."
        >
          <div className="grid gap-5">
            <Field label="Заголовок">
              <TextArea name="text:timing.title" rows={2} defaultValue={texts.timing.title} />
            </Field>
            <Field label="Вступление">
              <TextArea name="text:timing.lead" rows={3} defaultValue={texts.timing.lead} />
            </Field>
          </div>
          <div className="mt-5">
            <ListEditor
              name="json:timing.stages"
              initial={texts.timing.stages as unknown as Record<string, unknown>[]}
              addLabel="Добавить этап"
              itemTitle={(item) => String(item.stage ?? '')}
              newItem={() => ({ stage: '', mark: '', best: false, text: '' })}
              fields={[
                { key: 'stage', label: 'Этап', type: 'text', placeholder: 'До ремонта' },
                { key: 'mark', label: 'Пометка', type: 'text', placeholder: 'Лучший момент' },
                { key: 'text', label: 'Описание', type: 'textarea', rows: 3 },
                { key: 'best', label: 'Выделить', type: 'checkbox', hint: 'Подсветить как лучший момент' },
              ]}
            />
          </div>
        </Card>

        <Card
          title="Цена и прозрачность"
          description="Объясняем, почему нет прайс-листа, и что клиент получает вместо него. Никаких зачёркнутых цен и фальшивых скидок."
        >
          <div className="grid gap-5">
            <Field label="Заголовок">
              <Input name="text:price.headline" defaultValue={texts.price.headline} />
            </Field>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-[0.8125rem] font-semibold text-ink">Абзацы</p>
              <ListEditor
                name="json:price.body"
                initial={texts.price.body.map((t) => ({ text: t }))}
                collapsible={false}
                addLabel="Добавить абзац"
                itemTitle={(item) => String(item.text ?? '').slice(0, 50)}
                newItem={() => ({ text: '' })}
                fields={[{ key: 'text', label: 'Текст', type: 'textarea', rows: 3 }]}
              />
            </div>
            <div>
              <p className="mb-2 text-[0.8125rem] font-semibold text-ink">
                Что входит бесплатно
              </p>
              <ListEditor
                name="json:price.guarantees"
                initial={texts.price.guarantees.map((t) => ({ text: t }))}
                collapsible={false}
                addLabel="Добавить пункт"
                itemTitle={(item) => String(item.text ?? '')}
                newItem={() => ({ text: '' })}
                fields={[{ key: 'text', label: 'Текст', type: 'text' }]}
              />
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-2 text-[0.8125rem] font-semibold text-ink">
              Из чего складывается стоимость
            </p>
            <ListEditor
              name="json:price.factors"
              initial={texts.price.factors as unknown as Record<string, unknown>[]}
              addLabel="Добавить фактор"
              itemTitle={(item) => String(item.title ?? '')}
              newItem={() => ({ title: '', text: '' })}
              fields={[
                { key: 'title', label: 'Фактор', type: 'text' },
                { key: 'text', label: 'Пояснение', type: 'textarea', rows: 2 },
              ]}
            />
          </div>
        </Card>

        <Card
          title="Роберт и Катя"
          description="Имена, роли и фотографии. Роль и описание заполняйте только реальными — выдуманные регалии заметны."
        >
          <ListEditor
            name="json:team"
            initial={texts.team as unknown as Record<string, unknown>[]}
            addLabel="Добавить человека"
            itemTitle={(item) => String(item.fullName || item.name || '')}
            newItem={() => ({
              name: '',
              fullName: '',
              role: '',
              bio: '',
              photo: null,
              vk: '',
            })}
            fields={[
              { key: 'name', label: 'Имя', type: 'text', placeholder: 'Роберт' },
              { key: 'fullName', label: 'Имя и фамилия', type: 'text' },
              { key: 'role', label: 'Роль', type: 'text', placeholder: 'Руководитель' },
              { key: 'vk', label: 'Ссылка на ВКонтакте', type: 'text' },
              { key: 'bio', label: 'Короткий рассказ', type: 'textarea', rows: 3 },
              {
                key: 'photo',
                label: 'Фотография',
                type: 'image',
                hint: 'Квадратный кадр, лицо крупно',
              },
            ]}
          />
        </Card>
      </div>
    </AdminForm>
  );
}
