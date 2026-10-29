import type { Metadata } from 'next';
import { ProjectRoute } from '@/components/cabinet/routes';

export const metadata: Metadata = {
  title: 'Ваш проект',
  description: 'Страница проекта в личном кабинете ателье «РЕцепт»: документы, эскизы и согласования, этапы работ, расчёты и вопросы мастерам.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ProjectRoute />;
}
