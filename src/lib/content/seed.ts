import type { StaticImageData } from 'next/image';

import heroImage from '@public/images/kitchens/kitchen-01.webp';
import { projects as seedProjects } from '@/data/projects';
import { details as seedDetails } from '@/data/details';
import { vkVideos } from '@/data/videos';
import { rating as seedRating, reviews as seedReviews } from '@/data/reviews';
import {
  addressMapUrl,
  addressValue,
  emailValue,
  phones as seedPhones,
  site as seedSite,
  terms as seedTerms,
  vk as seedVk,
  yandex as seedYandex,
  contacts as seedContacts,
  WORKING_HOURS,
} from '@/data/site';
import {
  advantages,
  faq,
  objections,
  painVsRelief,
  priceExplanation,
  priceFactors,
  processSteps,
  services,
  team,
} from '@/data/content';
import type { ContentShape, ImageRef } from './types';

/**
 * ЗАВОДСКИЕ НАСТРОЙКИ
 * ===================
 * То, что было написано в коде до появления админки. Используется один раз:
 * при первом запуске store переносит эти данные в `content/*.json`,
 * и дальше единственным источником правды становятся JSON-файлы.
 *
 * Трогать этот файл не нужно — всё меняется через админку.
 */

/**
 * Статический импорт даёт готовые размеры и размытую заглушку, но его путь
 * (`/_next/static/media/...`) меняется при каждой сборке. Поэтому в данные
 * записываем стабильный публичный путь, а из импорта берём только метаданные.
 */
function toRef(img: StaticImageData, publicPath: string): ImageRef {
  return {
    src: publicPath,
    width: img.width,
    height: img.height,
    blurDataURL: img.blurDataURL ?? '',
  };
}

/**
 * Восстанавливает исходное имя файла из пути, который Next выдал
 * статическому импорту: `/_next/static/media/kitchen-01.ccb2cc7d.webp`.
 */
function imageFileName(img: StaticImageData): string {
  const base = img.src.split('/').pop() ?? '';
  const parts = base.split('.');
  if (parts.length >= 3) {
    // убираем хеш, который Next вставляет перед расширением
    parts.splice(parts.length - 2, 1);
  }
  return parts.join('.');
}

