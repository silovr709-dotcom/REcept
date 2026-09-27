/**
 * ЕДИНЫЙ КОНФИГ САЙТА «РЕцепт»
 * ============================
 *
 * ВАЖНО: здесь хранятся ТОЛЬКО реальные данные.
 * Ничего не выдумано. Всё, чего мы пока не знаем, стоит как `null`
 * и помечено комментарием «TODO».
 *
 * Правило рендеринга: если значение `null` — блок/ссылка просто НЕ показывается
 * на сайте. Никаких «заглушек», «+7 (000) 000-00-00» и прочего мусора
 * посетитель не увидит.
 *
 * Чтобы канал связи появился на сайте — впишите значение и сохраните файл.
 */

export type ContactChannel = {
  /** Показывать ли канал. Вычисляется автоматически по наличию value. */
  id: 'phone' | 'telegram' | 'whatsapp' | 'vk' | 'email' | 'address';
  label: string;
  /** Что видит человек */
  value: string | null;
  /** Куда ведёт ссылка (tel:, https://t.me/..., mailto: и т.д.) */
  href: string | null;
  /** Короткое пояснение под каналом — снимает страх «сейчас будут продавать» */
  hint?: string;
};

/* ------------------------------------------------------------------ *
 * КОНТАКТЫ — ЗАПОЛНИТЕ ЭТОТ БЛОК
 * ------------------------------------------------------------------ */

/** TODO: реальный номер телефона, например '+7 900 000-00-00' */
const PHONE_DISPLAY: string | null = null;
/** TODO: тот же номер в формате для tel:, например '+79000000000' */
const PHONE_RAW: string | null = null;
/** TODO: username в Telegram без @, например 'recept_tver' */
const TELEGRAM_USERNAME: string | null = null;
/** TODO: номер для WhatsApp в международном формате без плюса, например '79000000000' */
const WHATSAPP_RAW: string | null = null;
/** TODO: адрес страницы или сообщества во ВКонтакте, например 'recept_tver' */
const VK_ID: string | null = null;
/** TODO: почта для заявок, например 'hello@recept-tver.ru' */
const EMAIL: string | null = null;
/** TODO: адрес шоурума / производства, если его можно публиковать */
const ADDRESS: string | null = null;
/** TODO: ссылка на карту (Яндекс.Карты), если есть адрес */
const ADDRESS_MAP_URL: string | null = null;
/** TODO: часы работы, если они фиксированы, например 'Пн–Сб, 10:00–19:00' */
export const WORKING_HOURS: string | null = null;

/* ------------------------------------------------------------------ */

export const site = {
  name: 'РЕцепт',
  legalName: 'Мебельное ателье «РЕцепт»',
  tagline: 'Семейное мебельное ателье в Твери',
  city: 'Тверь',
  region: 'Тверская область',
  /** TODO: при деплое заменить на реальный домен */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://recept-tver.ru',
  description:
    'Кухни и корпусная мебель на заказ в Твери. Роберт и Катя лично ведут проект: замер, бесплатное проектирование, схемы электрики, производство, доставка и сборка. Гарантия 24 месяца.',
  founders: ['Роберт', 'Катя'] as const,
} as const;

export const contacts: ContactChannel[] = [
  {
    id: 'phone',
    label: 'Позвонить',
    value: PHONE_DISPLAY,
    href: PHONE_RAW ? `tel:${PHONE_RAW}` : null,
    hint: 'Ответит Роберт или Катя — не колл-центр',
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
    value: PHONE_DISPLAY,
    href: WHATSAPP_RAW ? `https://wa.me/${WHATSAPP_RAW}` : null,
    hint: 'Можно сразу прислать фото помещения',
  },
  {
    id: 'vk',
    label: 'ВКонтакте',
    value: VK_ID ? 'Наши работы во ВКонтакте' : null,
    href: VK_ID ? `https://vk.com/${VK_ID}` : null,
    hint: 'Проекты и процесс работы',
  },
  {
    id: 'email',
    label: 'Почта',
    value: EMAIL,
    href: EMAIL ? `mailto:${EMAIL}` : null,
    hint: 'Для планировок и подробных задач',
  },
  {
    id: 'address',
    label: 'Адрес',
    value: ADDRESS,
    href: ADDRESS_MAP_URL,
    hint: undefined,
  },
];

/** Только те каналы, которые реально заполнены. */
export const activeContacts = contacts.filter((c) => c.value && c.href);

export const hasPhone = Boolean(PHONE_RAW && PHONE_DISPLAY);
export const phoneHref = PHONE_RAW ? `tel:${PHONE_RAW}` : null;
export const phoneDisplay = PHONE_DISPLAY;
export const hasAnyContact = activeContacts.length > 0;

/** Мессенджеры (для быстрых кнопок «написать») */
export const messengerContacts = activeContacts.filter((c) =>
  ['telegram', 'whatsapp', 'vk'].includes(c.id),
);

/* ------------------------------------------------------------------ *
 * НАВИГАЦИЯ
 * ------------------------------------------------------------------ */

export const navigation = [
  { href: '/kuhni-na-zakaz', label: 'Кухни' },
  { href: '/mebel-na-zakaz', label: 'Другие помещения' },
  { href: '/portfolio', label: 'Портфолио' },
  { href: '/materialy', label: 'Материалы' },
  { href: '/o-nas', label: 'О нас' },
  { href: '/kontakty', label: 'Контакты' },
] as const;

/* ------------------------------------------------------------------ *
 * РЕАЛЬНЫЕ УСЛОВИЯ РАБОТЫ
 * Источник: бриф владельцев. Ничего не добавлено «от себя».
 * ------------------------------------------------------------------ */

export const terms = {
  warrantyMonths: 24,
  payment: '50 / 50',
  designIsFree: true,
  electricalSchemesAreFree: true,
  deliveryAndAssemblyCity: 'Тверь',
} as const;
