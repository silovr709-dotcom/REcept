import { getSiteView } from '@/lib/content/view';
import { MetrikaConsent } from './MetrikaConsent';

/** Яндекс.Метрика подключается только для валидного ID счётчика. */
export async function Analytics() {
  const { metrikaId } = await getSiteView();
  if (!metrikaId) return null;

  const id = Number(metrikaId);
  if (!Number.isSafeInteger(id) || id <= 0) return null;

  return <MetrikaConsent id={id} />;
}
