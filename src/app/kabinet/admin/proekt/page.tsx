import type { Metadata } from 'next';
import { AdminProjectRoute } from '@/components/cabinet/routes';

export const metadata: Metadata = {
  title: 'Проект в работе',
  description: 'Рабочая карточка проекта в панели мебельного ателье «РЕцепт»: документы, эскизы, этапы, расчёты и доступы. Раздел закрыт для посторонних.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminProjectRoute />;
}
