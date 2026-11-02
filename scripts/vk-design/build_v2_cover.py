# -*- coding: utf-8 -*-
"""Обложки сообщества: ПК, прежний формат, мобильная и живая."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vk2 import *


def panel_cover(W, H, seam, photo, focus, zoom, headline, headline2,
                eyebrow, sub, hand, photo_lift=(0.6, 0.4), side='left'):
    """Слева бумажное поле с текстом, справа фотография во всю высоту."""
    panel = paper((seam, H))
    d = ImageDraw.Draw(panel, 'RGBA')
    crop_marks(d, (seam, H), inset=26, length=30, color=rgba(BRASSL, 120))

    X = int(seam * 0.12)
    top = int(H * 0.105)
    wordmark_tver(d, (X, top), int(H * 0.056), gap=int(H * 0.020), tracking=0.30)

    y = top + int(H * 0.115)
    caps_rule(d, (X, y), eyebrow, F('golos', int(H * 0.021)),
              rgba(CLAY, 255), color=rgba(BRASSL, 210),
              w=int(H * 0.030), gap=int(H * 0.020), tracking=0.24)

    # кегль подбирается так, чтобы самая длинная строка влезла в панель
    maxw = int(seam * 0.86)
    size = int(H * 0.105)
    while size > int(H * 0.05):
        fh = F('playfair', size)
        if max(tw(d, headline, fh), tw(d, headline2 or '', fh)) <= maxw:
            break
        size -= 2
    fh = F('playfair', size)
    y = top + int(H * 0.205)
    text(d, (X - 2, y), headline, fh, INK, 0, 'la')
    y2 = y + int(fh.size * 1.06)
    if headline2:
        text(d, (X - 2, y2), headline2, fh, OLIVE, 0, 'la')
        y2 += int(fh.size * 1.06)

    # размерная линия — деталь чертежа, отделяет текст от пояснения
    dy = y2 + int(H * 0.045)
    dim_line(d, X, X + int(seam * 0.42), dy, rgba(BRASSL, 190), 1.4, 9)

    y = dy + int(H * 0.055)
    y = para(d, (X, y), sub, F('golos', int(H * 0.030)),
             rgba(INK, 225), int(seam * 0.74), int(H * 0.046))

    if hand:
        text(d, (X + 1, y + int(H * 0.035)), hand, F('marck', int(H * 0.052)),
             rgba(BRASS, 245), 0, 'la')

    # нижний реестр тезисов
    fy = H - int(H * 0.115)
    rule(d, (X, fy - int(H * 0.045)), int(seam * 0.76), rgba(BRASSL, 120), 1.2)
    items = ['с 2004 года', 'гарантия 24 месяца', 'оплата 50 / 50']
    f = F('golos', int(H * 0.0235))
    cx = X
    for i, t in enumerate(items):
        text(d, (cx, fy - int(H * 0.018)), t, f, rgba(INK, 190), 0.06, 'la')
        cx += tw(d, t, f, 0.06)
        if i < 2:
            draw_dot(d, cx + int(H * 0.016), fy - int(H * 0.030))
            cx += int(H * 0.032)

    canvas = Image.new('RGB', (W, H))
    canvas.paste(panel.convert('RGB'), (0, 0))

    right_w = W - seam
    ph = cover(src(photo), (right_w, H), focus=focus, zoom=zoom)
    ph = warm_grade(ph, sat=1.04, contrast=1.04, brightness=1.02, mix=0.05)
    ph = lift(ph, photo_lift, (0.30, 0.32), 0.10)
    ph = grain(ph, 5)
    canvas.paste(ph.convert('RGB'), (seam, 0))

    # шов: мягкая тень бумаги на фотографии и латунная линия по кромке
    SW = 30
    band = canvas.crop((seam, 0, seam + SW, H)).convert('RGBA')
    sh = hgrad((SW, H), [(0.0, rgba(GRAPH, 120)), (0.45, rgba(GRAPH, 46)),
                         (1.0, rgba(GRAPH, 0))])
    canvas.paste(Image.alpha_composite(band, sh).convert('RGB'), (seam, 0))
    d = ImageDraw.Draw(canvas, 'RGBA')
    d.rectangle([seam - 1, 0, seam, H], fill=rgba(BRASSL, 235))
    return canvas


def draw_dot(draw, x, y, color=None, r=2):
    draw.ellipse([x - r, y - r, x + r, y + r], fill=color or rgba(BRASSL, 220))


def cover_desktop():
    W, H = 1920, 768
    SEAM = 872
    img = panel_cover(
        W, H, SEAM,
        photo='photo-06-olive-kitchen.jpg',
        focus=(0.98, 0.34), zoom=1.10,
        eyebrow='мебельное ателье · тверь',
        headline='Кухни,',
        headline2='которые собираем сами',
        sub='Индивидуальные кухни и корпусная мебель. Проект, визуализация '
            'и схемы электрики — бесплатно.',
        hand='Роберт и Катя ведут проект лично',
        photo_lift=(0.62, 0.34))
    save(img, 'cover/cover-desktop-1920x768.jpg')

    # ------------------------------------------------ прежний формат 1590×530
    W2, H2, S2 = 1590, 530, 700
    img = panel_cover(
        W2, H2, S2,
        photo='photo-06-olive-kitchen.jpg',
        focus=(0.98, 0.34), zoom=1.26,
        eyebrow='мебельное ателье · тверь',
        headline='Кухни,',
        headline2='которые собираем сами',
        sub='Проект, визуализация и схемы электрики — бесплатно.',
        hand='Роберт и Катя ведут проект лично',
        photo_lift=(0.64, 0.34))
    save(img, 'cover/cover-classic-1590x530.jpg')


def cover_mobile():
    """4:5 — то, что ВК показывает в приложении целиком."""
    W, H = 1080, 1350
    TOP = 690
    img = paper((W, TOP))
    d = ImageDraw.Draw(img, 'RGBA')
    crop_marks(d, (W, TOP), inset=30, length=34, color=rgba(BRASSL, 120))
    X = 76
    wordmark_tver(d, (X, 66), 40, gap=15, tracking=0.30)
    caps_rule(d, (X, 168), 'индивидуальные кухни · тверь', F('golos', 16),
              rgba(CLAY, 255), w=24, gap=14, tracking=0.24)
    fh = F('playfair', 86)
    text(d, (X - 3, 212), 'Кухни,', fh, INK, 0, 'la')
    text(d, (X - 3, 308), 'которые', fh, INK, 0, 'la')
    text(d, (X - 3, 404), 'собираем сами', fh, OLIVE, 0, 'la')

    dim_line(d, X, X + 360, 520, rgba(BRASSL, 190), 1.4, 9)
    para(d, (X, 548), 'Проект, визуализация и схемы электрики — бесплатно.',
         F('golos', 27), rgba(INK, 225), 900, 38)

    canvas = Image.new('RGB', (W, H))
    canvas.paste(img, (0, 0))

    ph = cover(src('photo-01-hero-kitchen.jpg'), (W, H - TOP + 6),
               focus=(0.50, 0.38), zoom=1.02)
    ph = warm_grade(ph, sat=1.04, contrast=1.04, brightness=1.02, mix=0.05)
    ph = lift(ph, (0.52, 0.42), (0.42, 0.26), 0.10)
    ph = grain(ph, 5)
    canvas.paste(ph.convert('RGB'), (0, TOP))

    d = ImageDraw.Draw(canvas, 'RGBA')
    d.rectangle([0, TOP - 2, W, TOP], fill=rgba(BRASSL, 220))

    # нижняя плашка: подпись рукой и тезисы — в безопасной зоне.
    # Она непрозрачная: под ней всё равно обрез по грудь, а текст должен
    # читаться на любом кадре, а не только на тёмном.
    plate_h = 222
    plate = vgrad((W, plate_h), [(0.0, rgba(OLIVED, 255)),
                                 (1.0, rgba(GRAPH, 255))]).convert('RGB')
    canvas.paste(plate, (0, H - plate_h))

    d = ImageDraw.Draw(canvas, 'RGBA')
    text(d, (X + 1, H - plate_h + 44), 'Роберт и Катя ведут проект лично',
         F('marck', 40), rgba(BRASSS, 250), 0, 'la')
    rule(d, (X, H - plate_h + 112), 900, rgba(BRASSL, 130), 1.2)
    f = F('golos', 21)
    cx = X
    for i, t in enumerate(['с 2004 года', 'гарантия 24 месяца', 'оплата 50 / 50']):
        text(d, (cx, H - plate_h + 142), t, f, rgba(CREAM, 232), 0.05, 'la')
        cx += tw(d, t, f, 0.05)
        if i < 2:
            d.ellipse([cx + 24, H - plate_h + 152, cx + 28, H - plate_h + 156],
                      fill=rgba(BRASSL, 220))
            cx += 44
    save(canvas, 'cover/cover-mobile-1080x1350.jpg')


def cover_live():
    """9:16 — живая обложка. Видна только с телефона: сверху её срезает
    шапка приложения, снизу — панель навигации. Поэтому текст стоит
    на плотной плашке, а не поверх фотографии."""
    W, H = 1080, 1920
    PHOTO_H = 1310

    ph = cover(src('photo-01-hero-kitchen.jpg'), (W, PHOTO_H),
               focus=(0.50, 0.30), zoom=1.10)
    ph = warm_grade(ph, sat=1.04, contrast=1.05, brightness=0.98, mix=0.05)
    ph = lift(ph, (0.52, 0.40), (0.44, 0.26), 0.10)
    ph = grain(ph, 5)
    canvas = Image.new('RGB', (W, H), GRAPH)
    canvas.paste(ph.convert('RGB'), (0, 0))

    # мягкое затемнение сверху под знак и снизу — переход к плашке
    d = ImageDraw.Draw(canvas, 'RGBA')
    top = vgrad((W, 300), [(0.0, rgba(GRAPH, 165)), (1.0, rgba(GRAPH, 0))])
    canvas.paste(Image.alpha_composite(canvas.crop((0, 0, W, 300)).convert('RGBA'), top).convert('RGB'),
                 (0, 0))

    plate_h = H - PHOTO_H
    plate = vgrad((W, plate_h), [(0.0, rgba(OLIVED, 255)), (1.0, rgba(GRAPH, 255))]).convert('RGB')
    canvas.paste(plate, (0, PHOTO_H))
    d = ImageDraw.Draw(canvas, 'RGBA')
    d.rectangle([0, PHOTO_H - 2, W, PHOTO_H], fill=rgba(BRASSL, 220))

    # знак
    X = 78
    wordmark(d, (X, 118), 50, 'la', color=CREAM, gold=BRASSS)
    d.rectangle([X + 200, 150, X + 245, 151.4], fill=rgba(BRASSL, 210))
    text(d, (X + 262, 140), 'ТВЕРЬ', F('golos', 14), rgba(CREAM, 180), 0.30, 'la')

    # плашка: приветствие, три пункта, подпись
    y = PHOTO_H + 58
    caps_rule(d, (X, y), 'мебельное ателье · с 2004 года', F('golos', 16),
              rgba(BRASSL, 255), color=rgba(BRASSL, 220), w=26, gap=14, tracking=0.24)
    y += 54
    text(d, (X - 3, y), 'Кухни, которые', F('playfair', 68), CREAM, 0, 'la')
    text(d, (X - 3, y + 82), 'собираем сами', F('playfair', 68), rgba(BRASSS, 255), 0, 'la')

    y += 200
    for n, t in [('01', 'Проект и визуализация — бесплатно'),
                 ('02', 'Схемы электрики — бесплатно'),
                 ('03', 'Оплата 50 / 50, гарантия 24 месяца')]:
        text(d, (X, y), n, F('golos-m', 18), rgba(BRASSL, 255), 0.18, 'la')
        text(d, (X + 58, y), t, F('golos', 23), rgba(CREAM, 225), 0, 'la')
        y += 52

    text(d, (X + 1, PHOTO_H + plate_h - 74), 'Роберт и Катя ведут проект лично',
         F('marck', 34), rgba(BRASSL, 250), 0, 'la')
    d.rectangle([X, PHOTO_H + plate_h - 108, W - X, PHOTO_H + plate_h - 107],
                fill=rgba(BRASSL, 90))
    save(canvas, 'cover/live-cover-1080x1920.jpg')


if __name__ == '__main__':
    cover_desktop()
    cover_mobile()
    cover_live()
