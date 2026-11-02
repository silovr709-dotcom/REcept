# -*- coding: utf-8 -*-
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vk import *

COUPLE_VERT = Image.open(os.path.join(REPO, 'vk/_source/base_cover_vertical.jpg'))
COUPLE_WIDE = Image.open(os.path.join(REPO, 'vk/_source/base_cover_wide2.jpg'))

PHOTO = os.path.join(REPO, 'public/images')

SERVICES = [
    dict(slug='kuhni', n='01', photo=os.path.join(REPO, 'vk/_source') + '/svc_kitchen.jpg',
         title='Кухни на заказ',
         sub='От компактных кухонь в хрущёвке до кухонь-гостиных с островом',
         short='Основное направление'),
    dict(slug='garderobnye', n='02', photo=os.path.join(REPO, 'vk/_source') + '/svc_wardrobe.jpg',
         title='Гардеробные и шкафы',
         sub='Системы хранения по вашим размерам и вещам, а не по стандартной сетке',
         short='Шкафы-купе, распашные, антресоли'),
    dict(slug='vannaya', n='03', photo=os.path.join(REPO, 'vk/_source') + '/svc_bathroom.jpg',
         title='Мебель для ванной',
         sub='Тумбы, пеналы и зеркальные шкафы во влагостойком исполнении',
         short='Подгоняем по месту'),
    dict(slug='prihozhie', n='04', photo=os.path.join(REPO, 'vk/_source') + '/svc_hall.jpg',
         title='Прихожие и детские',
         sub='Корпусная мебель для остальных комнат — в одной стилистике с кухней',
         short='Рабочие зоны, детские'),
]


# ================================================================= АВАТАР
def avatar():
    """Аватарка: ВК обрезает её кругом, поэтому всё важное — внутри
    вписанной окружности. Сверху синее поле со знаком, ниже — лица."""
    W = H = 1200
    img = cover(COUPLE_VERT, (W, H), focus=(0.50, 0.14), zoom=1.0)
    img = ImageEnhance.Contrast(img).enhance(1.05)
    img = ImageEnhance.Color(img).enhance(1.06)
    img = lighten(img, (0.50, 0.62), (0.46, 0.30), 0.14)
    # верхняя треть — плотное поле под знак, дальше прозрачно
    img = veil(img, [(0.00, rgba(SOOT, 254)), (0.20, rgba(INK, 246)),
                     (0.34, rgba(INK, 168)), (0.46, rgba(INK, 30)),
                     (0.60, rgba(INK, 0)), (0.88, rgba(SOOT, 40)),
                     (1.00, rgba(SOOT, 140))])
    img = grain(img, 7)
    d = ImageDraw.Draw(img, 'RGBA')

    wordmark(d, (W / 2, 150), 128, 'light', 'ma')
    text(d, (W / 2, 316), 'ТВЕРЬ · С 2004 ГОДА', F('golos', 30),
         rgba(GOLDS, 240), 0.26, 'ma')
    rule(d, (W / 2 - 90, 388), 180, rgba(GOLDL, 150), 1.6)

    save(img, 'avatar/avatar-master-1200x1200.jpg')
    for s in (400, 200):
        im = img.resize((s, s), Image.LANCZOS)
        save(im, f'avatar/avatar-{s}x{s}.jpg')


