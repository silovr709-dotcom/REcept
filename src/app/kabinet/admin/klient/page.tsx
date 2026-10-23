import type { Metadata } from 'next';
import { AdminClientRoute } from '@/components/cabinet/routes';

export const metadata: Metadata = {
  title: 'Клиент',
  description: 'Карточка клиента в рабочей панели мебельного ателье «РЕцепт»: проекты, контакты и доступ в кабинет. Раздел закрыт для посторонних.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminClientRoute />;
}
