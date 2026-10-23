import type { Metadata } from 'next';
import { PasswordRoute } from '@/components/cabinet/routes';

export const metadata: Metadata = {
  title: 'Восстановление пароля',
  description: 'Восстановление пароля от личного кабинета заказчика мебельного ателье «РЕцепт»: пришлём ссылку для смены пароля на вашу почту.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <PasswordRoute />;
}
