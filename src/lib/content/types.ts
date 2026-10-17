/**
 * ТИПЫ РЕДАКТИРУЕМОГО КОНТЕНТА
 * ============================
 * Всё, что владельцы могут менять через админку, описано здесь.
 * Данные лежат в JSON-файлах в папке `content/`, картинки — в `public/uploads/`.
 *
 * Почему не база данных: сайт небольшой, хостинг может быть любым, а JSON
 * можно открыть, прочитать глазами, положить в git и восстановить из бэкапа
 * без специальных инструментов.
 */

/**
 * Ссылка на изображение вместе с размерами и размытой заглушкой.
 * Размеры нужны, чтобы страница не «прыгала» при загрузке, а blurDataURL —
 * чтобы вместо пустого места сразу был мягкий превью-кадр.
 * Всё это считается один раз при загрузке файла.
 */
export type ImageRef = {
  src: string;
  width: number;
  height: number;
  blurDataURL: string;
};

export type Phone = {
  display: string;
  raw: string;
  who: string | null;
};

export type SiteContent = {
  /** Домен сайта — влияет на canonical, sitemap и превью в мессенджерах */
  url: string;
  phones: Phone[];
  email: string | null;
  address: string | null;
  addressMapUrl: string | null;
  workingHours: string | null;
  vkUrl: string | null;
  vkGroupId: string | null;
  instagramUrl: string | null;
  telegramUsername: string | null;
  whatsappRaw: string | null;
  yandexOrgId: string | null;
  yandexOrgName: string | null;
  /** Координаты для микроразметки: помогают локальному поиску и картам */
  geoLat: number | null;
  geoLon: number | null;
  /** Номер счётчика Яндекс.Метрики. Пусто — аналитика не подключается */
  metrikaId: string | null;
  /** Условия работы — показываются на первом экране и в блоке цены */
  warrantyMonths: number;
  payment: string;
  furnitureSince: number | null;
  kitchensSince: number | null;
  /** SEO */
  metaTitle: string;
  metaDescription: string;
};

export type HeroContent = {
  /** Главный кадр первого экрана */
  image: ImageRef | null;
  eyebrow: string;
  title: string;
  titleSecondLine: string;
  lead: string;
  primaryCta: string;
  secondaryCta: string;
  reassurance: string;
  stats: { big: string; small: string }[];
};

export type Advantage = {
  id: string;
  title: string;
  benefit: string;
  accent?: boolean;
};

export type ProcessStep = {
  n: string;
  title: string;
  text: string;
  yourEffort: string;
};

export type Objection = { fear: string; answer: string };

export type FaqItem = { q: string; a: string };

export type PriceFactor = { title: string; text: string };

export type TeamMember = {
  name: string;
  fullName: string;
  role: string | null;
  bio: string | null;
  photo: ImageRef | null;
  vk: string | null;
};

export type ServiceItem = {
  id: string;
  title: string;
  text: string;
  href: string;
};

export type TimingStage = {
  stage: string;
  mark: string;
  best: boolean;
  text: string;
};

export type TextsContent = {
  hero: HeroContent;
  headache: {
    eyebrow: string;
    title: string;
    lead: string;
    pains: string[];
    reliefs: string[];
  };
  services: ServiceItem[];
  advantages: Advantage[];
  processSteps: ProcessStep[];
  timing: { title: string; lead: string; stages: TimingStage[] };
  objections: Objection[];
  faq: FaqItem[];
  price: {
    headline: string;
    body: string[];
    guarantees: string[];
    factors: PriceFactor[];
  };
  team: TeamMember[];
  founders: { title: string; paragraphs: string[] };
};

export type ProjectItem = {
  slug: string;
  title: string;
  summary: string;
  image: ImageRef;
  alt: string;
  shape: 'landscape' | 'portrait' | 'panorama';
  category: string;
  layout: 'Прямая' | 'Угловая' | 'П-образная' | 'С островом';
  materials: string[];
  solutions: { title: string; text: string }[];
  rationale: string;
  detailIds: string[];
  area: string | null;
  term: string | null;
  budget: string | null;
  clientStory: string | null;
  /** Скрытые проекты не показываются на сайте, но не удаляются */
  hidden?: boolean;
};

export type DetailItem = {
  id: string;
  image: ImageRef;
  title: string;
  note: string;
  project: string;
  projectTitle: string;
  alt: string;
  hidden?: boolean;
};

export type ReviewItem = {
  author: string | null;
  date: string;
  highlight: string;
  text: string;
  hidden?: boolean;
};

export type ReviewsContent = {
  rating: {
    value: string;
    reviewsCount: number;
    scoresCount: number;
    source: string;
    checkedAt: string;
    /** Показывать ли рейтинг на сайте */
    show: boolean;
  };
  items: ReviewItem[];
};

export type VideoItem = {
  id: string;
  title: string | null;
  duration: string;
  published: string;
  /** Кадр-превью: пока не нажали, сторонний плеер не грузится */
  poster?: ImageRef | null;
  hidden?: boolean;
};

export type ContentShape = {
  site: SiteContent;
  texts: TextsContent;
  projects: ProjectItem[];
  details: DetailItem[];
  reviews: ReviewsContent;
  videos: VideoItem[];
};

export type ContentKey = keyof ContentShape;
