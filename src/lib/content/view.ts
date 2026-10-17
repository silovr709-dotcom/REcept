import 'server-only';

import { cache } from 'react';
import { getContent } from './store';
import type { Phone, SiteContent } from './types';

/**
 * ПРЕДСТАВЛЕНИЕ САЙТА
 * ===================
 * Сырые настройки из админки превращаются здесь в готовый к показу набор:
 * какие каналы связи заполнены, как выглядят ссылки, что показывать в шапке.
 *
 * Правило прежнее: незаполненное поле — это отсутствующий блок,
 * а не заглушка вроде «+7 (000) 000-00-00».
 *
 * Результат сериализуем, поэтому его можно передать в клиентские компоненты.
 */

export type ContactChannel = {
  id: 'phone' | 'telegram' | 'whatsapp' | 'vk' | 'instagram' | 'email' | 'address';
  label: string;
  value: string;
  href: string;
  hint?: string;
};

export type SiteView = {
  name: string;
  legalName: string;
  city: string;
  region: string;
  url: string;
  metaTitle: string;
  metaDescription: string;

  phones: Phone[];
  primaryPhone: Phone | null;

  contacts: ContactChannel[];
  messengers: ContactChannel[];

  email: string | null;
  address: string | null;
  addressMapUrl: string | null;
  workingHours: string | null;

  vkUrl: string | null;
  vkGroupId: string | null;
  instagramUrl: string | null;
  metrikaId: string | null;
  geo: { lat: number; lon: number } | null;

  yandex: {
    orgId: string;
    orgName: string;
    orgUrl: string;
    reviewsUrl: string;
    widgetUrl: string;
    mapWidgetUrl: string;
  } | null;

  terms: {
    warrantyMonths: number;
    payment: string;
    furnitureSince: number | null;
    kitchensSince: number | null;
  };

  rating: {
    value: string;
    reviewsCount: number;
    scoresCount: number;
    checkedAt: string;
  } | null;

  navigation: { href: string; label: string }[];
};

function buildContacts(site: SiteContent): ContactChannel[] {
  const list: ContactChannel[] = [];
  const primary = site.phones[0];

  if (primary?.display && primary.raw) {
    list.push({
      id: 'phone',
      label: 'Позвонить',
      value: primary.display,
      href: `tel:${primary.raw}`,
      hint: 'Ответят Роберт или Катя — не колл-центр',
    });
  }
  if (site.telegramUsername) {
    list.push({
      id: 'telegram',
      label: 'Telegram',
      value: `@${site.telegramUsername}`,
      href: `https://t.me/${site.telegramUsername}`,
      hint: 'Удобно, если не хочется звонить',
    });
  }
  if (site.whatsappRaw) {
    list.push({
      id: 'whatsapp',
      label: 'WhatsApp',
      value: primary?.display ?? 'WhatsApp',
      href: `https://wa.me/${site.whatsappRaw}`,
      hint: 'Можно сразу прислать фото помещения',
    });
  }
  if (site.vkUrl) {
    list.push({
      id: 'vk',
      label: 'ВКонтакте',
      value: 'tver-kuhni.ru | Кухни | Тверь',
      href: site.vkUrl,
      hint: 'Проекты, видео с объектов и ответы на вопросы',
    });
  }
  if (site.instagramUrl) {
    list.push({
      id: 'instagram',
      label: 'Instagram',
      value: '@' + site.instagramUrl.replace(/\/+$/, '').split('/').pop(),
      href: site.instagramUrl,
      hint: 'Фото и короткие видео наших работ',
    });
  }
  if (site.email) {
    list.push({
      id: 'email',
      label: 'Почта',
      value: site.email,
      href: `mailto:${site.email}`,
      hint: 'Для планировок и подробных задач',
    });
  }
  if (site.address && site.addressMapUrl) {
    list.push({
      id: 'address',
      label: 'Адрес',
      value: site.address,
      href: site.addressMapUrl,
      hint: 'Здесь можно посмотреть образцы материалов',
    });
  }

  return list;
}

const NAVIGATION = [
  { href: '/kuhni-na-zakaz', label: 'Кухни' },
  { href: '/mebel-na-zakaz', label: 'Другие помещения' },
  { href: '/portfolio', label: 'Портфолио' },
  { href: '/materialy', label: 'Материалы' },
  { href: '/otzyvy', label: 'Отзывы' },
  { href: '/o-nas', label: 'О нас' },
  { href: '/kontakty', label: 'Контакты' },
];

export const getSiteView = cache(async (): Promise<SiteView> => {
  const [site, reviews] = await Promise.all([
    getContent('site'),
    getContent('reviews'),
  ]);

  const contacts = buildContacts(site);
  const visibleReviews = reviews.items.filter((r) => !r.hidden);
  const showRating = reviews.rating.show && visibleReviews.length > 0;

  const orgId = site.yandexOrgId;
  const orgSlug = 'retsept_kukhni';

  return {
    name: 'РЕцепт',
    legalName: 'Мебельное ателье «РЕцепт»',
    city: 'Тверь',
    region: 'Тверская область',
    url: site.url,
    metaTitle: site.metaTitle,
    metaDescription: site.metaDescription,

    phones: site.phones,
    primaryPhone: site.phones[0] ?? null,

    contacts,
    messengers: contacts.filter((c) =>
      ['telegram', 'whatsapp', 'vk', 'instagram'].includes(c.id),
    ),

    email: site.email,
    address: site.address,
    addressMapUrl: site.addressMapUrl,
    workingHours: site.workingHours,

    vkUrl: site.vkUrl,
    vkGroupId: site.vkGroupId,
    instagramUrl: site.instagramUrl,
    metrikaId: site.metrikaId || process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || null,
    geo:
      site.geoLat !== null && site.geoLon !== null
        ? { lat: site.geoLat, lon: site.geoLon }
        : null,

    yandex: orgId
      ? {
          orgId,
          orgName: site.yandexOrgName ?? 'Наша организация',
          orgUrl: `https://yandex.ru/maps/org/${orgSlug}/${orgId}`,
          reviewsUrl: `https://yandex.ru/maps/org/${orgSlug}/${orgId}/reviews`,
          widgetUrl: `https://yandex.ru/maps-reviews-widget/${orgId}?comments`,
          mapWidgetUrl: `https://yandex.ru/map-widget/v1/org/${orgId}/?indoorLevel=1&lang=ru_RU`,
        }
      : null,

    terms: {
      warrantyMonths: site.warrantyMonths,
      payment: site.payment,
      furnitureSince: site.furnitureSince,
      kitchensSince: site.kitchensSince,
    },

    rating: showRating
      ? {
          value: reviews.rating.value,
          reviewsCount: reviews.rating.reviewsCount,
          scoresCount: reviews.rating.scoresCount,
          checkedAt: reviews.rating.checkedAt,
        }
      : null,

    navigation: NAVIGATION,
  };
});
