# -*- coding: utf-8 -*-
"""
Обложки сообщества. Тёмно-синий + серебро / белое золото.

Главное правило композиции: на обложке одновременно видны
  1) оба человека — на фотографии, лицом в камеру;
  2) три преимущества — на синем поле, крупно и читаемо с телефона.
Ни одно из двух не жертвуется ради другого.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vk2 import *

THESES = ['проект бесплатно', 'гарантия 24 месяца', 'оплата 50 / 50']

# Фотографии подставляются переменными окружения: достаточно положить свои
# кадры в vk2/_source и указать имена — макеты пересоберутся без правки кода.
PHOTO_WIDE = os.environ.get('VK_PHOTO_WIDE', 'photo-11-pair-navy-wide.jpg')
PHOTO_TALL = os.environ.get('VK_PHOTO_TALL', 'photo-12-pair-navy-tall.jpg')


def _focus(name, default):
    v = os.environ.get(name)
    if not v:
        return default
    x, y = v.split(',')
    return (float(x), float(y))


def navy_field(size, grid=True):
    """Синее поле с серебряной сеткой — «чертёж на синем»."""
    w, h = size
    img = vgrad(size, [(0.0, rgba(GRAPH, 255)), (0.55, rgba(OLIVED, 255)),
                       (1.0, rgba(INK, 255))]).convert('RGB')
    img = grain(img, 5)
    if grid:
        d = ImageDraw.Draw(img, 'RGBA')
        step = max(20, int(w / 42))
        for i, x in enumerate(range(0, w, step)):
            d.rectangle([x, 0, x, h], fill=rgba(BRASSL, 12 if i % 5 else 20))
        for j, y in enumerate(range(0, h, step)):
            d.rectangle([0, y, w, y], fill=rgba(BRASSL, 12 if j % 5 else 20))
    d = ImageDraw.Draw(img, 'RGBA')
    crop_marks(d, size, inset=26, length=30, color=rgba(BRASSL, 110))
    return img


def seal(d, xy, f_size=40, sub='ТВЕРЬ'):
    """Знак: «РЕцепт» + серебряная черта + город."""
    x, y = xy
    wordmark(d, (x, y), f_size, 'la', color=CREAM, gold=BRASSS)
    off = int(tw(d, 'РЕцепт', F('corm', f_size), 0)) + int(f_size * 0.5)
    d.rectangle([x + off, y + f_size * 0.62, x + off + f_size * 0.95,
                 y + f_size * 0.62 + 1.4], fill=rgba(BRASSL, 210))
    text(d, (x + off + f_size * 1.15, y + f_size * 0.30), sub,
         F('golos', max(11, int(f_size * 0.33))), rgba(CREAM, 175), 0.30, 'la')


def theses_row(d, xy, f_size, color=None, gap_dot=24, tracking=0.05):
    """Три преимущества в строку — компактный вариант для полосы."""
    x, y = xy
    f = F('golos', f_size)
    cx = x
    for i, t in enumerate(THESES):
        text(d, (cx, y), t, f, color or rgba(CREAM, 232), tracking, 'la')
        cx += tw(d, t, f, tracking)
        if i < 2:
            cx += gap_dot * 0.4
            d.ellipse([cx, y + f_size * 0.52, cx + f_size * 0.16, y + f_size * 0.68],
                      fill=rgba(BRASSL, 230))
            cx += gap_dot
    return cx


# ------------------------------------------------------------- ПК 1920×768
def cover_desktop():
    W, H, SEAM = 1920, 768, 828
    canvas = navy_field((W, H))
    d = ImageDraw.Draw(canvas, 'RGBA')

    X = 92
    seal(d, (X, 62), 42)

    caps_rule(d, (X, 178), 'кухни и корпусная мебель · тверь', F('golos', 16),
              rgba(BRASSL, 255), w=26, gap=14, tracking=0.24)

    fh = F('playfair', 84)
    text(d, (X - 3, 226), 'Кухни, которые', fh, CREAM, 0, 'la')
    text(d, (X - 3, 318), 'собираем сами', fh, rgba(BRASSL, 255), 0, 'la')

    # три преимущества — блоками, а не строкой: читаются с расстояния
    f_num = F('golos-m', 17)
    f_lbl = F('golos', 22)
    bx = X
    for i, t in enumerate(THESES):
        text(d, (bx, 468), '0%d' % (i + 1), f_num, rgba(BRASSL, 255), 0.18, 'la')
        text(d, (bx, 500), t, f_lbl, rgba(CREAM, 238), 0, 'la')
        bx += 246
    d.rectangle([X, 470, X, 552], fill=rgba(BRASSL, 60))

    text(d, (X + 1, 618), 'Роберт и Катя ведут проект лично',
         F('marck', 40), rgba(BRASSS, 252), 0, 'la')

    # фотография справа: оба лица целиком
    ph = cover(src(PHOTO_WIDE), (W - SEAM, H),
               focus=_focus('VK_FOCUS_WIDE', (0.62, 0.30)), zoom=1.02)
    ph = warm_grade(ph, sat=1.02, contrast=1.04, brightness=1.02, mix=0.04)
    ph = grain(ph, 4)
    canvas.paste(ph.convert('RGB'), (SEAM, 0))
    d = ImageDraw.Draw(canvas, 'RGBA')
    d.rectangle([SEAM, 0, SEAM + 2, H], fill=rgba(BRASSL, 235))
    # серебряная тень по шву
    SW = 26
    band = canvas.crop((SEAM, 0, SEAM + SW, H)).convert('RGBA')
    sh = hgrad((SW, H), [(0.0, rgba(GRAPH, 130)), (0.45, rgba(GRAPH, 44)),
                         (1.0, rgba(GRAPH, 0))])
    canvas.paste(Image.alpha_composite(band, sh).convert('RGB'), (SEAM, 0))
    save(canvas, 'cover/cover-desktop-1920x768.jpg')

    # -------------------------------------------------- классика 1590×530
    W2, H2, S2 = 1590, 530, 690
    c2 = navy_field((W2, H2))
    d = ImageDraw.Draw(c2, 'RGBA')
    seal(d, (70, 44), 32)
    caps_rule(d, (70, 128), 'кухни на заказ · тверь', F('golos', 13),
              rgba(BRASSL, 255), w=22, gap=12, tracking=0.24)
    fh = F('playfair', 58)
    text(d, (68, 164), 'Кухни, которые', fh, CREAM, 0, 'la')
    text(d, (68, 228), 'собираем сами', fh, rgba(BRASSL, 255), 0, 'la')
    x = 70
    f = F('golos', 16)
    for i, t in enumerate(THESES):
        d.rectangle([x, 330, x + 4, 350], fill=rgba(BRASSL, 210))
        para(d, (x + 16, 331), t, f, rgba(CREAM, 235), 150, 21)
        x += 198
    text(d, (71, 424), 'Роберт и Катя ведут проект лично',
         F('marck', 30), rgba(BRASSS, 250), 0, 'la')
    ph = cover(src(PHOTO_WIDE), (W2 - S2, H2),
               focus=_focus('VK_FOCUS_WIDE', (0.60, 0.28)), zoom=1.05)
    ph = warm_grade(ph, sat=1.02, contrast=1.04, brightness=1.02, mix=0.04)
    c2.paste(ph.convert('RGB'), (S2, 0))
    d = ImageDraw.Draw(c2, 'RGBA')
    d.rectangle([S2, 0, S2 + 2, H2], fill=rgba(BRASSL, 235))
    save(c2, 'cover/cover-classic-1590x530.jpg')


# --------------------------------------------------------- мобильная 4:5
def cover_mobile():
    """Фото сверху, синий блок снизу. Сверху — оба лица, снизу — тезисы."""
    W, H = 1080, 1350
    PH = 762
    ph = cover(src(PHOTO_TALL), (W, PH),
               focus=_focus('VK_FOCUS_TALL', (0.52, 0.20)), zoom=1.16)
    ph = warm_grade(ph, sat=1.02, contrast=1.04, brightness=1.02, mix=0.04)
    ph = grain(ph, 4)
    canvas = Image.new('RGB', (W, H), GRAPH)
    canvas.paste(ph.convert('RGB'), (0, 0))

    block = navy_field((W, H - PH), grid=True)
    canvas.paste(block, (0, PH))
    d = ImageDraw.Draw(canvas, 'RGBA')
    d.rectangle([0, PH - 2, W, PH], fill=rgba(BRASSL, 235))
    d = ImageDraw.Draw(canvas, 'RGBA')
    X = 66
    seal(d, (X, PH + 40), 34)

    fh = F('playfair', 66)
    y = PH + 122
    text(d, (X - 3, y), 'Кухни, которые', fh, CREAM, 0, 'la')
    text(d, (X - 3, y + 76), 'собираем сами', fh, rgba(BRASSL, 255), 0, 'la')

    # три преимущества — в один ряд, но крупно
    ty = y + 190
    d.rectangle([X, ty - 12, X + 640, ty - 11], fill=rgba(BRASSL, 120))
    x = X
    f = F('golos-m', 21)
    for i, t in enumerate(THESES):
        cx = x
        text(d, (cx, ty + 12), t, f, rgba(CREAM, 240), 0.01, 'la')
        x += tw(d, t, f, 0.01) + 26
        if i < 2:
            d.ellipse([x - 14, ty + 22, x - 9, ty + 27], fill=rgba(BRASSL, 230))
            x += 6

    text(d, (X + 1, ty + 78), 'Роберт и Катя ведут проект лично',
         F('marck', 36), rgba(BRASSS, 250), 0, 'la')
    save(canvas, 'cover/cover-mobile-1080x1350.jpg')


# ------------------------------------------------------- живая 9:16
def cover_live():
    W, H = 1080, 1920
    PH = 1290
    ph = cover(src(PHOTO_TALL), (W, PH),
               focus=_focus('VK_FOCUS_TALL', (0.50, 0.14)), zoom=1.20)
    ph = warm_grade(ph, sat=1.02, contrast=1.04, brightness=1.01, mix=0.04)
    ph = grain(ph, 4)
    canvas = Image.new('RGB', (W, H), GRAPH)
    canvas.paste(ph.convert('RGB'), (0, 0))

    # затемнение сверху под знак — его частично срежет шапка приложения
    top = vgrad((W, 300), [(0.0, rgba(GRAPH, 200)), (1.0, rgba(GRAPH, 0))])
    canvas.paste(Image.alpha_composite(canvas.crop((0, 0, W, 300)).convert('RGBA'), top).convert('RGB'), (0, 0))

    block = navy_field((W, H - PH))
    canvas.paste(block, (0, PH))
    d = ImageDraw.Draw(canvas, 'RGBA')
    d.rectangle([0, PH - 2, W, PH], fill=rgba(BRASSL, 235))

    X = 78
    seal(d, (X, 108), 44)
    caps_rule(d, (X, PH + 44), 'мебельное ателье · с 2004 года', F('golos', 15),
              rgba(BRASSL, 255), w=24, gap=13, tracking=0.24)
    fh = F('playfair', 62)
    text(d, (X - 3, PH + 86), 'Кухни, которые', fh, CREAM, 0, 'la')
    text(d, (X - 3, PH + 158), 'собираем сами', fh, rgba(BRASSL, 255), 0, 'la')

    y = PH + 268
    for i, t in enumerate(['Проект и визуализация — бесплатно',
                           'Схемы электрики — бесплатно',
                           'Оплата 50 / 50, гарантия 24 месяца']):
        text(d, (X, y), '0%d' % (i + 1), F('golos-m', 17), rgba(BRASSL, 255), 0.18, 'la')
        text(d, (X + 52, y), t, F('golos', 22), rgba(CREAM, 230), 0, 'la')
        y += 48
    text(d, (X + 1, H - 96), 'Роберт и Катя ведут проект лично',
         F('marck', 34), rgba(BRASSL, 250), 0, 'la')
    save(canvas, 'cover/live-cover-1080x1920.jpg')


if __name__ == '__main__':
    cover_desktop()
    cover_mobile()
    cover_live()
