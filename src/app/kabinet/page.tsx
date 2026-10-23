import type { Metadata } from 'next';
import { HomeRoute } from '@/components/cabinet/routes';

export const metadata: Metadata = {
  title: 'Личный кабинет',
  description: 'Личный кабинет заказчика мебельного ателье «РЕцепт»: документы по проекту, эскизы, этапы работ и договорённости — всё в одном месте.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <HomeRoute />;
}
