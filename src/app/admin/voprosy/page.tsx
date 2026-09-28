import { getContent } from '@/lib/content/store';
import { QuestionsForm } from '@/components/admin/forms/QuestionsForm';

export default async function AdminQuestionsPage() {
  const texts = await getContent('texts');
  return (
    <div>
      <h1 className="font-display text-[1.75rem] text-ink sm:text-[2.125rem]">
        Вопросы и возражения
      </h1>
      <p className="mt-2 max-w-2xl text-stone">
        Два блока, которые снимают сомнения перед заявкой. Вопросы из раздела
        «Частые вопросы» дополнительно попадают в микроразметку — поисковики
        показывают их прямо в выдаче.
      </p>
      <div className="mt-8">
        <QuestionsForm texts={texts} />
      </div>
    </div>
  );
}
