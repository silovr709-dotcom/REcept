# -*- coding: utf-8 -*-
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vk import *

COUPLE_VERT = Image.open(os.path.join(REPO, 'vk/_source/base_cover_vertical.jpg'))
COUPLE_WIDE = Image.open(os.path.join(REPO, 'vk/_source/base_cover_wide2.jpg'))

PHOTO = os.path.join(REPO, 'public/images')
SITE = 'tver-kuhni.ru'
PHONE = '+7 (910) 537-89-91'


def paper_poster(slug, overline, lines, items, foot_note, photo=None, tone='gold-last'):
    W, H = 1080, 1350
    img = paper((W, H))
    d = ImageDraw.Draw(img, 'RGBA')
    d.rectangle([0, 0, W, 8], fill=rgba(GOLDL, 205))
    X = 88

    wordmark_tver(d, (X, 88), 36, 'dark', gap=13, tracking=0.28)
    caps_rule(d, (X, 196), overline, F('golos', 15), rgba(GOLD, 255),
              rule=(GOLDL, 2, 15), tracking=0.24)

    y = 244
    fh = F('playfair', 62)
    for i, ln in enumerate(lines):
        col = rgba(GOLD, 255) if (i == len(lines) - 1 and tone == 'gold-last') else INK
        text(d, (X - 3, y), ln, fh, col, 0, 'la')
        y += 66
    y += 34

    for i, (n, title, sub) in enumerate(items):
        text(d, (X, y), n, F('corm-m', 32), rgba(GOLDL, 255), 0, 'la')
        text(d, (X + 72, y + 2), title, F('golos-m', 25), INK, 0, 'la')
        if sub:
            text(d, (X + 72, y + 37), sub, F('golos', 18), rgba(STONE, 255), 0, 'la')
        y += 70
        if i < len(items) - 1:
            d.rectangle([X, y - 18, W - X, y - 17], fill=rgba(LINE, 255))
        y += 13

    # нижняя полоса с фотографией: страница не заканчивается пустотой
    band_h = 310
    band_y = H - 450
    if photo:
        ph = cover(Image.open(photo), (W, band_h), focus=(0.5, 0.5), zoom=1.0)
        ph = veil(ph, [(0.00, rgba(INK, 150)), (0.22, rgba(INK, 20)),
                       (0.70, rgba(SOOT, 40)), (1.00, rgba(SOOT, 190))])
        ph = veil(ph, [(0.00, rgba(SOOT, 215)), (0.34, rgba(SOOT, 120)),
                       (0.58, rgba(SOOT, 0)), (1.00, rgba(SOOT, 0))], horizontal=True)
        img.paste(ph.convert('RGB'), (0, band_y))
        d = ImageDraw.Draw(img, 'RGBA')
        d.rectangle([0, band_y, W, band_y + 3], fill=rgba(GOLDL, 190))
        text(d, (X, band_y + 40), 'наши работы — в витрине сообщества',
             F('golos', 19), rgba(CREAM, 225), 0.02, 'la')
        text(d, (X, band_y + 74), 'Кухни, гардеробные, мебель для ванной',
             F('golos', 17), rgba(CREAM, 175), 0.02, 'la')

    d.rectangle([X, H - 118, W - X, H - 117], fill=rgba(LINE, 255))
    text(d, (X, H - 92), foot_note, F('golos', 18), rgba(STONE, 255), 0.02, 'la')
    text(d, (X, H - 54), SITE, F('golos-m', 20), rgba(GOLD, 255), 0.04, 'la')
    text(d, (W - X, H - 54), PHONE, F('golos-m', 20), INK, 0.02, 'ra')

    save(img, f'posts/{slug}.jpg')


