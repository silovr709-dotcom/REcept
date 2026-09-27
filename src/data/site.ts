/**
 * ЕДИНЫЙ КОНФИГ САЙТА «РЕцепт»
 * ============================
 *
 * Здесь только реальные данные. Источники:
 * — бриф владельцев;
 * — сообщество ВКонтакте vk.com/tverkuhniru (контакты, руководители, история);
 * — карточка организации «Рецепт кухни» на Яндекс Картах (адрес, рейтинг).
 *
 * Правило рендеринга: если значение `null` — блок/ссылка просто НЕ показывается.
 * Никаких «+7 (000) 000-00-00» посетитель не увидит.
 */

export type ContactChannel = {
  id: 'phone' | 'telegram' | 'whatsapp' | 'vk' | 'instagram' | 'email' | 'address';
  label: string;
  /** Что видит человек */
  value: string | null;
  /** Куда ведёт ссылка (tel:, https://t.me/..., mailto: и т.д.) */
  href: string | null;
  /** Короткое пояснение — снимает страх «сейчас будут продавать» */
  hint?: string;
};

/* ------------------------------------------------------------------ *
 * ТЕЛЕФОНЫ
 * Порядок важен: первый номер показывается в шапке и мобильной панели.
 * ------------------------------------------------------------------ */

export type Phone = { display: string; raw: string; who: string | null };

export const phones: Phone[] = [
  { display: '+7 (910) 537-89-91', raw: '+79105378991', who: null },
  // Подтверждено карточкой руководителя во ВКонтакте
  { display: '+7 (910) 836-05-06', raw: '+79108360506', who: 'Роберт Шилов' },
  { display: '+7 (910) 835-17-49', raw: '+79108351749', who: 'Екатерина Шилова' },
];

const PRIMARY = phones[0];

/* ------------------------------------------------------------------ *
 * ОСТАЛЬНЫЕ КАНАЛЫ
 * ------------------------------------------------------------------ */

const VK_URL = 'https://vk.com/tverkuhniru';
const INSTAGRAM_URL = 'https://www.instagram.com/tver.kuhni.ru';
const EMAIL = 'tver-kuhni11@yandex.ru';
const ADDRESS = 'Тверь, проспект Калинина, 13А';
const ADDRESS_MAP_URL = 'https://yandex.ru/maps/-/CXQ3rO7y';

/** TODO: добавить, если появятся Telegram и WhatsApp для клиентов */
const TELEGRAM_USERNAME: string | null = null;
const WHATSAPP_RAW: string | null = null;

/**
 * TODO: часы работы.
 * На Яндекс Картах указано открытие в 10:00, полное расписание мы не знаем,
 * поэтому на сайте его не пишем — актуальное видно в карточке на карте.
 */
export const WORKING_HOURS: string | null = null;

/* ------------------------------------------------------------------ *
 * ОРГАНИЗАЦИЯ НА ЯНДЕКС КАРТАХ
 * ------------------------------------------------------------------ */

export const yandex = {
  orgId: '201220530462',
  orgName: 'Рецепт кухни',
  orgUrl: 'https://yandex.ru/maps/org/retsept_kukhni/201220530462',
  reviewsUrl: 'https://yandex.ru/maps/org/retsept_kukhni/201220530462/reviews',
  /** Официальный виджет отзывов — живые данные, без парсинга и без API-ключа */
  widgetUrl: 'https://yandex.ru/maps-reviews-widget/201220530462?comments',
} as const;

export const vk = {
  url: VK_URL,
  /** ID сообщества — нужен для встраивания видео */
  groupId: '87927252',
} as const;

/* ------------------------------------------------------------------ */

