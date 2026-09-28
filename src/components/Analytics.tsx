import Script from 'next/script';
import { getSiteView } from '@/lib/content/view';

/**
 * Яндекс.Метрика.
 * Подключается только если в админке указан номер счётчика — иначе
 * на сайт не попадает ни одного лишнего байта.
 *
 * Скрипт грузится стратегией afterInteractive: он не задерживает
 * отрисовку страницы и не влияет на скорость первого экрана.
 */
export async function Analytics() {
  const { metrikaId } = await getSiteView();
  if (!metrikaId) return null;

  const id = Number(metrikaId);
  if (!Number.isFinite(id) || id <= 0) return null;

  return (
    <>
      <Script id="ym-init" strategy="afterInteractive">
        {`
(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();
for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
ym(${id}, "init", { defer: true, clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true });
window.__ymId = ${id};
        `}
      </Script>
      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${id}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
