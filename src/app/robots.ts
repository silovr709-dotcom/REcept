import type { MetadataRoute } from 'next';
import { getSiteView } from '@/lib/content/view';

/**
 * Отдаётся файлом на этапе сборки — это нужно и обычному режиму,
 * и статической витрине, где сервера нет вовсе.
 */
export const dynamic = 'force-static';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSiteView();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Личный кабинет — закрытая часть: ни индексации, ни попадания
        // в карту сайта. Страницы дополнительно помечены noindex.
        disallow: ['/api/', '/admin', '/kabinet'],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
