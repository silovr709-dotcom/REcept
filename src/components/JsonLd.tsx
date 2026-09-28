import { getContent } from '@/lib/content/store';
import { getSiteView } from '@/lib/content/view';
import { projectAlt, projectDescription } from '@/lib/content/seo';
import type { ProjectItem } from '@/lib/content/types';

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Организация и локальный бизнес: помогает Яндексу и Google понять, кто мы и где. */
export async function OrganizationJsonLd() {
  const site = await getSiteView();

  const socials = [site.vkUrl, site.instagramUrl, site.yandex?.orgUrl].filter(
    (v): v is string => Boolean(v),
  );

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FurnitureStore',
        '@id': `${site.url}#organization`,
        name: site.legalName,
        alternateName: site.name,
        url: site.url,
        description: site.metaDescription,
        image: `${site.url}/og.jpg`,
        areaServed: { '@type': 'City', name: site.city },
        address: {
          '@type': 'PostalAddress',
          ...(site.address
            ? { streetAddress: site.address.replace(`${site.city}, `, '') }
            : {}),
          addressLocality: site.city,
          addressRegion: site.region,
          addressCountry: 'RU',
        },
        ...(site.phones.length
          ? { telephone: site.phones.map((p) => p.raw) }
          : {}),
        ...(site.email ? { email: site.email } : {}),
        ...(site.terms.furnitureSince
          ? { foundingDate: String(site.terms.furnitureSince) }
          : {}),
        ...(socials.length ? { sameAs: socials } : {}),
        ...(site.geo
          ? {
              geo: {
                '@type': 'GeoCoordinates',
                latitude: site.geo.lat,
                longitude: site.geo.lon,
              },
            }
          : {}),
        ...(site.addressMapUrl ? { hasMap: site.addressMapUrl } : {}),
        priceRange: 'Стоимость рассчитывается по проекту',
        // aggregateRating намеренно не размечаем: разметка чужих отзывов
        // на собственном сайте нарушает правила поисковиков
        makesOffer: [
          'Кухни на заказ',
          'Гардеробные на заказ',
          'Шкафы на заказ',
          'Корпусная мебель на заказ',
        ].map((name) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name, areaServed: site.city },
          warranty: {
            '@type': 'WarrantyPromise',
            durationOfWarranty: {
              '@type': 'QuantitativeValue',
              value: site.terms.warrantyMonths,
              unitCode: 'MON',
            },
          },
        })),
      }}
    />
  );
}

/**
 * Разметка вопросов.
 * `limit` обязан совпадать с тем, сколько вопросов человек реально видит
 * на странице: размечать скрытый контент — прямое нарушение правил
 * поисковиков, за которое разметку просто перестают показывать.
 */
export async function FaqJsonLd({ limit }: { limit?: number } = {}) {
  const { faq: all } = await getContent('texts');
  const faq = limit ? all.slice(0, limit) : all;
  if (faq.length === 0) return null;

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      }}
    />
  );
}

export async function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const site = await getSiteView();
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          item: `${site.url}${item.url}`,
        })),
      }}
    />
  );
}

/**
 * Разметка отдельного проекта.
 * Без неё поисковик видел на странице только хлебные крошки и карточку
 * организации — то есть не понимал, что крупная фотография относится
 * к конкретной работе. Для страниц, которые держатся на изображениях,
 * это упущенный трафик из поиска по картинкам.
 *
 * Тип CreativeWork, а не Product: цену мы не публикуем и товаром
 * проект не является — размечать его как товар было бы неправдой.
 */
export async function ProjectJsonLd({ project }: { project: ProjectItem }) {
  const site = await getSiteView();
  const url = `${site.url}/portfolio/${project.slug}`;

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        '@id': `${url}#project`,
        name: project.title,
        headline: project.title,
        description: projectDescription(project),
        url,
        inLanguage: 'ru-RU',
        creator: { '@id': `${site.url}#organization` },
        about: `${project.layout} кухня на заказ`,
        keywords: [
          'кухня на заказ Тверь',
          `${project.layout.toLowerCase()} кухня`,
          ...project.materials.slice(0, 3),
        ],
        material: project.materials,
        locationCreated: { '@type': 'City', name: site.city },
        image: {
          '@type': 'ImageObject',
          url: `${site.url}${project.image.src}`,
          width: project.image.width,
          height: project.image.height,
          caption: projectAlt(project),
        },
      }}
    />
  );
}
