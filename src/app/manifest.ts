import type { MetadataRoute } from 'next';
import { getSiteView } from '@/lib/content/view';

/**
 * Отдаётся файлом на этапе сборки — это нужно и обычному режиму,
 * и статической витрине, где сервера нет вовсе.
 */
export const dynamic = 'force-static';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const site = await getSiteView();
  return {
    name: 'РЕцепт — кухни на заказ в Твери',
    short_name: 'РЕцепт',
    description: site.metaDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#16130F',
    theme_color: '#FDFBF7',
    lang: 'ru',
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