def post_welcome():
    """Закреплённый пост: кто мы, что обещаем, чем это отличается."""
    W, H = 1080, 1350
    TOP, BAND, BOTTOM = 620, 480, 250
    img = linear((W, TOP), [(0.00, rgba(SOOT, 255)), (0.55, rgba(INK, 255)),
                            (1.00, rgba(COAL, 255))]).convert('RGB')
    d = ImageDraw.Draw(img, 'RGBA')
    X = 84
    wordmark_tver(d, (X, 78), 40, 'light', gap=14, tracking=0.30)
    caps_rule(d, (X, 188), 'мебельное ателье · тверь', F('golos', 15),
              rgba(CREAM, 210), rule=(GOLDL, 2, 14), tracking=0.24)
    fh = F('playfair', 70)
    text(d, (X - 3, 238), 'Кухни,', fh, CREAM, 0, 'la')
    text(d, (X - 3, 318), 'которые делают', fh, CREAM, 0, 'la')
    text(d, (X - 3, 398), 'два человека', fh, rgba(GOLDS, 255), 0, 'la')
    para(d, (X, 520), 'Проектируем, заказываем на производстве, привозим и собираем сами. '
                       'Без менеджеров-посредников.',
         F('golos', 23), rgba(CREAM, 220), 900, 34)

    canvas = Image.new('RGB', (W, H), SOOT)
    canvas.paste(img, (0, 0))

    photo = cover(COUPLE_WIDE, (W, BAND), focus=(0.55, 0.40), zoom=1.16)
    photo = ImageEnhance.Color(photo).enhance(1.04)
    photo = lighten(photo, (0.5, 0.45), (0.5, 0.35), 0.10)
    photo = veil(photo, [(0.00, rgba(INK, 90)), (0.16, rgba(INK, 0)),
                         (0.80, rgba(SOOT, 40)), (1.00, rgba(SOOT, 190))])
    canvas.paste(photo.convert('RGB'), (0, TOP))

    plate = linear((W, BOTTOM), [(0.00, rgba(INK, 255)), (0.55, rgba(SOOT, 255)),
                                 (1.00, rgba(SOOT, 255))]).convert('RGB')
    canvas.paste(plate, (0, TOP + BAND))
    d = ImageDraw.Draw(canvas, 'RGBA')
    d.rectangle([0, TOP + BAND, W, TOP + BAND + 2], fill=rgba(GOLDL, 180))
    d.rectangle([0, TOP, W, TOP + 1.4], fill=rgba(GOLDL, 90))

    y = TOP + BAND + 34
    for f_ in ['Проект и визуализация — бесплатно', 'Схемы электрики — бесплатно',
               'Оплата 50 / 50, без полной предоплаты', 'Гарантия 24 месяца']:
        d.rectangle([X, y + 13, X + 28, y + 15], fill=rgba(GOLDS, 220))
        text(d, (X + 46, y), f_, F('golos', 22), rgba(CREAM, 232), 0, 'la')
        y += 44

    d.rectangle([X, H - 56, W - X, H - 55], fill=rgba(GOLDL, 70))
    text(d, (X, H - 30), 'Роберт и Катя · Тверь, проспект Калинина, 13А',
         F('golos', 17), rgba(CREAM, 180), 0.02, 'la')
    text(d, (W - X, H - 30), SITE, F('golos-m', 18), rgba(GOLDS, 240), 0.02, 'ra')
    save(canvas, 'posts/post-welcome-1080x1350.jpg')


def post_process():
    paper_poster(
        'post-process-1080x1350',
        'как всё устроено',
        ['От замера', 'до сборки'],
        [('01', 'Разговор', '10 минут, без проекта и точных размеров'),
         ('02', 'Замер', 'смотрим окна, короба, вентиляцию, выводы'),
         ('03', 'Проект', 'планировка, материалы, визуализация — бесплатно'),
         ('04', 'Электрика', 'схему передаём вашему мастеру до работ'),
         ('05', 'Производство', 'контролируем размеры, цвет и комплектацию'),
         ('06', 'Доставка и сборка', 'сами, в Твери, с гарантией 24 месяца')],
        'Ведём проект лично: Роберт и Катя',
        photo=os.path.join(PHOTO, 'kitchens', 'kitchen-04@2x.webp'))


def post_free():
    paper_poster(
        'post-free-1080x1350',
        'что не стоит денег',
        ['Сначала', 'проект'],
        [('01', 'Планировка и визуализация', 'вы видите кухню до оплаты'),
         ('02', 'Схемы электрики', 'для вашего электрика и прораба'),
         ('03', 'Расчёт с расшифровкой', 'из чего складывается цена'),
         ('04', 'Правки проекта', 'столько раз, сколько нужно'),
         ('05', 'Разговор с вашими мастерами', 'пересказывать ничего не нужно')],
        'Проектирование бесплатное — это часть работы',
        photo=os.path.join(PHOTO, 'kitchens', 'kitchen-07@2x.webp'))


