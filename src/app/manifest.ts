import type { MetadataRoute } from 'next';
import { site } from '@/data/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'РЕцепт — кухни на заказ в Твери',
    short_name: 'РЕцепт',
    description: site.description,
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
