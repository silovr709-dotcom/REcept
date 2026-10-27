import { getContent } from '@/lib/content/store';
import { DetailsForm } from '@/components/admin/forms/DetailsForm';

export default async function AdminDetailsPage() {
  const [details, projects] = await Promise.all([
    getContent('details'),
    getContent('projects'),
  ]);
  return (
    <div>
      <h1 className="font-display text-head text-ink sm:text-title">
        Детали и фактуры
      </h1>
      <p className="mt-2 max-w-2xl text-stone">
        Крупные планы: профиль-ручка, кромка столешницы, подсветка, стык фактур.
        Именно по ним видно, что мебель делалась под конкретное помещение, а не
        куплена в магазине. Кадры показываются на главной, в материалах и на
        страницах проектов.
      </p>
      <div className="mt-8">
        <DetailsForm details={details} projects={projects} />
      </div>
    </div>
  );
}
