import type { MetadataRoute } from 'next';
import { getSiteView } from '@/lib/content/view';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSiteView();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin'],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
