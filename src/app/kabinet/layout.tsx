import type { Metadata } from 'next';
import { CabinetProvider } from '@/lib/cabinet/session';
import { CabinetShell } from '@/components/cabinet/CabinetShell';

/**
 * Кабинет живёт отдельно от публичного сайта: своя шапка, свой подвал,
 * никакой заставки и, главное, запрет на индексацию — личные страницы
 * не должны попадать ни в поиск, ни в карту сайта.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function KabinetLayout({ children }: { children: React.ReactNode }) {
  return (
    <CabinetProvider>
      <CabinetShell>{children}</CabinetShell>
    </CabinetProvider>
  );
}
