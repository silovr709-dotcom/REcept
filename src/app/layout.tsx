import type { Metadata, Viewport } from 'next';

/*
  ШРИФТЫ ИЗДАНИЯ
  ==============
  Антиква Cormorant Garamond для заголовков и Golos Text для текста.
  Берутся из пакетов @fontsource: файлы попадают в сборку, хэшируются
  и отдаются с того же домена — никаких запросов к Google Fonts, из-за
  которых первый экран ждал бы чужой сервер.

  Подключены только кириллица и латиница нужных начертаний: антиква
  в светлом (300), обычном (400), его курсиве и среднем (500), текст
  в 400, 500 и 600. Каждый лишний файл — это задержка перед первой
  буквой, поэтому жирных и экзотических начертаний здесь нет.
*/
import '@fontsource/cormorant-garamond/cyrillic-300.css';
import '@fontsource/cormorant-garamond/cyrillic-400.css';
import '@fontsource/cormorant-garamond/cyrillic-400-italic.css';
import '@fontsource/cormorant-garamond/cyrillic-500.css';
import '@fontsource/cormorant-garamond/latin-300.css';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/golos-text/cyrillic-400.css';
import '@fontsource/golos-text/cyrillic-500.css';
import '@fontsource/golos-text/cyrillic-600.css';
import '@fontsource/golos-text/latin-400.css';
import '@fontsource/golos-text/latin-500.css';

import './globals.css';
import { getSiteView } from '@/lib/content/view';
import { assetUrl } from '@/lib/content/images';
import { fontVariables } from './fonts';

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
        { url: assetUrl('/favicon.svg'), type: 'image/svg+xml' },
        { url: assetUrl('/favicon.ico'), sizes: '32x32' },
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
    { media: '(prefers-color-scheme: light)', color: '#FAF9F7' },
    { media: '(prefers-color-scheme: dark)', color: '#101C2E' },
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
const bootScript = `(function(){var d=document.documentElement;d.classList.remove('no-js');if(!document.startViewTransition){d.classList.add('no-vt')}d.dataset.loaderStart=Date.now();d.dataset.loading='true';try{d.dataset.loader=sessionStorage.getItem('recept:visited')?'short':'full'}catch(e){d.dataset.loader='full'}setTimeout(function(){d.removeAttribute('data-loading')},4500);try{console.log('%cРЕцепт','font:700 32px/1.1 Manrope,sans-serif;color:#101c2e;background:#faf9f7;padding:14px 18px');console.log('%cКухни на заказ в Твери. Открыли консоль — значит, вы либо разработчик, либо очень любопытный человек. И то и другое нам нравится.\\n\\nЭтот сайт собран руками, без конструктора и шаблона. Кухни, кстати, тоже.','color:#63666e;font:14px/1.6 Manrope,sans-serif')}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`no-js ${fontVariables}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <noscript>
          <style>{`#recept-loader{display:none!important}`}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
