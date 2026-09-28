import { getContent } from '@/lib/content/store';
import { ProjectsForm } from '@/components/admin/forms/ProjectsForm';

export default async function AdminProjectsPage() {
  const projects = await getContent('projects');
  return (
    <div>
      <h1 className="font-display text-[1.75rem] text-ink sm:text-[2.125rem]">
        Проекты портфолио
      </h1>
      <p className="mt-2 max-w-2xl text-stone">
        Портфолио продаёт сильнее любого текста. Описывайте то, что видно на
        фотографии: компоновку, материалы, решения. Метраж, сроки и бюджет
        заполняйте только реальные — пустые поля просто не покажутся.
      </p>
      <div className="mt-8">
        <ProjectsForm projects={projects} />
      </div>
    </div>
  );
}
