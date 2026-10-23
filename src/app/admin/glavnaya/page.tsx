import { getContent } from '@/lib/content/store';
import { HeroForm } from '@/components/admin/forms/HeroForm';

export default async function AdminHeroPage() {
  const texts = await getContent('texts');
  return (
    <div>
      <h1 className="font-display text-[1.75rem] text-ink sm:text-[2.125rem]">
        Первый экран и вводные блоки
      </h1>
      <p className="mt-2 max-w-2xl text-stone">
        Это то, что человек видит за первые пять секунд. Главное правило: из заголовка должно быть сразу понятно, что вы делаете, где и что нажать дальше.
      </p>

      <div className="mt-8">
        <HeroForm texts={texts} />
      </div>
    </div>
  );
}