export function buildSeed(): ContentShape {
  return {
    site: {
      url: seedSite.url,
      phones: seedPhones.map((p) => ({ ...p })),
      email: emailValue,
      address: addressValue,
      addressMapUrl,
      workingHours: WORKING_HOURS,
      vkUrl: seedVk.url,
      vkGroupId: seedVk.groupId,
      instagramUrl:
        seedContacts.find((c) => c.id === 'instagram')?.href ?? null,
      telegramUsername: null,
      whatsappRaw: null,
      yandexOrgId: seedYandex.orgId,
      yandexOrgName: seedYandex.orgName,
      // Взято из карточки организации на Яндекс Картах
      geoLat: 56.853292,
      geoLon: 35.870186,
      metrikaId: null,
      warrantyMonths: seedTerms.warrantyMonths,
      payment: seedTerms.payment,
      furnitureSince: seedTerms.furnitureSince,
      kitchensSince: seedTerms.kitchensSince,
      metaTitle: 'Кухни на заказ в Твери — мебельное ателье «РЕцепт»',
      metaDescription: seedSite.description,
    },

    texts: {
      hero: {
        image: toRef(heroImage, '/images/kitchens/kitchen-01.webp'),
        eyebrow: 'Семейное мебельное ателье · Тверь',
        title: 'Кухни на заказ',
        titleSecondLine: 'в Твери',
        lead: 'Роберт и Катя лично ведут проект — от первого замера до момента, когда вы впервые готовите на новой кухне. Проектирование, визуализация и схемы электрики бесплатно.',
        primaryCta: 'Рассчитать мою кухню',
        secondaryCta: 'Посмотреть проекты',
        reassurance:
          'Без обязательств. Сначала обсудим задачу и поймём, что вам действительно нужно.',
        stats: [
          {
            big: `с ${seedTerms.furnitureSince}`,
            small: `семья делает мебель в Твери, кухни на заказ — с ${seedTerms.kitchensSince}`,
          },
          { big: '24', small: 'месяца гарантии на изделие' },
          { big: '0 ₽', small: 'проект, визуализация и схемы электрики' },
          { big: '50/50', small: 'оплата — без полной предоплаты' },
        ],
      },

      headache: {
        eyebrow: 'Зачем мы вообще нужны',
        title:
          'Чтобы получить хорошую кухню, не нужно становиться специалистом по кухням',
        lead: 'Обычно человек оказывается один посередине: между мебельщиком, прорабом, электриком, сантехником и сборщиками. Каждый отвечает за свой кусок, а за результат в целом — никто. Мы забираем эту работу себе.',
        pains: [...painVsRelief.pains],
        reliefs: [...painVsRelief.reliefs],
      },

      services: services.map((s) => ({ ...s })),
      advantages: advantages.map((a) => ({
        id: a.id,
        title: a.title,
        benefit: a.benefit,
        accent: 'accent' in a ? Boolean(a.accent) : false,
      })),
      processSteps: processSteps.map((s) => ({ ...s })),

      timing: {
        title: 'Чем раньше начат проект кухни, тем больше решений ещё возможно',
        lead: 'Это единственная честная причина не откладывать. Никаких «скидок только сегодня» у нас нет и не будет — есть только последовательность работ, которую нельзя запустить назад.',
        stages: [
          {
            stage: 'До ремонта',
            mark: 'Лучший момент',
            best: true,
            text: 'Кухня проектируется первой, а ремонт подстраивается под неё. Мы передаём вашему электрику схему выводов, а плиточнику — размеры фартука. Возможны любые решения: встроенная техника, скрытая вытяжка, подсветка, нестандартные высоты.',
          },
          {
            stage: 'Во время ремонта',
            mark: 'Ещё не поздно',
            best: false,
            text: 'Успеваем скорректировать электрику и подрезать плитку под нужные размеры, если работы ещё не закончены. Часть решений может потребовать переделок — обсудим, что имеет смысл, а что нет.',
          },
          {
            stage: 'Ремонт закончен',
            mark: 'Тоже делаем',
            best: false,
            text: 'Работаем по факту: подстраиваем проект под существующие розетки, выводы и отделку. Вариантов меньше, но хорошая кухня всё равно получается — просто задача становится инженернее.',
          },
        ],
      },

      objections: objections.map((o) => ({ ...o })),
      faq: faq.map((f) => ({ ...f })),

      price: {
        headline: priceExplanation.headline,
        body: [...priceExplanation.body],
        guarantees: [...priceExplanation.guarantees],
        factors: priceFactors.map((f) => ({ ...f })),
      },

      team: team.map((t) => ({
        name: t.name,
        fullName: t.fullName,
        role: t.role,
        bio: t.bio,
        photo: null,
        vk: t.vk,
      })),

      founders: {
        title: 'Вы всегда знаете, кто отвечает за вашу кухню',
        paragraphs: [
          `«РЕцепт» — семейное дело. Наша семья занимается мебелью в Твери с ${seedTerms.furnitureSince} года, а индивидуальными кухнями — с ${seedTerms.kitchensSince}-го. Здесь нет отдела продаж и менеджера, который уволится через месяц: есть Роберт и Катя, которые ведут проект от первого разговора до сборки и остаются на связи после.`,
          'Поэтому мы не можем позволить себе сделать плохо: следующий заказ к нам приходит от тех, кому мы уже что-то сделали, и от их знакомых. Это не маркетинговая позиция — это просто способ работать, когда за каждым проектом стоит твоя фамилия.',
        ],
      },
    },

    projects: seedProjects.map((p) => ({
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      image: toRef(p.image, `/images/kitchens/${imageFileName(p.image)}`),
      alt: p.alt,
      shape: p.shape,
      category: p.category,
      layout: p.layout,
      materials: [...p.materials],
      solutions: p.solutions.map((s) => ({ ...s })),
      rationale: p.rationale,
      detailIds: [...p.detailIds],
      area: p.area,
      term: p.term,
      budget: p.budget,
      clientStory: p.clientStory,
      hidden: false,
    })),

    details: seedDetails.map((d) => ({
      id: d.id,
      image: toRef(d.image, `/images/details/${d.id}.webp`),
      title: d.title,
      note: d.note,
      project: d.project,
      projectTitle: d.projectTitle,
      alt: d.alt,
      hidden: false,
    })),

    reviews: {
      rating: { ...seedRating, show: true },
      items: seedReviews.map((r) => ({ ...r, hidden: false })),
    },

    videos: vkVideos.map((v) => ({ ...v, poster: null, hidden: false })),
  };
}
