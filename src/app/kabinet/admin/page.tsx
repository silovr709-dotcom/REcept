import type { Metadata } from 'next';
import { AdminRoute } from '@/components/cabinet/routes';

export const metadata: Metadata = {
  title: 'Панель',
  description: 'Рабочая панель сотрудников мебельного ателье «РЕцепт»: клиенты, проекты, документы и обращения. Раздел закрыт для посторонних.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminRoute />;
}
