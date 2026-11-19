import { assetUrl } from '@/lib/content/images';
import { LoaderController } from './LoaderController';
import { ProjectMosaic } from './ProjectMosaic';

const PROJECT_ATLAS = assetUrl('/images/loading/project-atlas.webp');

/**
 * КИНОЗАСТАВКА «РЕцепт»
 * =====================
 * Сначала весь экран заполняет мозаика из реальных кухонь ателье и их
 * деталей. Кадры сменяются медленнее и остаются на экране, затем постепенно собираются в логотип.
 * Это авторская механика монтажа — без копирования заставки или знака
 * какой-либо киностудии.
 *
 * Архив кадров собирается из reference/originals/kitchens и связанных
 * с проектами крупных планов. Визуализации и сторонние изображения сюда
 * не попадают.
 *
 * Первый монтаж длится около семи секунд, повторный — чуть меньше пяти.
 * reduced-motion не запускает движение, а CSS-failsafe снимает заставку,
 * если JavaScript не отработал.
 */
export function LoadingScreen() {
  return (
    <>
      <link
        rel="preload"
        as="image"
        href={PROJECT_ATLAS}
        type="image/webp"
        fetchPriority="high"
      />
      <div id="recept-loader" role="status" aria-label="Сайт загружается">
        <div className="loader-stage">
          <ProjectMosaic src={PROJECT_ATLAS} />
          <span className="loader-light-sweep" aria-hidden="true" />
          <div className="loader-copy">
            <p className="loader-wordmark-fallback" aria-hidden="true">
              <span>РЕ</span>цепт
            </p>
            <span className="loader-copy-rule" aria-hidden="true" />
            <p className="loader-tagline">
              Собираем пространство для вашей жизни
            </p>
            <p className="loader-return">С возвращением</p>
          </div>
        </div>
        <span className="sr-only">
          Загрузка сайта мебельного ателье «РЕцепт»
        </span>
      </div>
      <LoaderController />
    </>
  );
}