# ============================================================== УСЛУГИ
def services():
    for s in SERVICES:
        photo = Image.open(os.path.join(REPO, 'vk/_source', s['photo']))
        # --- широкая карточка 1280×720: для блока «Услуги» и превью постов
        W, H = 1280, 720
        img = cover(photo, (W, H), focus=(0.5, 0.5), zoom=1.0)
        img = ImageEnhance.Color(img).enhance(1.02)
        img = veil(img, [(0.00, rgba(SOOT, 90)), (0.30, rgba(SOOT, 30)),
                         (0.52, rgba(INK, 120)), (0.72, rgba(INK, 214)),
                         (1.00, rgba(SOOT, 248))])
        img = grain(img, 6)
        d = ImageDraw.Draw(img, 'RGBA')
        X = 84
        wordmark_tver(d, (X, 46), 27, 'light', gap=10, tracking=0.28)
        d.rectangle([X, H - 176, X + 34, H - 174], fill=rgba(GOLDL, 190))
        text(d, (X + 48, H - 196), s['n'], F('golos-m', 16), rgba(GOLDS, 235), 0.22, 'la')
        text(d, (X - 2, H - 146), s['title'], F('playfair', 52), CREAM, 0, 'la')
        para(d, (X, H - 88), s['sub'], F('golos', 19), rgba(CREAM, 208), 780, 28)
        save(img, f'services/service-{s["slug"]}-1280x720.jpg')

        # --- вертикальная карточка 1080×1350: основная, мобильная
        W, H = 1080, 1350
        img = cover(photo, (W, H), focus=(0.5, 0.42), zoom=1.0)
        img = ImageEnhance.Color(img).enhance(1.02)
        img = veil(img, [(0.00, rgba(SOOT, 170)), (0.12, rgba(SOOT, 20)),
                         (0.46, rgba(INK, 26)), (0.58, rgba(INK, 190)),
                         (0.66, rgba(SOOT, 240)), (0.80, rgba(SOOT, 250)),
                         (1.00, rgba(SOOT, 254))])
        img = grain(img, 6)
        d = ImageDraw.Draw(img, 'RGBA')
        X = 80
        wordmark_tver(d, (X, 72), 34, 'light', gap=13, tracking=0.28)
        text(d, (X, 950), s['n'], F('golos-m', 20), rgba(GOLDS, 230), 0.24, 'la')
        d.rectangle([X + 62, 962, X + 132, 964], fill=rgba(GOLDL, 170))
        text(d, (X + 148, 950), s['short'].upper(), F('golos', 19),
             rgba(CREAM, 170), 0.18, 'la')
        para(d, (X - 3, 992), s['title'], F('playfair', 68), CREAM, 900, 74)
        para(d, (X, 1090), s['sub'], F('golos', 26), rgba(CREAM, 215), 880, 38)
        text(d, (X + 1, 1232), 'Роберт и Катя ведут проект лично',
             F('marck', 34), rgba(GOLDS, 240), 0, 'la')
        save(img, f'services/service-{s["slug"]}-1080x1350.jpg')


# ============================================================ ИКОНКИ МЕНЮ
def _frame(d, W, H, inset=26, color=LINE, t=2):
    d.rectangle([inset, inset, W - inset, H - inset], outline=color, width=t)


def _cabinet(d, cx, cy, w, h, col, lw):
    """Фасад кухни: корпус, два ящика, тонкая ручка-профиль."""
    x0, y0, x1, y1 = cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2
    d.rectangle([x0, y0, x1, y1], outline=col, width=lw)
    d.line([(x0, y0 + h * 0.42), (x1, y0 + h * 0.42)], fill=col, width=lw)
    d.line([(x0, y0 + h * 0.72), (x1, y0 + h * 0.72)], fill=col, width=lw)
    d.line([(cx, y0), (cx, y1)], fill=col, width=lw)
    # профиль-ручка сверху
    d.line([(x0, y0 - h * 0.10), (x1, y0 - h * 0.10)], fill=GOLDL, width=max(2, lw - 1))


def icon_kuhni(d, W, H, col, lw):
    """Кухонный фронт: верхние шкафы, столешница, нижние фасады."""
    x0, x1 = W * 0.24, W * 0.76
    # верхние шкафы
    d.rectangle([x0, H * 0.18, x1, H * 0.40], outline=col, width=lw)
    d.line([(W / 2, H * 0.18), (W / 2, H * 0.40)], fill=col, width=lw)
    # фартук и столешница
    d.line([(x0 - W * 0.04, H * 0.50), (x1 + W * 0.04, H * 0.50)], fill=col, width=lw)
    d.line([(x0 - W * 0.04, H * 0.44), (x1 + W * 0.04, H * 0.44)], fill=GOLDL,
           width=max(2, lw - 2))
    # нижние фасады с ручкой-профилем
    d.rectangle([x0, H * 0.50, x1, H * 0.82], outline=col, width=lw)
    d.line([(W / 2, H * 0.50), (W / 2, H * 0.82)], fill=col, width=lw)
    d.line([(x0, H * 0.62), (x1, H * 0.62)], fill=col, width=lw)
    for dx in (-W * 0.03, W * 0.03):
        d.line([(W / 2 + dx, H * 0.545), (W / 2 + dx, H * 0.60)], fill=GOLDL,
               width=max(2, lw - 1))


