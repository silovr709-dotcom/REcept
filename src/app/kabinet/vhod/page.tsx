import type { Metadata } from 'next';
import { SignInRoute } from '@/components/cabinet/routes';

export const metadata: Metadata = {
  title: 'Вход в кабинет',
  description: 'Вход в личный кабинет заказчика мебельного ателье «РЕцепт» в Твери: доступ к документам, эскизам и этапам вашего проекта.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <SignInRoute />;
}
