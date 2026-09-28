import Image from 'next/image';
import Link from 'next/link';
import type { ProjectItem } from '@/lib/content/types';

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
    <Link
      href={`/portfolio/${project.slug}`}
      className={`group block ${className}`}
    >
      <div
        className={`relative overflow-hidden rounded-md bg-sand ${ratio ?? aspect[project.shape]}`}
      >
        <Image
          src={project.image.src}
          alt={project.alt}
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
        <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-wider text-ink backdrop-blur-sm">
          {project.layout}
        </span>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-[1.125rem] text-ink transition-colors group-hover:text-brass sm:text-[1.25rem]">
            {project.title}
          </h3>
          <p className="mt-1 text-[0.875rem] leading-snug text-stone">
            {project.summary}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="mt-1.5 shrink-0 text-brass opacity-0 transition-opacity duration-300 group-hover:opacity-100"
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
    </Link>
  );
}
