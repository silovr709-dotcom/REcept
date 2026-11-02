# -*- coding: utf-8 -*-
"""Аватар, иконки меню, карточки услуг и работ, виджет."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vk2 import *


# ==================================================================== АВАТАР
def avatar_paper():
    """Знак на бумаге. Читается кружком 44 px: две буквы и ничего больше."""
    S = 1200
    img = paper((S, S))
    d = ImageDraw.Draw(img, 'RGBA')
    d.rectangle([0, 0, S, 10], fill=rgba(BRASSL, 220))
    for (x0, y0, x1, y1) in [(58, 58, 1142, 1142)]:
        d.rectangle([x0, y0, x1, y1], outline=rgba(LINED, 255), width=3)
    for (x, y, dx, dy) in [(58, 58, 1, 1), (1142, 58, -1, 1),
                           (58, 1142, 1, -1), (1142, 1142, -1, -1)]:
        d.rectangle([min(x, x + dx * 70), y, max(x, x + dx * 70), y + 3], fill=rgba(BRASSL, 190))
        d.rectangle([x, min(y, y + dy * 70), x + 3, max(y, y + dy * 70)], fill=rgba(BRASSL, 190))

    f = F('corm', 470)
    w1 = tw(d, 'Р', f); w2 = tw(d, 'Е', f)
    total = w1 + w2 - 18
    x0 = S / 2 - total / 2
    asc, _ = f.getmetrics()
    base = S / 2 + asc * 0.32
    d.text((x0, base), 'Р', font=f.c, fill=OLIVED, anchor='ls')
    d.text((x0 + w1 - 18, base), 'Е', font=f.c, fill=BRASS, anchor='ls')

    dim_line(d, S / 2 - 150, S / 2 + 150, base + 46, rgba(BRASSL, 200), 1.6, 11)
    text(d, (S / 2, base + 84), 'ТВЕРЬ · С 2004 ГОДА', F('golos', 30),
         rgba(CLAY, 255), 0.26, 'ma')
    text(d, (S / 2, base + 140), 'кухни на заказ', F('marck', 52),
         rgba(BRASS, 235), 0, 'ma')

    save(img, 'avatar/avatar-01-monogram-paper-1200x1200.jpg')
    for s in (400, 200):
        save(img.resize((s, s), Image.LANCZOS), f'avatar/avatar-01-monogram-paper-{s}x{s}.jpg')


def avatar_olive():
    """Тот же знак на оливковом поле — заметнее в ленте и в комментариях."""
    S = 1200
    img = vgrad((S, S), [(0.0, rgba(OLIVED, 255)), (0.55, rgba(OLIVE, 255)),
                         (1.0, rgba(GRAPH, 255))]).convert('RGB')
    img = grain(img, 8)
    d = ImageDraw.Draw(img, 'RGBA')
    d.rectangle([0, 0, S, 10], fill=rgba(BRASSL, 220))
    d.rectangle([54, 54, 1146, 1146], outline=rgba(BRASSL, 120), width=2)
    for (x, y, dx, dy) in [(54, 54, 1, 1), (1146, 54, -1, 1),
                           (54, 1146, 1, -1), (1146, 1146, -1, -1)]:
        d.rectangle([min(x, x + dx * 74), y, max(x, x + dx * 74), y + 3], fill=rgba(BRASSL, 210))
        d.rectangle([x, min(y, y + dy * 74), x + 3, max(y, y + dy * 74)], fill=rgba(BRASSL, 210))

    f = F('corm', 470)
    w1 = tw(d, 'Р', f); w2 = tw(d, 'Е', f)
    total = w1 + w2 - 18
    x0 = S / 2 - total / 2
    asc, _ = f.getmetrics()
    base = S / 2 + asc * 0.32
    d.text((x0, base), 'Р', font=f.c, fill=CREAM, anchor='ls')
    d.text((x0 + w1 - 18, base), 'Е', font=f.c, fill=BRASSS, anchor='ls')

    dim_line(d, S / 2 - 150, S / 2 + 150, base + 46, rgba(BRASSL, 220), 1.6, 11)
    text(d, (S / 2, base + 84), 'ТВЕРЬ · С 2004 ГОДА', F('golos', 30),
         rgba(CREAM, 190), 0.26, 'ma')
    text(d, (S / 2, base + 140), 'кухни на заказ', F('marck', 52),
         rgba(BRASSL, 250), 0, 'ma')

    save(img, 'avatar/avatar-02-monogram-navy-1200x1200.jpg')
    for s in (400, 200):
        save(img.resize((s, s), Image.LANCZOS), f'avatar/avatar-02-monogram-navy-{s}x{s}.jpg')


# ============================================================== ИКОНКИ МЕНЮ
def m_kuhni(d, W, H, col, lw):
    x0, x1 = W * 0.22, W * 0.78
    d.rectangle([x0, H * 0.16, x1, H * 0.38], outline=col, width=lw)       # верхние шкафы
    d.line([(W / 2, H * 0.16), (W / 2, H * 0.38)], fill=col, width=lw)
    d.line([(x0 - W * 0.05, H * 0.46), (x1 + W * 0.05, H * 0.46)], fill=BRASSL,
           width=max(2, lw - 1))                                           # столешница
    d.rectangle([x0, H * 0.52, x1, H * 0.84], outline=col, width=lw)        # нижние фасады
    d.line([(W / 2, H * 0.52), (W / 2, H * 0.84)], fill=col, width=lw)
    d.line([(x0, H * 0.64), (x1, H * 0.64)], fill=col, width=lw)
    for dx in (-W * 0.03, W * 0.03):
        d.line([(W / 2 + dx, H * 0.565), (W / 2 + dx, H * 0.62)], fill=BRASSL, width=lw)


def m_mebel(d, W, H, col, lw):
    x0, x1 = W * 0.28, W * 0.72
    d.rectangle([x0, H * 0.18, x1, H * 0.52], outline=col, width=lw)        # шкаф
    d.line([(W / 2, H * 0.18), (W / 2, H * 0.52)], fill=col, width=lw)
    for dx in (-W * 0.032, W * 0.032):
        d.line([(W / 2 + dx, H * 0.27), (W / 2 + dx, H * 0.36)], fill=BRASSL, width=lw)
    d.line([(x0, H * 0.63), (x1, H * 0.63)], fill=BRASSL, width=max(2, lw - 1))  # штанга
    for cx in (W * 0.41, W * 0.59):
        d.line([(cx, H * 0.63), (cx, H * 0.67)], fill=col, width=lw)
        d.rectangle([cx - W * 0.045, H * 0.68, cx + W * 0.045, H * 0.84],
                    outline=col, width=lw)


def m_raboty(d, W, H, col, lw):
    # рамка кадра и «горка» линий — карточка проекта
    d.rectangle([W * 0.2, H * 0.22, W * 0.8, H * 0.74], outline=col, width=lw)
    d.line([(W * 0.2, H * 0.60), (W * 0.8, H * 0.60)], fill=col, width=lw)
    d.rectangle([W * 0.3, H * 0.32, W * 0.47, H * 0.50], outline=BRASSL, width=lw)
    d.line([(W * 0.52, H * 0.40), (W * 0.71, H * 0.40)], fill=col, width=lw)
    d.line([(W * 0.52, H * 0.47), (W * 0.64, H * 0.47)], fill=col, width=lw)
    d.line([(W * 0.28, H * 0.68), (W * 0.46, H * 0.68)], fill=BRASSL, width=lw)
    d.line([(W * 0.28, H * 0.74), (W * 0.34, H * 0.74)], fill=col, width=lw)


def m_process(d, W, H, col, lw):
    # шаги: три черты и номера-точки, соединённые линией
    y = H * 0.34
    d.line([(W * 0.18, y), (W * 0.82, y)], fill=BRASSL, width=max(2, lw - 1))
    for cx in (W * 0.18, W * 0.5, W * 0.82):
        d.ellipse([cx - W * 0.045, y - W * 0.045, cx + W * 0.045, y + W * 0.045],
                  outline=col, width=lw, fill=BONE)
    d.rectangle([W * 0.18, H * 0.52, W * 0.40, H * 0.56], fill=col)
    d.rectangle([W * 0.44, H * 0.52, W * 0.72, H * 0.56], fill=col)
    d.rectangle([W * 0.18, H * 0.64, W * 0.56, H * 0.68], fill=rgba(CLAY, 255))


def m_about(d, W, H, col, lw):
    # два кружка рядом — «нас двое»
    r = W * 0.15
    cy = H * 0.44
    d.ellipse([W * 0.5 - W * 0.075 - r, cy - r, W * 0.5 - W * 0.075 + r, cy + r],
              outline=col, width=lw)
    d.ellipse([W * 0.5 + W * 0.075 - r, cy - r, W * 0.5 + W * 0.075 + r, cy + r],
              outline=BRASSL, width=lw)
    d.rectangle([W * 0.26, H * 0.68, W * 0.46, H * 0.70], fill=col)
    d.rectangle([W * 0.26, H * 0.75, W * 0.36, H * 0.77], fill=rgba(CLAY, 255))


def m_otzyvy(d, W, H, col, lw):
    # кавычки — большой знак цитаты
    d.arc([W * 0.2, H * 0.2, W * 0.45, H * 0.42], 200, 340, fill=col, width=lw)
    d.arc([W * 0.55, H * 0.2, W * 0.8, H * 0.42], 200, 340, fill=col, width=lw)
    d.line([(W * 0.32, H * 0.40), (W * 0.32, H * 0.52)], fill=col, width=lw)
    d.line([(W * 0.67, H * 0.40), (W * 0.67, H * 0.52)], fill=col, width=lw)
    for i in range(3):
        rule(d, (W * 0.26 + i * W * 0.02, H * 0.70 - i * H * 0.06),
             W * 0.44 - i * W * 0.10, rgba(BRASSL, 200), 2)


MENU = [
    ('kuhni', 'КУХНИ', m_kuhni),
    ('mebel', 'ДРУГАЯ МЕБЕЛЬ', m_mebel),
    ('raboty', 'РАБОТЫ', m_raboty),
    ('process', 'КАК РАБОТАЕМ', m_process),
    ('about', 'О НАС', m_about),
    ('otzyvy', 'ОТЗЫВЫ', m_otzyvy),
]


def menu_icons():
    for slug, label, fn in MENU:
        S = 400
        img = paper((S, S))
        d = ImageDraw.Draw(img, 'RGBA')
        d.rectangle([0, 0, S, 6], fill=rgba(BRASSL, 205))
        d.rectangle([22, 22, S - 22, S - 22], outline=rgba(LINED, 255), width=2)
        fn(d, S, S * 0.90, OLIVE, 5)
        text(d, (S / 2, S - 64), label, F('golos-m', 20), rgba(BRASS, 255), 0.18, 'ma')
        save(img, f'menu/menu-{slug}-400x400.png')


# ============================================================== УСЛУГИ
SERVICES = [
    dict(slug='kuhni', n='01', photo='svc2_kuhni.jpg', focus=(0.5, 0.5),
         title='Кухни на заказ',
         sub='От компактной кухни в хрущёвке до кухни-гостиной с островом',
         eyebrow='основное направление'),
    dict(slug='garderobnye', n='02', photo='svc_wardrobe.jpg', focus=(0.55, 0.45),
         title='Гардеробные и шкафы',
         sub='Хранение по вашим вещам: глубины, высоты, антресоли, подсветка',
         eyebrow='системы хранения'),
    dict(slug='vannaya', n='03', photo='svc_bathroom.jpg', focus=(0.5, 0.45),
         title='Мебель для ванной',
         sub='Тумбы, пеналы и зеркальные шкафы во влагостойком исполнении',
         eyebrow='подгоняем по месту'),
    dict(slug='prihozhie', n='04', photo='svc_hall.jpg', focus=(0.5, 0.45),
         title='Прихожие и детские',
         sub='Корпусная мебель для остальных комнат — в одной стилистике',
         eyebrow='вместе с кухней'),
]


def service_vertical(s):
    W, H = 1080, 1350
    img = cover(src(s['photo']), (W, H), focus=s['focus'], zoom=1.0)
    img = warm_grade(img, sat=1.03, contrast=1.03, mix=0.05)

    PLATE = 420
    plate = vgrad((W, PLATE), [(0.0, rgba(OLIVED, 255)), (1.0, rgba(GRAPH, 255))]).convert('RGB')
    ph = img.crop((0, 0, W, H - PLATE))
    ph = lift(ph, (0.5, 0.42), (0.45, 0.30), 0.08)
    canvas = Image.new('RGB', (W, H), GRAPH)
    canvas.paste(ph.convert('RGB'), (0, 0))
    canvas.paste(plate, (0, H - PLATE))
    canvas = grain(canvas, 5)

    d = ImageDraw.Draw(canvas, 'RGBA')
    d.rectangle([0, H - PLATE - 2, W, H - PLATE], fill=rgba(BRASSL, 210))
    X = 76
    wordmark(d, (X, 62), 40, 'la', color=CREAM, gold=BRASSS)
    d.rectangle([X + 148, 88, X + 184, 89.4], fill=rgba(BRASSL, 200))
    text(d, (X + 200, 76), 'ТВЕРЬ', F('golos', 13), rgba(CREAM, 170), 0.30, 'la')

    y = H - PLATE + 56
    text(d, (X, y), s['n'], F('golos-m', 19), rgba(BRASSL, 255), 0.20, 'la')
    d.rectangle([X + 56, y + 12, X + 116, y + 13.4], fill=rgba(BRASSL, 190))
    text(d, (X + 132, y), s['eyebrow'].upper(), F('golos', 18), rgba(CREAM, 175), 0.18, 'la')

    fh_size = 66
    while fh_size > 40:
        fh = F('playfair', fh_size)
        if tw(d, s['title'], fh) <= W - 2 * X:
            break
        fh_size -= 2
    text(d, (X - 3, y + 46), s['title'], F('playfair', fh_size), CREAM, 0, 'la')
    para(d, (X, y + 148), s['sub'], F('golos', 25), rgba(CREAM, 218), W - 2 * X, 36)
    text(d, (X + 1, y + 264), 'Роберт и Катя ведут проект лично',
         F('marck', 33), rgba(BRASSL, 245), 0, 'la')
    save(canvas, f'services/service-{s["slug"]}-1080x1350.jpg')


def service_horizontal(s):
    W, H = 1280, 720
    img = cover(src(s['photo']), (W, H), focus=(s['focus'][0], 0.45), zoom=1.0)
    img = warm_grade(img, sat=1.03, contrast=1.03, mix=0.05)
    img = veil(img, [(0.0, rgba(GRAPH, 30)), (0.42, rgba(GRAPH, 90)),
                     (0.62, rgba(OLIVED, 190)), (1.0, rgba(GRAPH, 245))]).convert('RGB')
    d = ImageDraw.Draw(img, 'RGBA')
    X = 84
    wordmark(d, (X, 48), 28, 'la', color=CREAM, gold=BRASSS)
    text(d, (X + 108, 62), 'ТВЕРЬ', F('golos', 11), rgba(CREAM, 170), 0.30, 'la')
    text(d, (X, H - 188), s['n'], F('golos-m', 16), rgba(BRASSL, 255), 0.20, 'la')
    d.rectangle([X + 46, H - 178, X + 96, H - 177], fill=rgba(BRASSL, 190))
    text(d, (X + 110, H - 188), s['eyebrow'].upper(), F('golos', 14),
         rgba(CREAM, 175), 0.18, 'la')
    text(d, (X - 2, H - 140), s['title'], F('playfair', 52), CREAM, 0, 'la')
    para(d, (X, H - 76), s['sub'], F('golos', 19), rgba(CREAM, 205), 760, 27)
    save(img, f'services/service-{s["slug"]}-1280x720.jpg')


# ============================================================== РАБОТЫ
WORKS = [
    ('01', 'Кухня', 'с островом', 'public/images/kitchens/kitchen-04@2x.webp', (0.5, 0.45)),
    ('02', 'Кухня', 'в неоклассике', 'public/images/kitchens/kitchen-07@2x.webp', (0.5, 0.34)),
    ('03', 'Угловая', 'кухня', 'public/images/kitchens/kitchen-03@2x.webp', (0.5, 0.45)),
    ('04', 'Кухня', 'в нише с латунью', 'public/images/kitchens/kitchen-01@2x.webp', (0.5, 0.45)),
]


def work_cards():
    S = 1000
    PLATE = 260
    for n, t1, t2, path, focus in WORKS:
        img = cover(load(path), (S, S), focus=focus, zoom=1.0)
        img = warm_grade(img, sat=1.03, contrast=1.03, mix=0.05)
        canvas = Image.new('RGB', (S, S), BONE)
        canvas.paste(img.convert('RGB'), (0, 0))
        plate = vgrad((S, PLATE), [(0.0, rgba(OLIVED, 255)), (1.0, rgba(GRAPH, 255))]).convert('RGB')
        canvas.paste(plate, (0, S - PLATE))
        canvas = grain(canvas, 5)
        d = ImageDraw.Draw(canvas, 'RGBA')
        d.rectangle([0, S - PLATE - 2, S, S - PLATE], fill=rgba(BRASSL, 210))
        X = 62
        wordmark(d, (X, 46), 27, 'la', color=CREAM, gold=BRASSS)
        y = S - PLATE + 62
        text(d, (X, y), n, F('golos-m', 17), rgba(BRASSL, 255), 0.22, 'la')
        d.rectangle([X + 48, y + 11, X + 96, y + 12.2], fill=rgba(BRASSL, 190))
        text(d, (X + 110, y), 'НАША РАБОТА · ТВЕРЬ', F('golos', 15),
             rgba(CREAM, 175), 0.18, 'la')
        text(d, (X - 2, y + 34), t1, F('playfair', 56), CREAM, 0, 'la')
        text(d, (X - 2, y + 96), t2, F('playfair', 56), rgba(BRASSL, 255), 0, 'la')
        save(canvas, f'works/work-{n}-1000x1000.jpg')


# ============================================================== ВИДЖЕТ
def widget():
    W, H = 1530, 384
    img = paper((W, H))
    d = ImageDraw.Draw(img, 'RGBA')
    d.rectangle([0, 0, W, 7], fill=rgba(BRASSL, 215))
    crop_marks(d, (W, H), inset=26, length=28, color=rgba(BRASSL, 110))

    X = 72
    wordmark_tver(d, (X, 62), 40, gap=14, tracking=0.30)
    caps_rule(d, (X, 146), 'бесплатный проект и расчёт', F('golos', 14),
              rgba(CLAY, 255), w=24, gap=14, tracking=0.24)
    text(d, (X - 2, 184), 'Расскажите про кухню —', F('playfair', 44), INK, 0, 'la')
    text(d, (X - 2, 240), 'посчитаем за один разговор', F('playfair', 44), OLIVE, 0, 'la')
    text(d, (X, 312), 'Без обязательств. Отвечаем в сообщениях сообщества',
         F('golos', 17), rgba(CLAY, 255), 0.02, 'la')

    # круглый кадр справа: рамка-паспарту и латунный ободок
    r = 132
    cx, cy = W - 208, H / 2
    im = cover(src('photo-09-experts.jpg'), (r * 2, r * 2), focus=(0.52, 0.22), zoom=1.25)
    im = warm_grade(im, sat=1.03, mix=0.05)
    mask = Image.new('L', (r * 2, r * 2), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, r * 2 - 1, r * 2 - 1], fill=255)
    img.paste(im, (int(cx - r), int(cy - r)), mask)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=rgba(BRASSL, 220), width=3)
    d.ellipse([cx - r - 12, cy - r - 12, cx + r + 12, cy + r + 12],
              outline=rgba(BRASSL, 70), width=1)
    save(img, 'widget/widget-1530x384.jpg')


if __name__ == '__main__':
    avatar_paper()
    avatar_olive()
    menu_icons()
    for s in SERVICES:
        service_vertical(s)
        service_horizontal(s)
    work_cards()
    widget()
