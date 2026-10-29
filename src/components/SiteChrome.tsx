import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LoadingScreen } from '@/components/LoadingScreen';
import { LeadModalProvider } from '@/components/LeadModal';
import { MobileActionBar } from '@/components/MobileActionBar';
import { SiteProvider } from '@/components/SiteProvider';
import { OrganizationJsonLd } from '@/components/JsonLd';
import { Analytics } from '@/components/Analytics';
import { FurnitureNavigation } from '@/components/FurnitureNavigation';
import { PageEnter } from '@/components/PageEnter';
import { Carcass } from '@/components/Carcass';
import { getSiteView } from '@/lib/content/view';

/**
 * ОБОЛОЧКА ПУБЛИЧНОГО САЙТА
 * =========================
 * Заставка, шапка, подвал, мобильная панель, разметка организации.
 *
 * Вынесена из макета группы маршрутов в отдельный компонент ради
 * страницы 404: она живёт в корне приложения и макет группы не
 * получает. Раньше это означало, что самый растерянный посетитель
 * сайта оказывался на странице вообще без меню, телефона и подвала —
 * то есть без единого выхода, кроме кнопки «назад».
 *
 * Админка этой оболочки по-прежнему не получает.
 */
export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const site = await getSiteView();

  return (
    <>
      <LoadingScreen />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-200 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-cream"
      >
        Перейти к содержанию
      </a>

      <Carcass />

      <SiteProvider value={site}>
        <LeadModalProvider>
          <Header />
          <main id="main">
            <PageEnter>{children}</PageEnter>
          </main>
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
