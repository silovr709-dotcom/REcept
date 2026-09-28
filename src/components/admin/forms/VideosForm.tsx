'use client';

import { saveVideosAction } from '@/app/admin/actions';
import { AdminForm, Card } from '../ui';
import { ListEditor } from '../ListEditor';
import type { VideoItem } from '@/lib/content/types';

export function VideosForm({
  videos,
  groupId,
}: {
  videos: VideoItem[];
  groupId: string | null;
}) {
  return (
    <AdminForm action={saveVideosAction}>
      <Card
        title="Ролики"
        description={
          groupId
            ? 'Показываются на главной, в портфолио и на странице отзывов. Первые три — самые заметные.'
            : 'Сначала укажите номер сообщества в разделе «Контакты и реквизиты» — без него видео не встроится.'
        }
      >
        <ListEditor
          name="items"
          initial={videos as unknown as Record<string, unknown>[]}
          collapsible={false}
          addLabel="Добавить видео"
          itemTitle={(item) => String(item.title || item.id || 'Новое видео')}
          newItem={() => ({
            id: '',
            title: '',
            duration: '',
            published: '',
            poster: null,
            hidden: false,
          })}
          emptyHint="Пока ни одного ролика. Блок видео на сайте не показывается."
          fields={[
            {
              key: 'id',
              label: 'Ссылка или номер видео',
              type: 'text',
              wide: true,
              hint: 'Можно вставить целиком: vk.com/video-87927252_456239222 — номер вытащим сами',
            },
            {
              key: 'title',
              label: 'Название',
              type: 'text',
              hint: 'Необязательно. Пусто — подпишем датой',
            },
            { key: 'duration', label: 'Длительность', type: 'text', placeholder: '0:40' },
            {
              key: 'poster',
              label: 'Обложка',
              type: 'image',
              hint: 'Кадр из ролика. Пока обложки нет, показывается фирменная заглушка. Плеер ВКонтакте грузится только после нажатия — так страница остаётся лёгкой',
            },
            { key: 'published', label: 'Когда опубликовано', type: 'text', placeholder: '18 сентября' },
            { key: 'hidden', label: 'Скрыто', type: 'checkbox', hint: 'Скрыть с сайта' },
          ]}
        />
      </Card>
    </AdminForm>
  );
}
