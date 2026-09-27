import { activeContacts, addressValue, emailValue, phones, site, terms, vk, yandex } from '@/data/site';
import { faq } from '@/data/content';

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Организация + локальный бизнес: помогает Яндексу и Google понять, кто мы и где. */
export function OrganizationJsonLd() {
  const socials = [
    vk.url,
    yandex.orgUrl,
    ...activeContacts
      .filter((c) => ['telegram', 'instagram'].includes(c.id))
      .map((c) => c.href!),
  ].filter(Boolean);

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FurnitureStore',
        '@id': `${site.url}#organization`,
        name: site.legalName,
        alternateName: site.name,
        url: site.url,
        description: site.description,
        image: `${site.url}/og.jpg`,
        areaServed: { '@type': 'City', name: site.city },
        address: {
          '@type': 'PostalAddress',
          streetAddress: addressValue.replace(`${site.city}, `, ''),
          addressLocality: site.city,
          addressRegion: site.region,
          addressCountry: 'RU',
        },
        telephone: phones.map((p) => p.raw),
        email: emailValue,
        foundingDate: String(terms.furnitureSince),
        sameAs: socials,
        // aggregateRating намеренно не размечаем: разметка чужих отзывов
        // на собственном сайте нарушает правила поисковиков
        priceRange: 'Стоимость рассчитывается по проекту',
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
              value: terms.warrantyMonths,
              unitCode: 'MON',
            },
          },
        })),
      }}
    />
  );
}

export function FaqJsonLd() {
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

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
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
