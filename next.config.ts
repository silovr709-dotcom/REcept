import type { NextConfig } from 'next';

/**
 * СТАТИЧЕСКАЯ ВИТРИНА ДЛЯ GITHUB PAGES
 * ====================================
 * Обычный режим — полноценный сайт с сервером: форма заявок, админка,
 * оптимизация картинок на лету.
 *
 * Режим STATIC_EXPORT=1 собирает те же страницы в набор файлов, который
 * можно положить на GitHub Pages и открыть по постоянной ссылке. Сервера
 * там нет, поэтому приём заявок и админка в витрину не попадают — она
 * нужна только чтобы посмотреть дизайн.
 *
 * Адрес витрины лежит в подпапке репозитория, отсюда basePath.
 */
const isStatic = process.env.STATIC_EXPORT === '1';
const basePath = isStatic ? '/REcept' : '';

const nextConfig: NextConfig = {
  // Три режима сборки:
  // обычный — для разработки и `next start`;
  // STANDALONE=1 — самодостаточный сервер для контейнера и своего хостинга;
  // STATIC_EXPORT=1 — набор файлов для витрины без сервера.
  ...(isStatic
    ? { output: 'export' as const, basePath, trailingSlash: true }
    : process.env.STANDALONE === '1'
      ? { output: 'standalone' as const }
      : {}),
  env: { NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_DEMO: isStatic ? '1' : '' },
  reactStrictMode: true,
  poweredByHeader: false,
  // Превью запускается на поддомене e2b.app — разрешаем dev-запросы оттуда
  allowedDevOrigins: ['*.e2b.app'],
  compress: true,
  images: {
    // На статике оптимизатора нет — отдаём файлы как есть
    unoptimized: isStatic,
    // Современные форматы: AVIF даёт лучший вес, WebP — запасной вариант.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1600, 1920, 2048],
    imageSizes: [96, 128, 200, 256, 320, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
  experimental: {
    optimizePackageImports: [],
  },
  /**
   * Редиректы со старого сайта.
   * Если новый сайт встаёт на домен, где уже был старый, каждый его адрес
   * нужно перенаправить на новый — иначе накопленные позиции и внешние
   * ссылки упрутся в 404.
   *
   * Формат: { source: '/старый-адрес', destination: '/новый', permanent: true }
   * permanent: true — это код 301, «переехали навсегда»: поисковики
   * переносят вес страницы на новый адрес.
   */
  async redirects() {
    return [
      // Пример — раскомментируйте и замените на реальные адреса:
      // { source: '/kuhni', destination: '/kuhni-na-zakaz', permanent: true },
      // { source: '/contacts', destination: '/kontakty', permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },
};

export default nextConfig;
