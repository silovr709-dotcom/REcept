'use client';

import { useMemo, useState } from 'react';
import { LeadForm } from './LeadForm';
import { reachGoal } from '@/lib/analytics';

/**
 * БРИФ НА РАСЧЁТ
 * ==============
 *
 * Зачем он вообще нужен. Самая частая причина, по которой человек
 * уходит с сайта мебельщика, — ему нечего здесь делать. Прочитал,
 * посмотрел фотографии и закрыл: «потом напишу». Форма «имя и
 * телефон» этого не меняет, потому что требует сразу самого
 * дорогого — согласия на разговор.
 *
 * Бриф меняет порядок. Сначала человек делает несколько лёгких
 * выборов про свою кухню — это интересно, это про него, и это
 * ни к чему не обязывает. К последнему шагу он уже вложился в
 * задачу, и оставить контакт становится естественным продолжением,
 * а не первым шагом.
 *
 * Чем он НЕ является. Это не калькулятор с мгновенной ценой.
 * Честной цены по пяти кликам не существует: она собирается из
 * размеров, техники, фурнитуры и того, что происходит в конкретной
 * квартире. Поэтому мы нигде не показываем выдуманную сумму —
 * бриф собирает задачу, а считает её Роберт.
 *
 * Варианты ответов — не выдуманные: планировки взяты из портфолио,
 * материалы и уровни фурнитуры — из действующего каталога, который
 * разобран на странице «Материалы».
 */

type Option = { value: string; note?: string };
type Step = {
  id: string;
  /** Короткий ярлык для итоговой сводки */
  short: string;
  question: string;
  hint?: string;
  options: Option[];
};

const STEPS: Step[] = [
  {
    id: 'layout',
    short: 'Планировка',
    question: 'Какая планировка у вас получается?',
    hint: 'Если сомневаетесь — выберите «Пока не знаю», это нормальный ответ.',
    options: [
      { value: 'Прямая', note: 'Вся кухня вдоль одной стены' },
      { value: 'Угловая', note: 'Две смежные стены' },
      { value: 'П-образная', note: 'Три стороны' },
      { value: 'С островом', note: 'Нужна свободная середина' },
      { value: 'Пока не знаю' },
    ],
  },
  {
    id: 'size',
    short: 'Размер',
    question: 'Сколько примерно метров по стене?',
    hint: 'Достаточно на глаз — точные размеры снимем на замере.',
    options: [
      { value: 'До 3 метров' },
      { value: '3–4 метра' },
      { value: '4–6 метров' },
      { value: 'Больше 6 метров' },
      { value: 'Не мерил' },
    ],
  },
  {
    id: 'fronts',
    short: 'Фасады',
    question: 'Какие фасады вам ближе?',
    hint: 'Это самый заметный пункт в смете — и единственный, который видно каждый день.',
    options: [
      { value: 'МДФ в плёнке ПВХ', note: 'Рабочая лошадка: фрезеровка, цвет, разумные деньги' },
      { value: 'МДФ в эмали', note: 'Любой цвет по RAL, глубокая матовая поверхность' },
      { value: 'Пластик HPL', note: 'Износостойкий, честная ровная плоскость' },
      { value: 'ЛДСП', note: 'Самый спокойный бюджет' },
      { value: 'Помогите выбрать' },
    ],
  },
  {
    id: 'hardware',
    short: 'Фурнитура',
    question: 'Какая фурнитура внутри?',
    hint: 'Мы не ставим всем подряд самую дорогую и не делаем вид, что ставим.',
    options: [
      { value: 'Базовая', note: 'Боярд: петли и ящики, которые нормально работают' },
      { value: 'Средняя', note: 'Titus, Tandembox: плавнее ход, больше ресурс' },
      { value: 'Премиум', note: 'Blum, Legrabox, Aventos' },
      { value: 'Расскажите разницу' },
    ],
  },
  {
    id: 'stage',
    short: 'Этап',
    question: 'На каком этапе помещение?',
    hint: 'От этого зависит только одно — когда удобнее начинать, а не цена.',
    options: [
      { value: 'Ремонта ещё не было' },
      { value: 'Ремонт идёт' },
      { value: 'Ремонт закончен' },
      { value: 'Пока только планирую' },
    ],
  },
];