def post_price():
    W, H = 1080, 1350
    img = paper((W, H))
    d = ImageDraw.Draw(img, 'RGBA')
    d.rectangle([0, 0, W, 8], fill=rgba(GOLDL, 205))
    X = 88
    wordmark_tver(d, (X, 92), 36, 'dark', gap=13, tracking=0.28)
    caps_rule(d, (X, 200), 'условия', F('golos', 15), rgba(GOLD, 255),
              rule=(GOLDL, 2, 15), tracking=0.24)
    text(d, (X - 3, 250), 'Оплата 50 / 50', F('playfair', 68), INK, 0, 'la')
    text(d, (X - 3, 330), 'и гарантия 24 месяца', F('playfair', 46), rgba(GOLD, 255), 0, 'la')
    text(d, (X, 420), 'Полную предоплату не берём и авансов «на материалы» не просим.',
         F('golos', 21), rgba(STONE, 255), 0.0, 'la')

    # две половины
    by = 500
    bh = 300
    for i, (t, sub, note) in enumerate([
            ('50 %', 'при запуске', 'когда проект согласован и заказ уходит в производство'),
            ('50 %', 'при готовности', 'когда мебель готова на фабрике — дальше доставка и сборка')]):
        bx = X + i * ((W - 2 * X) / 2 + 24)
        bw = (W - 2 * X - 24) / 2
        d.rectangle([bx, by, bx + bw, by + bh], outline=rgba(LINE, 255), width=2)
        d.rectangle([bx, by, bx + bw, by + 5], fill=rgba(GOLDL, 205))
        text(d, (bx + 32, by + 44), t, F('playfair', 66), INK, 0, 'la')
        text(d, (bx + 32, by + 126), sub.upper(), F('golos-m', 17), rgba(GOLD, 255), 0.16, 'la')
        para(d, (bx + 32, by + 172), note, F('golos', 19), rgba(STONE, 255), bw - 64, 27)

    y = by + bh + 60
    for t in ['Гарантия 24 месяца на изделие',
              'Свои ошибки исправляем за свой счёт',
              'Доставка и сборка в Твери — наши',
              'Телефон работает и после установки']:
        d.rectangle([X, y + 12, X + 26, y + 14], fill=rgba(GOLDL, 220))
        text(d, (X + 44, y), t, F('golos', 22), rgba(INK, 255), 0, 'la')
        y += 50

    d.rectangle([X, H - 150, W - X, H - 149], fill=rgba(LINE, 255))
    text(d, (X, H - 122), 'Считаем по вашему проекту: после замера и планировки — конкретная цифра',
         F('golos', 17), rgba(STONE, 255), 0.0, 'la')
    text(d, (X, H - 84), SITE, F('golos-m', 20), rgba(GOLD, 255), 0.04, 'la')
    text(d, (W - X, H - 84), PHONE, F('golos-m', 20), INK, 0.02, 'ra')
    save(img, 'posts/post-price-1080x1350.jpg')


def story_welcome():
    W, H = 1080, 1920
    img = cover(COUPLE_WIDE, (W, H), focus=(0.62, 0.05), zoom=1.55)
    img = ImageEnhance.Contrast(img).enhance(1.05)
    img = ImageEnhance.Color(img).enhance(1.06)
    img = lighten(img, (0.55, 0.48), (0.42, 0.22), 0.12)
    img = veil(img, [(0.00, rgba(SOOT, 246)), (0.20, rgba(INK, 224)),
                     (0.38, rgba(INK, 90)), (0.52, rgba(INK, 10)),
                     (0.70, rgba(INK, 20)), (0.88, rgba(SOOT, 190)),
                     (1.00, rgba(SOOT, 240))])
    img = grain(img, 7)
    d = ImageDraw.Draw(img, 'RGBA')
    X = 90
    wordmark_tver(d, (X, 200), 40, 'light', gap=14, tracking=0.30)
    caps_rule(d, (X, 306), 'мебельное ателье · тверь', F('golos', 15),
              rgba(CREAM, 210), rule=(GOLDL, 2, 14), tracking=0.24)
    fh = F('playfair', 78)
    text(d, (X - 3, 356), 'Кухни', fh, CREAM, 0, 'la')
    text(d, (X - 3, 448), 'на заказ', fh, CREAM, 0, 'la')
    text(d, (X - 3, 540), 'в Твери', fh, rgba(GOLDS, 255), 0, 'la')
    para(d, (X, 668), 'Проект, схемы электрики и расчёт — бесплатно.',
         F('golos', 28), rgba(CREAM, 232), 780, 40)

    y = 1560
    for t in ['Проект бесплатно', 'Оплата 50 / 50', 'Гарантия 24 месяца']:
        d.rectangle([X, y + 14, X + 30, y + 16], fill=rgba(GOLDS, 220))
        text(d, (X + 50, y), t, F('golos', 27), rgba(CREAM, 235), 0, 'la')
        y += 70
    text(d, (X, 1780), SITE, F('golos-m', 24), rgba(GOLDS, 245), 0.04, 'la')
    save(img, 'stories/story-welcome-1080x1920.jpg')


if __name__ == '__main__':
    post_welcome()
    post_process()
    post_free()
    post_price()
    story_welcome()
