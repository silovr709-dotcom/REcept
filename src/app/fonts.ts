import localFont from 'next/font/local';

/**
 * ШРИФТЫ
 * ======
 * Раньше начертания объявлялись прямо в globals.css через
 * @font-face с абсолютным путём `/fonts/...`. На обычном хостинге это
 * работает, но статическая витрина лежит в подпапке — и браузер искал
 * шрифты в корне домена, где их нет. Сайт молча отрисовывался
 * системным гротеском: та же беда, что была с фотографиями, только
 * менее заметная, потому что подмена шрифта не оставляет пустого места.
 *
 * Теперь файлы отдаёт next/font/local. Он сам добавляет префикс
 * подпапки, проставляет хэш для вечного кэша и генерирует предзагрузку
 * нужных файлов — руками эти три вещи пришлось бы поддерживать отдельно
 * для каждого режима сборки.
 *
 * Разбиение на кириллицу и латиницу сохранено: это два разных файла
 * вместо одного большого. Кириллица объявлена первой, поэтому русский
 * текст берёт глифы из неё, а цифры и латиница — из второго файла,
 * который грузится без предзагрузки, потому что на русском сайте
 * встречается реже.
 */

export const sansCyrillic = localFont({
  src: '../fonts/manrope-cyrillic.woff2',
  weight: '200 800',
  style: 'normal',
  display: 'swap',
  variable: '--font-sans-cyrillic',
  preload: true,
  declarations: [
    {
      prop: 'unicode-range',
      value: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
    },
  ],
});

export const sansLatin = localFont({
  src: '../fonts/manrope-latin.woff2',
  weight: '200 800',
  style: 'normal',
  display: 'swap',
  variable: '--font-sans-latin',
  preload: false,
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
});

/**
 * Рукописное начертание — только для пометок на полях («четвёртая
 * стена»). Без предзагрузки: оно декоративное и находится далеко от
 * первого экрана, а до его появления текст виден системным курсивом.
 */
export const hand = localFont({
  src: '../fonts/caveat-notes.woff2',
  weight: '600',
  style: 'normal',
  display: 'swap',
  variable: '--font-hand-face',
  preload: false,
});

export const fontVariables = [
  sansCyrillic.variable,
  sansLatin.variable,
  hand.variable,
].join(' ');
