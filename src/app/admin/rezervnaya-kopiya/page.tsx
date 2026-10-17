import { exportAll } from '@/lib/content/store';
import { BackupPanel } from '@/components/admin/forms/BackupPanel';

export default async function AdminBackupPage() {
  const data = await exportAll();
  const snapshot = JSON.stringify(data, null, 2);

  return (
    <div>
      <h1 className="font-display text-[1.75rem] text-ink sm:text-[2.125rem]">
        Резервная копия
      </h1>
      <p className="mt-2 max-w-3xl text-stone">
        Весь текст, настройки и списки сайта — в одном файле. Скачайте его перед
        крупными правками: если что-то пойдёт не так, копию можно загрузить
        обратно и вернуть всё как было. Фотографии в копию не входят — они лежат
        в папке сайта отдельно.
      </p>

      <div className="mt-8">
        <BackupPanel snapshot={snapshot} size={snapshot.length} />
      </div>
    </div>
  );
}
