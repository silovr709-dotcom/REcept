import type { MetadataRoute } from 'next';
import { getVisibleProjects } from '@/lib/content/store';
import { getSiteView } from '@/lib/content/view';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, projects] = await Promise.all([
    getSiteView(),
    getVisibleProjects(),
  ]);
  const now = new Date();

  const pages = [
    { url: '/', priority: 1, changeFrequency: 'monthly' },
    { url: '/kuhni-na-zakaz', priority: 0.9, changeFrequency: 'monthly' },
    { url: '/portfolio', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/mebel-na-zakaz', priority: 0.8, changeFrequency: 'monthly' },
    { url: '/materialy', priority: 0.7, changeFrequency: 'monthly' },
    { url: '/otzyvy', priority: 0.8, changeFrequency: 'weekly' },
    { url: '/o-nas', priority: 0.7, changeFrequency: 'monthly' },
    { url: '/kontakty', priority: 0.8, changeFrequency: 'monthly' },
  ] as const;

  const staticPages: MetadataRoute.Sitemap = pages.map((p) => ({
    url: `${site.url}${p.url}`,
    priority: p.priority,
    changeFrequency: p.changeFrequency,
    lastModified: now,
  }));

  const projectPages: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${site.url}/portfolio/${p.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...projectPages];
}
