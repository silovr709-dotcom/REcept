import type { MetadataRoute } from 'next';
import {
  contentUpdatedAt,
  getVisibleDetails,
  getVisibleProjects,
} from '@/lib/content/store';
import { getSiteView } from '@/lib/content/view';

/**
 * Отдаётся файлом на этапе сборки — это нужно и обычному режиму,
 * и статической витрине, где сервера нет вовсе.
 */
export const dynamic = 'force-static';

/**
 * КАРТА САЙТА
 * ===========
 * Два решения, которые заметно влияют на выдачу:
 *
 * 1. Картинки. Кухни ищут глазами, и «Яндекс.Картинки» для мебели —
 *    отдельный канал трафика. Поэтому к страницам прикладываются
 *    абсолютные ссылки на фотографии.
 *
 * 2. Честные даты. Раньше здесь стояла текущая дата: карта сайта уверяла,
 *    что все страницы обновились только что. Поисковики такому не верят,
 *    и сигнал обесценивается. Теперь дата берётся из времени изменения
 *    файлов с контентом — то есть меняется ровно тогда, когда контент
 *    действительно правили в админке.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, projects, details] = await Promise.all([
    getSiteView(),
    getVisibleProjects(),
    getVisibleDetails(),
  ]);

  const [textsAt, projectsAt, detailsAt, reviewsAt, siteAt] = await Promise.all([
    contentUpdatedAt('texts'),
    contentUpdatedAt('projects'),
    contentUpdatedAt('details'),
    contentUpdatedAt('reviews'),
    contentUpdatedAt('site'),
  ]);

  const abs = (path: string) => `${site.url}${path}`;
  const newest = (...dates: Date[]) =>
    new Date(Math.max(...dates.map((d) => d.getTime())));

  const projectImages = projects.map((p) => abs(p.image.src));
  const detailImages = details.map((d) => abs(d.image.src));

  const pages: MetadataRoute.Sitemap = [
    {
      url: abs('/'),
      priority: 1,
      changeFrequency: 'monthly',
      lastModified: newest(textsAt, projectsAt, siteAt),
      images: projectImages.slice(0, 6),
    },
    {
      url: abs('/kuhni-na-zakaz'),
      priority: 0.9,
      changeFrequency: 'monthly',
      lastModified: newest(textsAt, projectsAt),
      images: projectImages.slice(0, 6),
    },
    {
      url: abs('/portfolio'),
      priority: 0.9,
      changeFrequency: 'weekly',
      lastModified: projectsAt,
      images: projectImages,
    },
    {
      url: abs('/mebel-na-zakaz'),
      priority: 0.8,
      changeFrequency: 'monthly',
      lastModified: textsAt,
      images: detailImages.slice(0, 6),
    },
    {
      url: abs('/materialy'),
      priority: 0.7,
      changeFrequency: 'monthly',
      lastModified: newest(textsAt, detailsAt),
      images: detailImages,
    },
    {
      url: abs('/otzyvy'),
      priority: 0.8,
      changeFrequency: 'weekly',
      lastModified: reviewsAt,
    },
    {
      url: abs('/o-nas'),
      priority: 0.7,
      changeFrequency: 'monthly',
      lastModified: textsAt,
    },
    {
      url: abs('/kontakty'),
      priority: 0.8,
      changeFrequency: 'monthly',
      lastModified: siteAt,
    },
  ];

  const projectPages: MetadataRoute.Sitemap = projects.map((project) => {
    const own = details
      .filter((d) => project.detailIds.includes(d.id))
      .map((d) => abs(d.image.src));

    return {
      url: abs(`/portfolio/${project.slug}`),
      lastModified: projectsAt,
      changeFrequency: 'monthly',
      priority: 0.6,
      images: [abs(project.image.src), ...own],
    };
  });

  return [...pages, ...projectPages];
}
