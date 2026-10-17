import { SiteChrome } from '@/components/SiteChrome';

/**
 * Оболочка публичного сайта лежит в отдельном компоненте: её же
 * использует страница 404, которая по правилам App Router живёт
 * в корне приложения и макет этой группы не получает.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteChrome>{children}</SiteChrome>;
}
