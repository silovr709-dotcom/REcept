'use client';

import { saveTextsAction } from '@/app/admin/actions';
import { AdminForm, Card, Field, Input, TextArea } from '../ui';
import { ListEditor } from '../ListEditor';
import { ImagePicker } from '../ImagePicker';
import { useState } from 'react';
import type { ImageRef, TextsContent } from '@/lib/content/types';

export function HeroForm({ texts }: { texts: TextsContent }) {
  const [heroImage, setHeroImage] = useState<ImageRef | null>(texts.hero.image);

  return (
    <AdminForm action={saveTextsAction}>
      <div className="grid gap-6">
        <Card title="Первый экран">
          <input
            type="hidden"
            name="json:hero.image"
            value={JSON.stringify(heroImage)}
          />

          <div className="grid gap-5">
            <Field label="Надпись над заголовком">
              <Input name="text:hero.eyebrow" defaultValue={texts.hero.eyebrow} />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Заголовок, первая строка">
                <Input name="text:hero.title" defaultValue={texts.hero.title} />
              </Field>
              <Field label="Вторая строка" hint="Можно оставить пустой">
                <Input
                  name="text:hero.titleSecondLine"
                  defaultValue={texts.hero.titleSecondLine}
                />
              </Field>
            </div>

            <Field
              label="Подзаголовок"
              hint="Объясняет, кто вы и что входит в работу. Два-три предложения."
            >
              <TextArea name="text:hero.lead" rows={3} defaultValue={texts.hero.lead} />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Главная кнопка" hint="Глагол и результат: «Рассчитать мою кухню»">
                <Input name="text:hero.primaryCta" defaultValue={texts.hero.primaryCta} />
              </Field>
              <Field label="Вторая кнопка">
                <Input
                  name="text:hero.secondaryCta"
                  defaultValue={texts.hero.secondaryCta}
                />
              </Field>
            </div>

            <Field
              label="Строка под кнопками"
              hint="Снимает страх: «без обязательств», «сначала обсудим задачу»"
            >
              <TextArea
                name="text:hero.reassurance"
                rows={2}
                defaultValue={texts.hero.reassurance}
              />
            </Field>

            <ImagePicker
              label="Главная фотография"
              value={heroImage}
              onChange={setHeroImage}
              hint="Лучше горизонтальный или квадратный кадр вашей работы"
            />
          </div>
        </Card>

        <Card
          title="Цифры под первым экраном"
          description="Четыре коротких факта. Только то, что правда и что можно проверить."
        >
          <ListEditor
            name="json:hero.stats"
            initial={texts.hero.stats as unknown as Record<string, unknown>[]}
            collapsible={false}
            addLabel="Добавить цифру"
            itemTitle={(item) => `${item.big ?? ''} — ${item.small ?? ''}`}
            newItem={() => ({ big: '', small: '' })}
            fields={[
              { key: 'big', label: 'Крупно', type: 'text', placeholder: '24' },
              {
                key: 'small',
                label: 'Пояснение',
                type: 'text',
                placeholder: 'месяца гарантии на изделие',
              },
            ]}
          />
        </Card>

        <Card
          title="Блок «Зачем мы нужны»"
          description="Сравнение «как обычно бывает» и «как у нас». Это центральный продающий блок — в нём вы забираете у клиента головную боль."
        >
          <div className="grid gap-5">
            <Field label="Надпись над заголовком">
              <Input
                name="text:headache.eyebrow"
                defaultValue={texts.headache.eyebrow}
              />
            </Field>
            <Field label="Заголовок">
              <TextArea
                name="text:headache.title"
                rows={2}
                defaultValue={texts.headache.title}
              />
            </Field>
            <Field label="Вступление">
              <TextArea
                name="text:headache.lead"
                rows={3}
                defaultValue={texts.headache.lead}
              />
            </Field>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-[0.8125rem] font-semibold text-ink">
                Как обычно бывает
              </p>
              <ListEditor
                name="json:headache.pains"
                initial={texts.headache.pains.map((t) => ({ text: t }))}
                collapsible={false}
                addLabel="Добавить боль"
                itemTitle={(item) => String(item.text ?? '')}
                newItem={() => ({ text: '' })}
                fields={[{ key: 'text', label: 'Текст', type: 'textarea', rows: 2 }]}
              />
              <p className="mt-2 text-xs text-stone">
                Список сохраняется как набор строк
              </p>
            </div>
            <div>
              <p className="mb-2 text-[0.8125rem] font-semibold text-ink">
                Как у нас
              </p>
              <ListEditor
                name="json:headache.reliefs"
                initial={texts.headache.reliefs.map((t) => ({ text: t }))}
                collapsible={false}
                addLabel="Добавить решение"
                itemTitle={(item) => String(item.text ?? '')}
                newItem={() => ({ text: '' })}
                fields={[{ key: 'text', label: 'Текст', type: 'textarea', rows: 2 }]}
              />
            </div>
          </div>
        </Card>

        <Card
          title="Блок «Роберт и Катя»"
          description="Живые люди вместо «нашей команды». Здесь работает личная ответственность, а не регалии."
        >
          <div className="grid gap-5">
            <Field label="Заголовок">
              <Input
                name="text:founders.title"
                defaultValue={texts.founders.title}
              />
            </Field>
          </div>
          <div className="mt-5">
            <p className="mb-2 text-[0.8125rem] font-semibold text-ink">Абзацы</p>
            <ListEditor
              name="json:founders.paragraphs"
              initial={texts.founders.paragraphs.map((t) => ({ text: t }))}
              collapsible={false}
              addLabel="Добавить абзац"
              itemTitle={(item) => String(item.text ?? '').slice(0, 60)}
              newItem={() => ({ text: '' })}
              fields={[{ key: 'text', label: 'Текст', type: 'textarea', rows: 4 }]}
            />
          </div>
        </Card>
      </div>
    </AdminForm>
  );
}
