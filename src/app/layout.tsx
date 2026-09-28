import type { Metadata, Viewport } from 'next';
import './globals.css';
import { getSiteView } from '@/lib/content/view';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteView();

  return {
    metadataBase: new URL(site.url),
    title: {
      default: site.metaTitle,
      template: '%s — РЕцепт, Тверь',
    },
    description: site.metaDescription,
    applicationName: site.name,
    authors: [{ name: site.legalName }],
    keywords: [
      'кухни на заказ Тверь',
      'кухни под заказ Тверь',
      'корпусная мебель Тверь',
      'гардеробные Тверь',
      'шкафы на заказ Тверь',
      'мебель на заказ Тверь',
      'кухня на заказ недорого Тверь',
    ],
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      locale: 'ru_RU',
      url: site.url,
      siteName: site.name,
      title: site.metaTitle,
      description: site.metaDescription,
      images: [
        { url: '/og.jpg', width: 1200, height: 630, alt: site.metaTitle },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: site.metaTitle,
      description: site.metaDescription,
      images: ['/og.jpg'],
    },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: '32x32' },
      ],
      apple: '/apple-touch-icon.png',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    formatDetection: { telephone: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FDFBF7' },
    { media: '(prefers-color-scheme: dark)', color: '#16130F' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

/**
 * Скрипт до первой отрисовки: помечает повторный визит (короткая версия
 * заставки) и снимает класс no-js. Он крошечный и синхронный, поэтому
 * не влияет на скорость, но убирает мигание.
 */
const bootScript = `(function(){var d=document.documentElement;d.classList.remove('no-js');if(!document.startViewTransition){d.classList.add('no-vt')}d.dataset.loaderStart=Date.now();d.dataset.loading='true';try{d.dataset.loader=sessionStorage.getItem('recept:visited')?'short':'full'}catch(e){d.dataset.loader='full'}setTimeout(function(){d.removeAttribute('data-loading')},4500);})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className="no-js">
      <head>
        <link
          rel="preload"
          href="/fonts/manrope-cyrillic.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <noscript>
          <style>{`#recept-loader{display:none!important}`}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
