import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LoadingScreen } from '@/components/LoadingScreen';
import { LeadModalProvider } from '@/components/LeadModal';
import { MobileActionBar } from '@/components/MobileActionBar';
import { SiteProvider } from '@/components/SiteProvider';
import { OrganizationJsonLd } from '@/components/JsonLd';
import { Analytics } from '@/components/Analytics';
import { FurnitureNavigation } from '@/components/FurnitureNavigation';
import { getSiteView } from '@/lib/content/view';

/**
 * Оболочка публичного сайта: заставка, шапка, подвал, мобильная панель.
 * Админка живёт в своей группе маршрутов и этой оболочки не получает —
 * поэтому в панели нет ни заставки, ни мобильной кнопки «Рассчитать кухню».
 */
export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getSiteView();

  return (
    <>
      <LoadingScreen />

      {/* Прогресс прокрутки: чистый CSS, без обработчиков скролла */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-95 h-[2px]"
      >
        <div className="scroll-progress h-full w-full bg-linear-to-r from-brass/0 via-brass to-brasslight" />
      </div>

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-200 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-cream"
      >
        Перейти к содержанию
      </a>

      <SiteProvider value={site}>
        <LeadModalProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <MobileActionBar />
        </LeadModalProvider>
      </SiteProvider>

      <FurnitureNavigation />
      <OrganizationJsonLd />
      <Analytics />
    </>
  );
}