export const site = {
  name: 'РЕцепт',
  legalName: 'Мебельное ателье «РЕцепт»',
  tagline: 'Семейное мебельное ателье в Твери',
  city: 'Тверь',
  region: 'Тверская область',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tver-kuhni.ru',
  description:
    'Кухни и корпусная мебель на заказ в Твери. Роберт и Катя Шиловы лично ведут проект: замер, бесплатное проектирование, схемы электрики, доставка и сборка. Рейтинг 5,0 на Яндекс Картах. Гарантия 24 месяца.',
  founders: ['Роберт', 'Катя'] as const,
} as const;

export const contacts: ContactChannel[] = [
  {
    id: 'phone',
    label: 'Позвонить',
    value: PRIMARY.display,
    href: `tel:${PRIMARY.raw}`,
    hint: 'Ответят Роберт или Катя — не колл-центр',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    value: TELEGRAM_USERNAME ? `@${TELEGRAM_USERNAME}` : null,
    href: TELEGRAM_USERNAME ? `https://t.me/${TELEGRAM_USERNAME}` : null,
    hint: 'Удобно, если не хочется звонить',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    value: WHATSAPP_RAW ? PRIMARY.display : null,
    href: WHATSAPP_RAW ? `https://wa.me/${WHATSAPP_RAW}` : null,
    hint: 'Можно сразу прислать фото помещения',
  },
  {
    id: 'vk',
    label: 'ВКонтакте',
    value: 'tver-kuhni.ru | Кухни | Тверь',
    href: VK_URL,
    hint: 'Проекты, видео с объектов и ответы на вопросы',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    value: '@tver.kuhni.ru',
    href: INSTAGRAM_URL,
    hint: 'Фото и короткие видео наших работ',
  },
  {
    id: 'email',
    label: 'Почта',
    value: EMAIL,
    href: `mailto:${EMAIL}`,
    hint: 'Для планировок и подробных задач',
  },
  {
    id: 'address',
    label: 'Адрес',
    value: ADDRESS,
    href: ADDRESS_MAP_URL,
    hint: 'Здесь можно посмотреть образцы материалов',
  },
];

/** Только те каналы, которые реально заполнены. */
export const activeContacts = contacts.filter((c) => c.value && c.href);

export const hasPhone = true;
export const phoneHref = `tel:${PRIMARY.raw}`;
export const phoneDisplay = PRIMARY.display;
export const hasAnyContact = activeContacts.length > 0;

/** Мессенджеры и соцсети — для быстрых кнопок «написать» */
export const messengerContacts = activeContacts.filter((c) =>
  ['telegram', 'whatsapp', 'vk', 'instagram'].includes(c.id),
);

export const addressValue = ADDRESS;
export const addressMapUrl = ADDRESS_MAP_URL;
export const emailValue = EMAIL;

/* ------------------------------------------------------------------ *
 * НАВИГАЦИЯ
 * ------------------------------------------------------------------ */

export const navigation = [
  { href: '/kuhni-na-zakaz', label: 'Кухни' },
  { href: '/mebel-na-zakaz', label: 'Другие помещения' },
  { href: '/portfolio', label: 'Портфолио' },
  { href: '/materialy', label: 'Материалы' },
  { href: '/otzyvy', label: 'Отзывы' },
  { href: '/o-nas', label: 'О нас' },
  { href: '/kontakty', label: 'Контакты' },
] as const;

/* ------------------------------------------------------------------ *
 * РЕАЛЬНЫЕ УСЛОВИЯ И ФАКТЫ
 * Источники: бриф владельцев, сообщество ВКонтакте, Яндекс Карты.
 * ------------------------------------------------------------------ */

export const terms = {
  warrantyMonths: 24,
  payment: '50 / 50',
  designIsFree: true,
  electricalSchemesAreFree: true,
  deliveryAndAssemblyCity: 'Тверь',
  /** «Наша семья занимается мебелью в Твери с 2004 года» — vk.com/tverkuhniru */
  furnitureSince: 2004,
  /** «...индивидуальными кухнями с 2009-го» — там же */
  kitchensSince: 2009,
} as const;