def icon_garderob(d, W, H, col, lw):
    """Шкаф: закрытые фасады сверху, открытая секция со штангой снизу."""
    x0, x1 = W * 0.28, W * 0.72
    y0, y1 = H * 0.20, H * 0.82
    d.rectangle([x0, y0, x1, y1], outline=col, width=lw)
    d.line([(x0, H * 0.52), (x1, H * 0.52)], fill=col, width=lw)
    d.line([(W / 2, y0), (W / 2, H * 0.52)], fill=col, width=lw)
    for dx in (-W * 0.032, W * 0.032):
        d.line([(W / 2 + dx, H * 0.28), (W / 2 + dx, H * 0.38)], fill=GOLDL, width=max(2, lw - 1))
    # штанга и две вешалки в открытой секции
    ry = H * 0.58
    d.line([(x0 + W * 0.04, ry), (x1 - W * 0.04, ry)], fill=GOLDL, width=max(2, lw - 1))
    for cx in (W * 0.405, W * 0.595):
        d.line([(cx, ry), (cx, ry + H * 0.045)], fill=col, width=lw)
        d.arc([cx - W * 0.035, ry + H * 0.030, cx + W * 0.035, ry + H * 0.080], 200, 340,
              fill=col, width=lw)
        d.rectangle([cx - W * 0.042, ry + H * 0.065, cx + W * 0.042, H * 0.79],
                    outline=col, width=lw)


def icon_vannaya(d, W, H, col, lw):
    # зеркало
    d.ellipse([W * 0.34, H * 0.14, W * 0.66, H * 0.40], outline=col, width=lw)
    # смеситель
    d.line([(W * 0.62, H * 0.52), (W * 0.62, H * 0.45)], fill=GOLDL, width=max(2, lw - 1))
    d.line([(W * 0.62, H * 0.45), (W * 0.56, H * 0.45)], fill=GOLDL, width=max(2, lw - 1))
    # столешница
    d.rectangle([W * 0.23, H * 0.52, W * 0.77, H * 0.58], outline=col, width=lw)
    # чаша-раковина
    d.arc([W * 0.37, H * 0.40, W * 0.63, H * 0.58], 0, 180, fill=col, width=lw)
    # тумба с двумя фасадами и латунными ручками
    d.rectangle([W * 0.25, H * 0.58, W * 0.75, H * 0.82], outline=col, width=lw)
    d.line([(W / 2, H * 0.58), (W / 2, H * 0.82)], fill=col, width=lw)
    for dx in (-W * 0.03, W * 0.03):
        d.line([(W / 2 + dx, H * 0.64), (W / 2 + dx, H * 0.70)], fill=GOLDL, width=max(2, lw - 1))


def icon_prihozhie(d, W, H, col, lw):
    """Прихожая: открытая ниша с крючком и одеждой, банкетка, зеркало."""
    x0, x1 = W * 0.26, W * 0.66
    y0, y1 = H * 0.20, H * 0.82
    d.rectangle([x0, y0, x1, y1], outline=col, width=lw)
    # ниша сверху: полка и крючки
    d.line([(x0, H * 0.34), (x1, H * 0.34)], fill=col, width=lw)
    for cx in (x0 + W * 0.055, x1 - W * 0.055):
        d.line([(cx, H * 0.34), (cx, H * 0.38)], fill=GOLDL, width=max(2, lw - 1))
        d.arc([cx - W * 0.018, H * 0.375, cx + W * 0.018, H * 0.40], 180, 330,
              fill=GOLDL, width=max(2, lw - 1))
    # одежда на левом крючке: плечи, рукава и подол
    cx = x0 + W * 0.055
    d.polygon([(cx, H * 0.395), (cx - W * 0.075, H * 0.46), (cx - W * 0.062, H * 0.615),
               (cx + W * 0.062, H * 0.615), (cx + W * 0.075, H * 0.46)],
              outline=col, width=lw)
    d.line([(cx, H * 0.40), (cx, H * 0.615)], fill=col, width=max(2, lw - 2))
    # банкетка
    d.rectangle([x0 + W * 0.02, H * 0.66, x1 - W * 0.02, H * 0.70], outline=col, width=lw)
    d.line([(x0 + W * 0.05, H * 0.70), (x0 + W * 0.05, H * 0.78)], fill=col, width=lw)
    d.line([(x1 - W * 0.05, H * 0.70), (x1 - W * 0.05, H * 0.78)], fill=col, width=lw)
    # зеркало в полный рост справа
    d.rectangle([W * 0.72, H * 0.26, W * 0.82, H * 0.62], outline=col, width=lw)


