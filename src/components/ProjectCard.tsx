import Image from 'next/image';
import { ProjectOpenLink } from './ProjectOpenLink';
import type { ProjectItem } from '@/lib/content/types';
import { projectAlt } from '@/lib/content/seo';
import { assetUrl, fitRatio } from '@/lib/content/images';

const aspect: Record<ProjectItem['shape'], string> = {
  landscape: 'aspect-4/3',
  portrait: 'aspect-4/5',
  panorama: 'aspect-16/9',
};

export function ProjectCard({
  project,
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1023px) 50vw, 33vw',
  className = '',
  ratio,
}: {
  project: ProjectItem;
  priority?: boolean;
  sizes?: string;
  className?: string;
  ratio?: string;
}) {
  return (
    <ProjectOpenLink
      href={`/portfolio/${project.slug}`}
      className={`group hinge relative block ${className}`}
    >
      <div
        className={`media-reveal hinge-panel relative overflow-hidden rounded-md bg-sand ${fitRatio(project.image, ratio ?? aspect[project.shape])}`}
      >
        <Image
          src={assetUrl(project.image.src)}
          alt={projectAlt(project)}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          placeholder={project.image.blurDataURL ? 'blur' : 'empty'}
          blurDataURL={project.image.blurDataURL || undefined}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-ink/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        <span className="absolute left-0 top-0 bg-cream/95 px-3 py-1.5 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-ink backdrop-blur-sm">
          {project.layout}
        </span>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-[1.125rem] text-ink transition-colors group-hover:text-navy sm:text-[1.25rem]">
            {project.title}
          </h3>
          <p className="mt-1 text-[0.875rem] leading-snug text-stone">
            {project.summary}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="mt-1.5 shrink-0 text-navy opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path
              d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </ProjectOpenLink>
  );
}
