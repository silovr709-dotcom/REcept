import { getContent } from '@/lib/content/store';
import { BlocksForm } from '@/components/admin/forms/BlocksForm';

export default async function AdminBlocksPage() {
  const texts = await getContent('texts');
  return (
    <div>
      <h1 className="font-display text-[1.75rem] text-ink sm:text-[2.125rem]">
        Блоки страниц
      </h1>
      <p className="mt-2 max-w-2xl text-stone">
        Направления работы, преимущества, шаги процесса, сроки, цена и карточки
        руководителей. Порядок пунктов можно менять стрелками — на сайте он будет
        такой же.
      </p>
      <div className="mt-8">
        <BlocksForm texts={texts} />
      </div>
    </div>
  );
}