MENU = [
    ('kuhni', 'КУХНИ', icon_kuhni),
    ('garderobnye', 'ГАРДЕРОБНЫЕ', icon_garderob),
    ('vannaya', 'ВАННАЯ', icon_vannaya),
    ('prihozhie', 'ПРИХОЖИЕ', icon_prihozhie),
]


def menu_icons():
    for slug, label, fn in MENU:
        S = 400
        img = paper((S, S))
        d = ImageDraw.Draw(img, 'RGBA')
        # верхняя латунная полоска — общий приём всех визуалов
        d.rectangle([0, 0, S, 6], fill=rgba(GOLDL, 205))
        _frame(d, S, S, 22, LINE, 2)
        fn(d, S, S * 0.90, INK, 5)
        text(d, (S / 2, S - 62), label, F('golos-m', 21), rgba(GOLD, 255), 0.20, 'ma')
        save(img, f'menu/menu-{slug}-400x400.png')


# ============================================================== ВИДЖЕТ
def widget():
    W, H = 1530, 384
    img = paper((W, H))
    d = ImageDraw.Draw(img, 'RGBA')
    d.rectangle([0, 0, W, 7], fill=rgba(GOLDL, 205))

    X = 76
    wordmark_tver(d, (X, 66), 38, 'dark', gap=13, tracking=0.28)
    caps_rule(d, (X, 142), 'бесплатный проект и расчёт', F('golos', 13),
              rgba(GOLD, 255), rule=(GOLDL, 2, 13), tracking=0.24)
    text(d, (X - 2, 178), 'Рассчитаем вашу кухню', F('playfair', 48), INK, 0, 'la')
    text(d, (X - 2, 238), 'за один разговор', F('playfair', 48), rgba(GOLD, 255), 0, 'la')
    text(d, (X, 314), 'Без обязательств · ответим в сообщениях сообщества', F('golos', 18),
         rgba(STONE, 255), 0.02, 'la')

    # пара в круглом паспарту с латунным ободком — справа
    r = 132
    cx, cy = W - 210, H / 2
    im = cover(COUPLE_VERT, (r * 2, r * 2), focus=(0.50, 0.46), zoom=1.60)
    im = lighten(im, (0.5, 0.5), (0.5, 0.5), 0.16)
    mask = Image.new('L', (r * 2, r * 2), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, r * 2 - 1, r * 2 - 1], fill=255)
    img.paste(im, (int(cx - r), int(cy - r)), mask)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=rgba(GOLDL, 210), width=3)
    d.ellipse([cx - r - 12, cy - r - 12, cx + r + 12, cy + r + 12],
              outline=rgba(GOLDL, 70), width=1)

    save(img, 'widget/widget-1530x384.jpg')


# ====================================================== ЖИВАЯ ОБЛОЖКА 9:16
def live_cover():
    W, H = 1080, 1920
    img = cover(COUPLE_VERT, (W, H), focus=(0.5, 0.22), zoom=1.30)
    img = ImageEnhance.Contrast(img).enhance(1.06)
    img = ImageEnhance.Color(img).enhance(1.06)
    img = lighten(img, (0.50, 0.50), (0.44, 0.26), 0.14)
    img = veil(img, [(0.00, rgba(SOOT, 240)), (0.14, rgba(INK, 210)),
                     (0.30, rgba(INK, 90)), (0.44, rgba(INK, 12)),
                     (0.62, rgba(INK, 8)), (0.80, rgba(SOOT, 90)),
                     (0.92, rgba(SOOT, 210)), (1.00, rgba(SOOT, 240))])
    img = grain(img, 7)
    d = ImageDraw.Draw(img, 'RGBA')
    X = 96
    wordmark_tver(d, (X, 190), 42, 'light', gap=14, tracking=0.30)
    caps_rule(d, (X, 300), 'индивидуальные кухни · тверь', F('golos', 15),
              rgba(CREAM, 210), rule=(GOLDL, 2, 14), tracking=0.24)
    fh = F('playfair', 84)
    text(d, (X - 3, 350), 'Кухни', fh, CREAM, 0, 'la')
    text(d, (X - 3, 446), 'на заказ', fh, CREAM, 0, 'la')
    text(d, (X - 3, 542), 'в Твери', fh, rgba(GOLDS, 255), 0, 'la')
    para(d, (X, 680), 'Проект, схемы электрики и расчёт — бесплатно.',
         F('golos', 28), rgba(CREAM, 234), 760, 40)

    rule(d, (X, 1600), 900, rgba(GOLDL, 110), 1.4)
    text(d, (X + 1, 1636), 'Роберт и Катя ведут проект лично',
         F('marck', 38), rgba(GOLDS, 250), 0, 'la')
    theses(d, (X, 1712), F('golos', 19), rgba(CREAM, 222), rgba(GOLDL, 170))
    save(img, 'cover/live-cover-1080x1920.jpg')