export function KitchenBrief({
  tone = 'light',
  source = 'brief',
}: {
  tone?: 'light' | 'dark';
  source?: string;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const dark = tone === 'dark';

  const done = step >= STEPS.length;
  const current = STEPS[step];

  const hiddenFields = useMemo(() => {
    const out: Record<string, string> = {};
    for (const s of STEPS) if (answers[s.id]) out[s.short.toLowerCase()] = answers[s.id];
    return out;
  }, [answers]);

  const answered = Object.keys(hiddenFields).length;

  function pick(value: string) {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    reachGoal('brief_step', { step: current.id, value });
    setStep(step + 1);
    if (step + 1 >= STEPS.length) reachGoal('brief_complete', { source });
  }

  const shell = dark
    ? 'border-cream/15 bg-cream/[0.04]'
    : 'border-line bg-white/70';
  const head = dark ? 'text-cream' : 'text-ink';
  const soft = dark ? 'text-cream/65' : 'text-stone';

  return (
    <div className={`rounded-lg border p-6 sm:p-8 ${shell}`}>
      {/* Шкала шагов. Человеку важно видеть, что это пять касаний,
          а не бесконечная анкета */}
      <div className="flex items-center gap-3">
        <div
          className={`h-1 flex-1 overflow-hidden rounded-full ${dark ? 'bg-cream/15' : 'bg-line'}`}
        >
          <div
            className="h-full rounded-full bg-brass transition-[width] duration-500 ease-out"
            style={{
              // Пустая полоса на первом шаге читается как сломанная,
              // поэтому минимум — заметный кусочек
              width: `${Math.max(7, Math.round(((done ? STEPS.length : step) / STEPS.length) * 100))}%`,
            }}
          />
        </div>
        <p className={`shrink-0 text-[0.75rem] font-semibold ${soft}`}>
          {done ? 'Последний шаг' : `Шаг ${step + 1} из ${STEPS.length}`}
        </p>
      </div>

      {!done && current ? (
        <div className="mt-7">
          <h3 className={`font-display text-h3 ${head}`}>{current.question}</h3>
          {current.hint ? (
            <p className={`mt-2 text-sm leading-relaxed ${soft}`}>{current.hint}</p>
          ) : null}

          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {current.options.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => pick(o.value)}
                  className={`group flex min-h-14 w-full flex-col justify-center rounded-md border px-4 py-3 text-left transition-colors ${
                    dark
                      ? 'border-cream/20 hover:border-brasslight hover:bg-cream/[0.07]'
                      : 'border-line bg-white hover:border-brass hover:bg-bone'
                  }`}
                >
                  <span className={`text-[0.9375rem] font-semibold ${head}`}>
                    {o.value}
                  </span>
                  {o.note ? (
                    <span className={`mt-0.5 text-[0.8125rem] leading-snug ${soft}`}>
                      {o.note}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className={`text-sm font-semibold underline decoration-brass/40 underline-offset-4 ${soft}`}
              >
                ← Назад
              </button>
            ) : null}
            {/* Дверь для тех, кто уже всё решил: заставлять их кликать
                пять раз — значит терять самых горячих */}
            <button
              type="button"
              onClick={() => {
                reachGoal('brief_skip', { step: current.id });
                setStep(STEPS.length);
              }}
              className={`text-sm font-semibold underline decoration-brass/40 underline-offset-4 ${soft}`}
            >
              Пропустить вопросы и просто оставить контакт
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-7">
          <h3 className={`font-display text-h3 ${head}`}>
            {answered > 0 ? 'Готово. Куда прислать расчёт?' : 'Куда прислать расчёт?'}
          </h3>
          <p className={`mt-2 text-sm leading-relaxed ${soft}`}>
            Роберт посчитает смету по вашим размерам и объяснит, из чего она
            сложилась. Это бесплатно и ни к чему не обязывает.
          </p>

          {answered > 0 ? (
            <>
              <ul className="mt-5 flex flex-wrap gap-2">
                {STEPS.filter((s) => answers[s.id]).map((s, i) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setStep(STEPS.indexOf(s))}
                      title="Изменить ответ"
                      className={`rounded-full border px-3 py-1.5 text-[0.8125rem] transition-colors ${
                        dark
                          ? 'border-cream/20 text-cream/80 hover:border-brasslight'
                          : 'border-line text-ink hover:border-brass'
                      }`}
                    >
                      <span className={soft}>{s.short}: </span>
                      {answers[s.id]}
                      {i === 0 ? '' : ''}
                    </button>
                  </li>
                ))}
              </ul>
              <p className={`mt-2 text-xs ${soft}`}>
                Нажмите на любой ответ, чтобы изменить.
              </p>
            </>
          ) : null}

          <div className="mt-6">
            {/* У формы `tone` означает цвет текста, а не фона:
                `light` — светлые буквы для тёмной подложки */}
            <LeadForm
              tone={dark ? 'light' : 'dark'}
              compact
              source={source}
              submitLabel="Отправить на расчёт"
              hiddenFields={hiddenFields}
            />
          </div>

          {answered > 0 ? (
            <button
              type="button"
              onClick={() => setStep(0)}
              className={`mt-4 text-sm font-semibold underline decoration-brass/40 underline-offset-4 ${soft}`}
            >
              Пройти вопросы заново
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
