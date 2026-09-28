'use client';

import { saveDetailsAction } from '@/app/admin/actions';
import { AdminForm, Card } from '../ui';
import { ListEditor } from '../ListEditor';
import type { DetailItem, ProjectItem } from '@/lib/content/types';

export function DetailsForm({
  details,
  projects,
}: {
  details: DetailItem[];
  projects: ProjectItem[];
}) {
  const slugHint = `Адрес проекта, к которому относится кадр. Доступные: ${projects
    .map((p) => p.slug)
    .join(', ')}`;

  return (
    <AdminForm action={saveDetailsAction}>
      <Card
        title="Фрагменты работ"
        description="Первые восемь показываются на главной, все — на странице «Материалы»."
      >
        <ListEditor
          name="items"
          initial={details as unknown as Record<string, unknown>[]}
          addLabel="Добавить фрагмент"
          itemTitle={(item) =>
            `${item.title || 'Новый фрагмент'}${item.hidden ? ' — скрыт' : ''}`
          }
          newItem={() => ({
            id: `detail-${Date.now().toString(36)}`,
            image: null,
            title: '',
            note: '',
            project: projects[0]?.slug ?? '',
            projectTitle: projects[0]?.title ?? '',
            alt: '',
            hidden: false,
          })}
          fields={[
            { key: 'image', label: 'Кадр', type: 'image' },
            { key: 'title', label: 'Что на кадре', type: 'text', placeholder: 'Профиль-ручка в цвете латуни' },
            {
              key: 'note',
              label: 'Зачем так сделано',
              type: 'text',
              placeholder: 'Ящики открываются без выступающих ручек',
            },
            {
              key: 'id',
              label: 'Код',
              type: 'text',
              hint: 'Латиницей. По нему кадр привязывается к проекту',
            },
            { key: 'project', label: 'Проект', type: 'text', hint: slugHint },
            { key: 'projectTitle', label: 'Название проекта', type: 'text' },
            {
              key: 'alt',
              label: 'Описание фотографии',
              type: 'textarea',
              rows: 2,
              hint: 'Для незрячих пользователей и поисковиков',
            },
            { key: 'hidden', label: 'Скрыт', type: 'checkbox', hint: 'Скрыть с сайта' },
          ]}
        />
      </Card>
    </AdminForm>
  );
}