# ================================================= ТОВАРЫ: НАШИ РАБОТЫ
PRODUCTS = [
    ('kuhnya-s-ostrovom', 'kuhnya-gostinaya-s-ostrovom', 'Кухня-гостиная с островом',
     'Тверь · под ключ'),
    ('kuhnya-neoklassika', 'kuhnya-neoklassika-greyzh', 'Кухня в неоклассике',
     'Тверь · под ключ'),
    ('kuhnya-v-proektah', 'kuhnya-s-ugolkom', 'Угловая кухня по проекту',
     'Тверь · под ключ'),
]


def product_cards():
    """Карточки работ 1000×1000 — для витрины «Товары» и для постов.
    Подпись стоит на синей полке, а не поверх фотографии: кадры бывают
    и тёмные, и светлые, и текст на них читается через раз."""
    picks = [
        ('01', 'Кухня', 'с островом', 'kitchen-04@2x.webp', (0.5, 0.45)),
        ('02', 'Кухня', 'в неоклассике', 'kitchen-07@2x.webp', (0.5, 0.35)),
        ('03', 'Угловая', 'кухня', 'kitchen-03@2x.webp', (0.5, 0.45)),
    ]
    S = 1000
    PLATE = 250
    for (n, t1, t2, fname, focus) in picks:
        src = os.path.join(PHOTO, 'kitchens', fname)
        img = cover(Image.open(src), (S, S), focus=focus, zoom=1.0)
        img = ImageEnhance.Color(img).enhance(1.03)
        img = veil(img, [(0.00, rgba(SOOT, 130)), (0.14, rgba(SOOT, 12)),
                         (0.55, rgba(INK, 6)), (0.70, rgba(INK, 90)),
                         (1.00, rgba(SOOT, 200))])
        img = grain(img, 6)
        d = ImageDraw.Draw(img, 'RGBA')
        X = 64
        wordmark_tver(d, (X, 52), 27, 'light', gap=10, tracking=0.28)

        # синяя полка под подпись
        py = S - PLATE
        plate = linear((S, PLATE), [(0.00, rgba(COAL, 255)), (0.30, rgba(INK, 252)),
                                    (1.00, rgba(SOOT, 255))])
        img.paste(plate.convert('RGB'), (0, py))
        d = ImageDraw.Draw(img, 'RGBA')
        d.rectangle([0, py, S, py + 1.4], fill=rgba(GOLDL, 170))
        d.rectangle([X, py + 40, X + 46, py + 42], fill=rgba(GOLDL, 200))
        text(d, (X + 60, py + 28), n, F('golos-m', 17), rgba(GOLDS, 235), 0.22, 'la')
        text(d, (X + 100, py + 28), '·', F('golos', 17), rgba(GOLDS, 160), 0, 'la')
        text(d, (X + 118, py + 28), 'НАША РАБОТА', F('golos', 16), rgba(CREAM, 165), 0.18, 'la')
        text(d, (X - 3, py + 66), t1, F('playfair', 58), CREAM, 0, 'la')
        text(d, (X - 3, py + 128), t2, F('playfair', 58), rgba(GOLDS, 255), 0, 'la')
        text(d, (X, py + 208), 'Тверь · под ключ · гарантия 24 месяца',
             F('golos', 18), rgba(CREAM, 175), 0.02, 'la')
        save(img, f'products/product-{n}-1000x1000.jpg')


if __name__ == '__main__':
    avatar()
    services()
    menu_icons()
    widget()
    live_cover()
    product_cards()
