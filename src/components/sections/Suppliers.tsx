import Link from 'next/link';
import { Reveal } from '../ui/Reveal';
import { Section, SectionHeading } from '../ui/Section';
import { MarginNote } from '../ui/MarginNote';
import { supplierRows } from '@/data/materials';

/**
 * РЕЕСТР ПОСТАВЩИКОВ
 * ==================
 * Раздел «Материалы» до этого рассказывал про материалы абстрактно:
 * «плёнка», «пластик», «камень» — и показывал макро-кадры с подписями
 * вроде «дерево и камень рядом». Для человека, который выбирает кухню
 * и сравнивает предложения, это пустая страница: у всех написано то
 * же самое.
 *
 * Конкретика — это названия. Увадрев, Ламарти, Egger, Kronospan —
 * проверяемые вещи: их можно загуглить, сравнить с тем, что предлагают
 * в другом салоне, и спросить на замере «а почему этот, а не тот».
 * Именно поэтому список стоит первым блоком страницы, а не в сноске.
 *
 * Набран как спецификация к проекту: слева позиция, справа марки
 * через волосяные разделители. Никаких логотипов — чужие логотипы на
 * своём сайте выглядят как попытка занять чужой авторитет.
 */
export function Suppliers({
  tone = 'bone',
  variant = 'full',
}: {
  tone?: 'cream' | 'bone' | 'ink';
  /**
   * `compact` — та же таблица без пояснений, для главной: там нужен
   * факт «вот марки», а разбор, чем одна плита отличается от другой,
   * ждёт на отдельной странице.
   */
  variant?: 'full' | 'compact';
}) {
  /*
   * Тёмный вариант. Раньше tone="ink" формально поддерживался, но все
   * цвета внутри были захардкожены под светлый фон: на синем пропадали
   * и заголовок, и сами марки — оставались одни золотые точки-разделители.
   */
  const dark = tone === 'ink';

  if (variant === 'compact') {
    return (
      <Section tone={tone} aria-labelledby="suppliers-short-title">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <SectionHeading
                id="suppliers-short-title"
                eyebrow="Материалы"
                title="Мы называем марки"
                tone={dark ? 'light' : 'dark'}
              />
              <p className={`mt-6 max-w-sm ${dark ? 'text-cream/70' : 'text-stone'}`}>
                Не «качественные материалы от проверенных поставщиков», а
                список, который можно проверить и сравнить с тем, что
                предлагают в другом месте.
              </p>
              <Link
                href="/materialy"
                className={`link-sweep mt-6 inline-flex min-h-11 items-center font-medium ${
                  dark ? 'text-goldsoft' : 'text-gold'
                }`}
              >
                Подробно о материалах
              </Link>
            </div>

            <dl className="lg:pt-2">
              {supplierRows.map((row, i) => (
                <Reveal
                  key={row.id}
                  delay={Math.min(i, 5) * 40}
                  className={`grid grid-cols-[11.5rem_1fr] gap-x-6 border-t py-4 max-sm:grid-cols-1 max-sm:gap-y-1.5 ${
                    dark ? 'border-cream/15' : 'border-line'
                  }`}
                >
                  <dt
                    className={`label-xs self-baseline pt-1 ${
                      dark ? 'text-cream/55' : 'text-stone'
                    }`}
                  >
                    {row.title}
                  </dt>
                  <dd
                    className={`font-display flex flex-wrap items-baseline gap-x-4 gap-y-1 sm:gap-x-3 text-big ${
                      dark ? 'text-cream' : 'text-ink'
                    }`}
                  >
                    {row.brands.map((brand, b) => (
                      <span key={brand} className="inline-flex items-baseline">
                        {/*
                          Точка-разделитель прячется на узких экранах:
                          при переносе строки она оказывалась первой
                          и выглядела как маркер списка — «· Экстроверт».
                          Вместо неё работает увеличенный интервал.
                        */}
                        {b > 0 ? (
                          <span
                            aria-hidden="true"
                            className={`mr-3 hidden sm:inline ${
                              dark ? 'text-goldsoft/70' : 'text-goldline'
                            }`}
                          >
                            ·
                          </span>
                        ) : null}
                        {brand}
                      </span>
                    ))}
                  </dd>
                </Reveal>
              ))}
              <div
                aria-hidden="true"
                className={`border-t ${dark ? 'border-cream/15' : 'border-line'}`}
              />
            </dl>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section tone={tone} id="suppliers" aria-labelledby="suppliers-title">
      <div className="container-page">
        <SectionHeading
          id="suppliers-title"
          eyebrow="С чем мы работаем"
          title="Конкретные заводы и марки"
          lead="Не «качественные материалы от проверенных поставщиков», а список, который можно проверить: загуглить, сравнить с тем, что предлагают в другом месте, и спросить на замере, почему выбран именно этот вариант."
        />

        <dl className="mt-12 lg:mt-16">
          {supplierRows.map((row, i) => (
            <Reveal
              key={row.id}
              delay={Math.min(i, 5) * 40}
              className="grid gap-x-12 gap-y-4 border-t border-line py-7 lg:grid-cols-[13rem_1fr] lg:py-8"
            >
              <dt className="font-display text-sub leading-snug text-ink">
                {row.title}
              </dt>
              <dd>
                {/* Марки — крупно, потому что ради них сюда и пришли.
                    Разделитель — точка на средней линии: ряд названий
                    должен читаться как строка каталога, а не как
                    облако тегов. */}
                <p className="font-display flex flex-wrap items-baseline gap-x-4 gap-y-1 text-big text-ink sm:gap-x-3">
                  {row.brands.map((brand, b) => (
                    <span key={brand} className="inline-flex items-baseline">
                      {b > 0 ? (
                        <span
                          aria-hidden="true"
                          className="mr-3 hidden text-goldline sm:inline"
                        >
                          ·
                        </span>
                      ) : null}
                      {brand}
                    </span>
                  ))}
                </p>
                <p className="mt-3 max-w-[62ch] text-ui leading-[1.7] text-stone">
                  {row.text}
                </p>
              </dd>
            </Reveal>
          ))}
          <div aria-hidden="true" className="border-t border-line" />
        </dl>

        <Reveal className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <MarginNote author="Роберт">
            Список рабочий, а не рекламный: здесь то, что реально лежит
            на нашем производстве и за что я готов отвечать. Если у вас
            уже есть любимая марка или её назвал дизайнер — скажите на
            замере, обычно можем заказать именно её.
          </MarginNote>

          <div className="text-ui leading-[1.7] text-stone lg:pt-2">
            <p>
              Конкретный артикул и декор выбираем на замере по образцам:
              один и тот же цвет у разных заводов выглядит по-разному,
              и это тот случай, когда смотреть нужно глазами, а не по
              фотографии в интернете.
            </p>
            <p className="mt-4">
              Фурнитуру и столешницу считаем отдельной строкой в смете —
              вы видите, за что платите, и можете заменить позицию,
              не пересобирая весь проект.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
