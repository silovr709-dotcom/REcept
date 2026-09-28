'use client';

import { saveProjectsAction } from '@/app/admin/actions';
import { AdminForm, Card } from '../ui';
import { ListEditor } from '../ListEditor';
import type { ProjectItem } from '@/lib/content/types';

const LAYOUT_HINT =
  'Прямая, Угловая, П-образная или С островом — по этому полю работает фильтр в портфолио';

export function ProjectsForm({ projects }: { projects: ProjectItem[] }) {
  return (
    <AdminForm action={saveProjectsAction}>
      <Card
        title="Работы"
        description="Порядок в списке = порядок на сайте. Первые шесть проектов показываются на главной."
      >
        <ListEditor
          name="items"
          initial={projects as unknown as Record<string, unknown>[]}
          addLabel="Добавить проект"
          itemTitle={(item) =>
            `${item.title || 'Новый проект'}${item.hidden ? ' — скрыт' : ''}`
          }
          newItem={() => ({
            slug: `proekt-${Date.now().toString(36)}`,
            title: '',
            summary: '',
            image: null,
            alt: '',
            shape: 'landscape',
            category: 'Кухня',
            layout: 'Прямая',
            materials: [],
            solutions: [],
            rationale: '',
            detailIds: [],
            area: null,
            term: null,
            budget: null,
            clientStory: null,
            hidden: false,
          })}
          fields={[
            { key: 'title', label: 'Название проекта', type: 'text' },
            {
              key: 'slug',
              label: 'Адрес страницы',
              type: 'text',
              hint: 'Латиницей через дефис. Менять у опубликованного проекта не стоит — старая ссылка перестанет работать',
            },
            {
              key: 'summary',
              label: 'Подзаголовок для карточки',
              type: 'text',
              wide: true,
            },
            {
              key: 'image',
              label: 'Главная фотография',
              type: 'image',
              hint: 'Общий план кухни. Остальные кадры добавляются в разделе «Детали»',
            },
            {
              key: 'alt',
              label: 'Описание фотографии',
              type: 'textarea',
              rows: 2,
              hint: 'Для незрячих пользователей и поисковиков. Опишите словами, что на кадре',
            },
            { key: 'layout', label: 'Компоновка', type: 'text', hint: LAYOUT_HINT },
            {
              key: 'shape',
              label: 'Формат кадра',
              type: 'text',
              hint: 'landscape — горизонтальный, portrait — вертикальный, panorama — широкий',
            },
            {
              key: 'materials',
              label: 'Материалы и фурнитура',
              type: 'stringlist',
              placeholder: 'Матовые фасады в тёплом светлом тоне',
            },
            {
              key: 'solutions',
              label: 'Что здесь решено',
              type: 'text',
              fields: [
                { key: 'title', label: 'Решение', type: 'text' },
                { key: 'text', label: 'Пояснение', type: 'textarea', rows: 2 },
              ],
            },
            {
              key: 'rationale',
              label: 'Почему так сделано',
              type: 'textarea',
              rows: 3,
            },
            {
              key: 'detailIds',
              label: 'Коды деталей этого проекта',
              type: 'stringlist',
              placeholder: 'brass-hood',
              hint: 'Коды берутся из раздела «Детали и фактуры»',
            },
            { key: 'area', label: 'Площадь (если знаете)', type: 'text' },
            { key: 'term', label: 'Срок (если знаете)', type: 'text' },
            { key: 'budget', label: 'Бюджет (если публикуете)', type: 'text' },
            {
              key: 'clientStory',
              label: 'История заказчика',
              type: 'textarea',
              rows: 3,
              hint: 'Только с реального согласия клиента. Пустое поле не показывается',
            },
            {
              key: 'hidden',
              label: 'Скрыт',
              type: 'checkbox',
              hint: 'Скрыть с сайта, но не удалять',
            },
          ]}
        />
      </Card>
    </AdminForm>
  );
}
