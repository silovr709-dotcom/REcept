import Link from 'next/link';
import { Section, SectionHeading } from '../ui/Section';
import { Reveal } from '../ui/Reveal';
import { getSiteView } from '@/lib/content/view';

/**
 * КОРОТКО О ГЛАВНОМ
 * =================
 * Паспорт ателье сразу после первого экрана.
 *
 * Зачем он нужен. Главная страница длинная и устроена как рассказ:
 * кто мы → какая у вас боль → что делаем → работы → как считаем.
 * Рассказ честный, но у человека, который зашёл на тридцать секунд,
 * нет этих тридцати экранов. Ему нужно понять за один взгляд, чем
 * мы отличаемся от любого другого мебельного салона, — и только
 * потом решать, читать ли дальше.
 *
 * Почему именно так, а не «плашки с иконками». Иконка и слово
 * «Качество» ничего не сообщают: такие блоки стоят на каждом втором
 * сайте и читаются как шум. Здесь вместо них — короткая
 * спецификация: слева категория малыми прописными, справа
 * утверждение и одна строка расшифровки. Это тот же язык, которым
 * написан паспорт изделия или этикетка на фасаде, и он подходит
 * мастерской больше, чем маркетинговая сетка.
 *
 * Главное правило блока: здесь нет ни одного утверждения, которого
 * не было бы дальше на странице. Каждая строка — вход в свой раздел,
 * где то же самое разложено подробно. Поэтому строка целиком
 * кликабельна и ведёт к якорю: прочитал заголовок — провалился в
 * детали — вернулся.
 */

type Row = {
  id: string;
  label: string;
  claim: string;
  note: string;
  href: string;
  /** Что именно откроется по ссылке — подсказка под стрелкой */
  target: string;
};

const rows: Row[] = [
  {
    id: 'people',
    label: 'Кто делает',
    claim: 'Нас двое, и мы оба на вашем проекте',
    note: 'Роберт ведёт замер, производство и монтаж, Катя — проект и материалы. Между вами и кухней нет менеджера, который уволится через месяц.',
    href: '#o-nas',
    target: 'Роберт и Катя',
  },
  {
    id: 'years',
    label: 'Опыт',
    claim: 'Мебель с 2004 года, кухни на заказ — с 2009',
    note: 'Семейное дело в Твери. Следующий заказ почти всегда приходит от тех, кому мы уже что-то сделали, или от их знакомых.',
    href: '/o-nas',
    target: 'О нас',
  },
  {
    id: 'project',
    label: 'Проект',
    claim: 'Проект, визуализация и схемы электрики — 0 ₽',
    note: 'До договора вы ничего не платите и ничем не связаны: сначала смотрите, что получилось, и только потом решаете.',
    href: '#price',
    target: 'Стоимость',
  },
  {
    id: 'edits',
    label: 'Правки',
    claim: 'Перерисуем столько раз, сколько нужно',
    note: 'Пока кухня на бумаге, менять можно всё. Это бесплатно и честнее, чем молча собрать не то, что вы представляли.',
    href: '#process',
    target: 'Как проходит работа',
  },
  {
    id: 'materials',
    label: 'Материалы',
    claim: 'Называем марки, а не «проверенных поставщиков»',
    note: 'Egger, Ламарти, AGT, ARPA, Blum, Hettich, Titus. Список открыт — его можно сравнить с тем, что предлагают в другом месте.',
    href: '/materialy',
    target: 'Материалы',
  },
  {
    id: 'money',
    label: 'Деньги',
    claim: 'Оплата 50/50, без полной предоплаты',
    note: 'Вторая половина — когда кухня стоит у вас дома, собрана и принята. Смета расписана по строкам, без «прочих работ».',
    href: '#price',
    target: 'Стоимость',
  },
  {
    id: 'after',
    label: 'После сдачи',
    claim: 'Гарантия 24 месяца — и свои ошибки мы исправляем',
    note: 'Петли, доводчики, подгонка после усадки: приезжаем и чиним, не выясняя, кто виноват.',
    href: '#faq',
    target: 'Вопросы',
  },
  {
    id: 'proof',
    label: 'Репутация',
    claim: '5,0 на Яндекс Картах, 34 отзыва',
    note: 'Отзывы живые, с именами и подробностями, их можно открыть и прочитать целиком — вместе с теми, где нас хвалят за кривые стены соседа.',
    href: '#otzyvy',
    target: 'Отзывы',
  },
];

export async function Essentials() {
  const site = await getSiteView();
  const rating = site.rating;

  // Цифры рейтинга живут в админке: если владелец их поменяет,
  // строка про репутацию не должна остаться со старым числом.
  const list = rows.map((row) =>
    row.id === 'proof' && rating
      ? {
          ...row,
          claim: `${rating.value} на Яндекс Картах, ${rating.reviewsCount} отзыва`,
        }
      : row,
  );

  return (
    <Section tone="cream" id="korotko" aria-labelledby="essentials-title">
      <div className="container-page">
        <SectionHeading
          id="essentials-title"
          eyebrow="Коротко о главном"
          title="Восемь вещей, ради которых к нам возвращаются"
          lead="Это не обещания из шаблона — каждая строка дальше на странице разложена подробно. Нажмите на любую, чтобы сразу попасть в нужный раздел."
          stacked
        />

        <dl className="mt-12 grid gap-px border-t border-line bg-line sm:mt-16 lg:grid-cols-2">
          {list.map((row, i) => (
            <Reveal
              key={row.id}
              delay={Math.min(i, 6) * 40}
              className="drawer-item bg-cream"
            >
              <Link
                href={row.href}
                className="group flex h-full flex-col gap-3 px-1 py-7 transition-colors hover:bg-bone sm:px-7 sm:py-8"
              >
                <span className="label-xs text-gold">{row.label}</span>
                <dt className="font-display text-big leading-snug text-ink sm:text-sub">
                  {row.claim}
                </dt>
                <dd className="text-small leading-relaxed text-stone">
                  {row.note}
                </dd>
                <span className="mt-auto inline-flex items-center gap-2 pt-3 text-caption font-semibold uppercase tracking-[0.14em] text-stone transition-colors group-hover:text-gold">
                  {row.target}
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </dl>
      </div>
    </Section>
  );
}
