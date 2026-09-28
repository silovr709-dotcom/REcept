import { getContent } from '@/lib/content/store';
import { VideosForm } from '@/components/admin/forms/VideosForm';

export default async function AdminVideosPage() {
  const [videos, site] = await Promise.all([
    getContent('videos'),
    getContent('site'),
  ]);
  return (
    <div>
      <h1 className="font-display text-[1.75rem] text-ink sm:text-[2.125rem]">
        Видео из ВКонтакте
      </h1>
      <p className="mt-2 max-w-3xl text-stone">
        Ролики не перезаливаются на сайт — они играют прямо из вашего
        сообщества и подгружаются только когда посетитель до них доскроллит.
        Достаточно вставить ссылку на видео.
      </p>
      <div className="mt-8">
        <VideosForm videos={videos} groupId={site.vkGroupId} />
      </div>
    </div>
  );
}
