import { getContent } from '@/lib/content/store';
import { ContactsForm } from '@/components/admin/forms/ContactsForm';

export default async function AdminContactsPage() {
  const site = await getContent('site');
  return (
    <div>
      <h1 className="font-display text-[1.75rem] text-ink sm:text-[2.125rem]">
        Контакты и реквизиты
      </h1>
      <p className="mt-2 max-w-2xl text-stone">
        Эти данные подставляются сразу везде: шапка, подвал, мобильная панель,
        форма заявки, страница контактов и микроразметка для поисковиков.
        Пустое поле означает, что канала на сайте просто не будет.
      </p>

      <div className="mt-8">
        <ContactsForm site={site} />
      </div>
    </div>
  );
}
