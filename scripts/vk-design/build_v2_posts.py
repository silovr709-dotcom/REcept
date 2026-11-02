# -*- coding: utf-8 -*-
"""
Система публикаций РЕцепт: пять визуальных направлений в одной стилистике.

A. ТЕТРАДЬ    — бумага с миллиметровкой, нумерованный список. Экспертиза,
                инструкции, «как устроено», разборы ошибок.
B. РАБОТА     — фотография во всю ширину и оливковая плашка. Проекты.
C. МНЕНИЕ     — плотное оливковое поле и крупная фраза. Позиция, провокация.
D. ЛИЧНОЕ     — кадр с Робертом и Катей почти во весь формат. Люди, процесс.
E. МАТЕРИАЛЫ  — сетка образцов и марок на бумаге. Фактуры и поставщики.

Плюс два вспомогательных: отзыв и обложка клипа/истории.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vk2 import *

W, H = 1080, 1350
X = 76           # единое поле слева и справа
TOP = 74         # единая высота знака


def stamp(d, tone='dark', sub='ТВЕРЬ'):
    """Знак в одном и том же месте на любом носителе."""
    if tone == 'dark':
        wordmark(d, (X, TOP), 40, 'la', color=CREAM, gold=BRASSS)
        d.rectangle([X + 148, TOP + 26, X + 186, TOP + 27.4], fill=rgba(BRASSL, 200))
        text(d, (X + 202, TOP + 14), sub, F('golos', 13), rgba(CREAM, 170), 0.30, 'la')
    else:
        wordmark_tver(d, (X, TOP), 40, gap=15, tracking=0.30)


def foot(d, tone='dark', note='Роберт и Катя ведут проект лично'):
    if tone == 'dark':
        d.rectangle([X, H - 118, W - X, H - 117], fill=rgba(BRASSL, 90))
        text(d, (X + 1, H - 92), note, F('marck', 32), rgba(BRASSL, 245), 0, 'la')
        text(d, (W - X, H - 88), 'РЕцепт · Тверь', F('golos', 15),
             rgba(CREAM, 130), 0.18, 'ra')
    else:
        d.rectangle([X, H - 118, W - X, H - 117], fill=rgba(LINED, 255))
        text(d, (X + 1, H - 92), note, F('marck', 32), rgba(BRASS, 235), 0, 'la')
        text(d, (W - X, H - 88), 'РЕцепт · Тверь', F('golos', 15),
             rgba(CLAY, 255), 0.18, 'ra')


# ------------------------------------------------------------------ A. ТЕТРАДЬ
def post_notebook(slug, eyebrow, lines, items, note=None, cta=None):
    img = paper((W, H))
    d = ImageDraw.Draw(img, 'RGBA')
    d.rectangle([0, 0, W, 8], fill=rgba(BRASSL, 215))
    crop_marks(d, (W, H), inset=30, length=34, color=rgba(BRASSL, 110))
    stamp(d, 'light')

    y = TOP + 96
    caps_rule(d, (X, y), eyebrow, F('golos', 16), rgba(CLAY, 255),
              w=26, gap=14, tracking=0.24)
    y += 56
    for i, ln in enumerate(lines):
        size = 70 if i < len(lines) - 1 else 70
        f = F('playfair', size)
        while tw(d, ln, f) > W - 2 * X and size > 40:
            size -= 2
            f = F('playfair', size)
        text(d, (X - 3, y), ln, f, INK if i < len(lines) - 1 else OLIVE, 0, 'la')
        y += int(size * 1.08)
    y += 22
    dim_line(d, X, X + 300, y, rgba(BRASSL, 190), 1.4, 9)
    y += 44

    # пункты распределяются по всей оставшейся высоте — лист не «недописан»
    bottom = H - (250 if note else 200)
    avail = bottom - y
    step = min(190, max(104, avail / max(1, len(items))))
    for i, (n, title, sub) in enumerate(items):
        text(d, (X, y), n, F('golos-m', 18), rgba(BRASSL, 255), 0.18, 'la')
        d.rectangle([X + 52, y + 11, X + 104, y + 12.2], fill=rgba(LINED, 255))
        text(d, (X + 120, y - 2), title, F('golos-m', 26), INK, 0, 'la')
        if sub:
            para(d, (X + 120, y + 36), sub, F('golos', 20), rgba(CLAY, 255),
                 W - X - 120, 28)
        if i < len(items) - 1:
            d.rectangle([X, y + step - 34, W - X, y + step - 33], fill=rgba(LINED, 255))
        y += step

    if note:
        text(d, (X + 1, H - 172), note, F('marck', 34), rgba(BRASS, 240), 0, 'la')
    foot(d, 'light')
    save(img, f'posts/{slug}.jpg')


# ------------------------------------------------------------------- B. РАБОТА
def post_work(slug, n, title, sub, photo, focus=(0.5, 0.45), place='Тверь'):
    PH = 900
    ph = cover(src(photo), (W, PH), focus=focus, zoom=1.0)
    ph = warm_grade(ph, sat=1.03, contrast=1.03, mix=0.05)
    ph = lift(ph, (0.5, 0.45), (0.45, 0.3), 0.06)
    canvas = Image.new('RGB', (W, H), GRAPH)
    canvas.paste(ph.convert('RGB'), (0, 0))
    plate = vgrad((W, H - PH), [(0.0, rgba(OLIVED, 255)), (1.0, rgba(GRAPH, 255))]).convert('RGB')
    canvas.paste(plate, (0, PH))
    canvas = grain(canvas, 5)
    d = ImageDraw.Draw(canvas, 'RGBA')
    d.rectangle([0, PH - 2, W, PH], fill=rgba(BRASSL, 215))
    stamp(d, 'dark')

    y = PH + 62
    text(d, (X, y), n, F('golos-m', 18), rgba(BRASSL, 255), 0.22, 'la')
    d.rectangle([X + 52, y + 11, X + 108, y + 12.2], fill=rgba(BRASSL, 190))
    text(d, (X + 124, y), f'НАША РАБОТА · {place.upper()}', F('golos', 15),
         rgba(CREAM, 180), 0.18, 'la')
    text(d, (X - 3, y + 34), title, F('playfair', 64), CREAM, 0, 'la')
    para(d, (X, y + 132), sub, F('golos', 24), rgba(CREAM, 220), W - 2 * X, 35)
    foot(d, 'dark')
    save(canvas, f'posts/{slug}.jpg')


# ------------------------------------------------------------------- C. МНЕНИЕ
def post_opinion(slug, eyebrow, statement, support, hand=None, tail=None):
    img = vgrad((W, H), [(0.0, rgba(OLIVED, 255)), (0.6, rgba(OLIVE, 255)),
                         (1.0, rgba(GRAPH, 255))]).convert('RGB')
    img = grain(img, 7)
    d = ImageDraw.Draw(img, 'RGBA')
    d.rectangle([0, 0, W, 8], fill=rgba(BRASSL, 215))
    crop_marks(d, (W, H), inset=30, length=34, color=rgba(BRASSL, 130))
    stamp(d, 'dark')

    y = TOP + 110
    caps_rule(d, (X, y), eyebrow, F('golos', 16), rgba(BRASSL, 255),
              w=26, gap=14, tracking=0.24)
    y += 66
    f = F('playfair', 74)
    for ln in wrap(d, statement, f, W - 2 * X):
        text(d, (X - 3, y), ln, f, CREAM, 0, 'la')
        y += int(74 * 1.06)
    y += 18

    # латунная линия и опора под тезисом
    d.rectangle([X, y, X + 84, y + 2], fill=rgba(BRASSL, 230))
    y += 40
    y = para(d, (X, y), support, F('golos', 26), rgba(CREAM, 215), W - 2 * X - 40, 38)
    if hand:
        text(d, (X + 1, y + 34), hand, F('marck', 36), rgba(BRASSL, 250), 0, 'la')
    if tail:
        text(d, (X, H - 220), tail, F('golos', 20), rgba(CREAM, 165), 0.03, 'la')
    foot(d, 'dark')
    save(img, f'posts/{slug}.jpg')


# -------------------------------------------------------------------- D. ЛИЧНОЕ
def post_personal(slug, photo, line1, line2, note, focus=(0.5, 0.3), zoom=1.0):
    img = cover(src(photo), (W, H), focus=focus, zoom=zoom)
    img = warm_grade(img, sat=1.04, contrast=1.05, brightness=0.99, mix=0.05)
    img = lift(img, (0.5, 0.42), (0.42, 0.26), 0.10)
    img = veil(img, [(0.0, rgba(GRAPH, 130)), (0.16, rgba(GRAPH, 10)),
                     (0.42, rgba(GRAPH, 0)), (0.60, rgba(OLIVED, 90)),
                     (0.74, rgba(OLIVED, 210)), (1.0, rgba(GRAPH, 248))]).convert('RGB')
    img = grain(img, 5)
    d = ImageDraw.Draw(img, 'RGBA')
    stamp(d, 'dark')
    caps_rule(d, (X, TOP + 92), 'мебельное ателье · тверь', F('golos', 15),
              rgba(CREAM, 200), w=24, gap=13, tracking=0.24)
    text(d, (X - 3, H - 372), line1, F('playfair', 62), CREAM, 0, 'la')
    text(d, (X - 3, H - 302), line2, F('playfair', 62), rgba(BRASSL, 255), 0, 'la')
    text(d, (X + 1, H - 200), note, F('marck', 34), rgba(BRASSL, 245), 0, 'la')
    foot(d, 'dark')
    save(img, f'posts/{slug}.jpg')


# ---------------------------------------------------------------- E. МАТЕРИАЛЫ
def post_materials(slug, eyebrow, lines, samples, brands):
    """samples: [(файл, подпись)] — настоящие крупные планы из портфолио."""
    img = paper((W, H))
    d = ImageDraw.Draw(img, 'RGBA')
    d.rectangle([0, 0, W, 8], fill=rgba(BRASSL, 215))
    crop_marks(d, (W, H), inset=30, length=34, color=rgba(BRASSL, 110))
    stamp(d, 'light')

    y = TOP + 96
    caps_rule(d, (X, y), eyebrow, F('golos', 16), rgba(CLAY, 255),
              w=26, gap=14, tracking=0.24)
    y += 56
    for i, ln in enumerate(lines):
        size = 68
        f = F('playfair', size)
        while tw(d, ln, f) > W - 2 * X and size > 40:
            size -= 2
            f = F('playfair', size)
        text(d, (X - 3, y), ln, f, INK if i < len(lines) - 1 else OLIVE, 0, 'la')
        y += int(size * 1.08)
    y += 30

    # сетка образцов
    n = len(samples)
    gap = 14
    cw = (W - 2 * X - gap * (n - 1)) / n
    for i, (path, label) in enumerate(samples):
        x = X + i * (cw + gap)
        im = cover(load(path), (int(cw), int(cw)), focus=(0.5, 0.5), zoom=1.0)
        im = warm_grade(im, sat=1.02, mix=0.04)
        img.paste(im.convert('RGB'), (int(x), int(y)))
        d2 = ImageDraw.Draw(img, 'RGBA')
        d2.rectangle([x, y, x + cw, y + cw], outline=rgba(BRASSL, 170), width=2)
        text(d2, (x, y + cw + 16), label, F('golos', 16), rgba(CLAY, 255), 0.04, 'la')
    y += cw + 74

    # марки
    d.rectangle([X, y, W - X, y + 1.4], fill=rgba(LINED, 255))
    y += 30
    step = min(120, max(52, (H - 250 - y) / max(1, len(brands))))
    for label, val in brands:
        text(d, (X, y), label, F('golos-m', 19), rgba(OLIVE, 255), 0.02, 'la')
        para(d, (X + 250, y - 1), val, F('golos', 19), rgba(CLAY, 255),
             W - X - 250, 26)
        y += step
    foot(d, 'light')
    save(img, f'posts/{slug}.jpg')


# -------------------------------------------------------------------- ОТЗЫВ
def post_review(slug, quote, author, source='Яндекс Карты · 5,0 · 34 отзыва'):
    img = paper((W, H))
    d = ImageDraw.Draw(img, 'RGBA')
    d.rectangle([0, 0, W, 8], fill=rgba(BRASSL, 215))
    crop_marks(d, (W, H), inset=30, length=34, color=rgba(BRASSL, 110))
    stamp(d, 'light')
    caps_rule(d, (X, TOP + 96), 'отзывы', F('golos', 16), rgba(CLAY, 255),
              w=26, gap=14, tracking=0.24)

    # большая латунная кавычка
    f = F('playfair', 54)
    lines = wrap(d, quote, f, W - 2 * X)
    block = 130 + len(lines) * 70 + 96
    y = TOP + 130 + max(0, (H - 260 - (TOP + 130) - block) / 2)
    fq = F('playfair', 200)
    text(d, (X - 10, y), '«', fq, rgba(BRASSL, 235), 0, 'la')
    y += 100
    for ln in lines:
        text(d, (X, y), ln, f, INK, 0, 'la')
        y += 70
    y += 40
    dim_line(d, X, X + 220, y, rgba(BRASSL, 190), 1.4, 9)
    text(d, (X, y + 24), author, F('golos-m', 24), OLIVE, 0, 'la')
    text(d, (X, y + 60), source, F('golos', 18), rgba(CLAY, 255), 0.02, 'la')
    foot(d, 'light', note='Спасибо, что разрешили написать')
    save(img, f'posts/{slug}.jpg')


# ---------------------------------------------- ОБЛОЖКА КЛИПА / ИСТОРИИ 9:16
def story(slug, photo, title_lines, kicker, note=None, focus=(0.5, 0.4), zoom=1.0,
          tone='dark'):
    w, h = 1080, 1920
    img = cover(src(photo), (w, h), focus=focus, zoom=zoom)
    img = warm_grade(img, sat=1.04, contrast=1.04, mix=0.05)
    img = lift(img, (0.5, 0.42), (0.44, 0.26), 0.10)
    img = veil(img, [(0.0, rgba(GRAPH, 200)), (0.14, rgba(GRAPH, 60)),
                     (0.34, rgba(GRAPH, 0)), (0.56, rgba(OLIVED, 110)),
                     (0.70, rgba(OLIVED, 235)), (1.0, rgba(GRAPH, 252))]).convert('RGB')
    img = grain(img, 5)
    d = ImageDraw.Draw(img, 'RGBA')
    wordmark(d, (X, 210), 40, 'la', color=CREAM, gold=BRASSS)
    d.rectangle([X + 148, 236, X + 186, 237.4], fill=rgba(BRASSL, 200))
    text(d, (X + 202, 224), 'ТВЕРЬ', F('golos', 13), rgba(CREAM, 170), 0.30, 'la')

    y = 1330
    caps_rule(d, (X, y), kicker, F('golos', 16), rgba(BRASSL, 255),
              w=24, gap=13, tracking=0.24)
    y += 60
    for i, ln in enumerate(title_lines):
        size = 74
        f = F('playfair', size)
        while tw(d, ln, f) > w - 2 * X and size > 40:
            size -= 2
            f = F('playfair', size)
        text(d, (X - 3, y), ln, f, CREAM if i < len(title_lines) - 1
             else rgba(BRASSL, 255), 0, 'la')
        y += int(size * 1.08)
    if note:
        text(d, (X + 1, y + 26), note, F('marck', 34), rgba(BRASSL, 245), 0, 'la')
    save(img, f'stories/{slug}.jpg')


def clip_cover(slug, photo, headline, sub, focus=(0.5, 0.35), zoom=1.0):
    """Обложка клипа: ВК режет её в 9:16 и накладывает название клипа снизу."""
    w, h = 1080, 1920
    img = cover(src(photo), (w, h), focus=focus, zoom=zoom)
    img = warm_grade(img, sat=1.05, contrast=1.06, mix=0.05)
    img = lift(img, (0.5, 0.4), (0.44, 0.26), 0.10)
    img = veil(img, [(0.0, rgba(GRAPH, 60)), (0.30, rgba(GRAPH, 10)),
                     (0.52, rgba(OLIVED, 120)), (0.66, rgba(OLIVED, 235)),
                     (0.80, rgba(GRAPH, 252)), (1.0, rgba(GRAPH, 255))]).convert('RGB')
    img = grain(img, 5)
    d = ImageDraw.Draw(img, 'RGBA')
    text(d, (X, 260), 'РЕцепт', F('corm', 44), CREAM, 0, 'la')
    y = 1290
    d.rectangle([X, y, X + 60, y + 3], fill=rgba(BRASSL, 230))
    f = F('playfair', 86)
    y += 40
    for ln in wrap(d, headline, f, w - 2 * X):
        text(d, (X - 3, y), ln, f, CREAM, 0, 'la')
        y += 92
    text(d, (X, y + 16), sub, F('golos', 26), rgba(BRASSL, 245), 0.02, 'la')
    save(img, f'clips/{slug}.jpg')


if __name__ == '__main__':
    post_notebook(
        'post-01-pinned',
        'мебельное ателье · тверь · с 2004 года',
        ['Кухни, которые', 'собираем сами'],
        [('01', 'Роберт', 'замер, проект, производство, монтаж'),
         ('02', 'Катя', 'планировка, материалы, свет и цвет'),
         ('03', 'Вдвоём', 'ведут ваш проект от первого разговора до сборки')],
        note='Без отдела продаж и менеджеров-посредников')

    post_work('post-02-work', '01', 'Кухня-гостиная',
              'Остров с дубовой столешницей, свет без верхних шкафов и место, '
              'где готовить вдвоём удобно.', 'photo-13-island-real.jpg',
              focus=(0.5, 0.42))

    post_opinion(
        'post-03-opinion',
        'наше мнение',
        'Хорошая кухня не начинается с фасадов',
        'Она начинается с вопроса «кто и как здесь готовит». Планировка, '
        'эргономика и свет решают больше, чем цвет плёнки. Поэтому мы '
        'сначала разбираемся в быте — и только потом показываем образцы.',
        hand='Сначала чертёж, потом красота')

    post_personal(
        'post-04-personal', 'photo-12-pair-navy-tall.jpg',
        'Проект делают', 'два человека',
        'И это единственный отдел продаж в ателье',
        focus=(0.5, 0.16), zoom=1.16)

    post_materials(
        'post-05-materials',
        'материалы',
        ['Называем марки,', 'а не «поставщиков»'],
        [('public/images/details/marble-splash.webp', 'камень'),
         ('public/images/details/graphite-wood.webp', 'графит и дуб'),
         ('public/images/details/brass-handles.webp', 'фурнитура')],
        [('Фасады', 'Увадрев · Ламарти · Egger · Kronospan'),
         ('Плёнка ПВХ', 'Тадж · Wild Wolf · Quadro · Recora'),
         ('Пластик HPL', 'AGT · ARPA · ABET · Rehau')])

    post_review(
        'post-06-review',
        'Учли и подсказали, как всё грамотно разместить в рабочей зоне. '
        'Моя маленькая и очень уютная кухня меня очень радует.',
        'Анастасия Шанина')

    post_notebook(
        'post-07-mistakes',
        'разбор ошибок',
        ['Пять вещей,', 'которые видно', 'только после монтажа'],
        [('01', 'Розетки под технику', 'выведены до проекта — кухню приходится подгонять'),
         ('02', 'Холодильник у стены', 'дверца не открывается на полный угол'),
         ('03', 'Короб и вытяжка', 'верхний ряд шкафов упирается в вентиляцию'),
         ('04', 'Свет только сверху', 'рабочая зона остаётся в собственной тени'),
         ('05', 'Столешница в притык', 'не остаётся места под розетку и плинтус')],
        note='Всё это проверяется на чертеже — бесплатно')

    post_notebook(
        'post-08-process',
        'как мы работаем',
        ['От разговора', 'до первой готовки'],
        [('01', 'Разговор', '10 минут: где кухня, что не устраивает'),
         ('02', 'Замер', 'окна, короба, вентиляция, выводы коммуникаций'),
         ('03', 'Проект', 'планировка, материалы, визуализация — бесплатно'),
         ('04', 'Электрика', 'схему передаём вашему мастеру до штробления'),
         ('05', 'Производство', 'контролируем размеры, цвет и комплектацию'),
         ('06', 'Сборка', 'привозим и собираем сами, гарантия 24 месяца')],
        note='Правки — пока кухня на бумаге, и без счётчика')

    story('story-01-meet', 'photo-12-pair-navy-tall.jpg',
          ['Кухни,', 'которые', 'собираем сами'],
          'мебельное ателье · тверь', 'Роберт и Катя ведут проект лично',
          focus=(0.5, 0.18), zoom=1.16)
    story('story-02-project', 'photo-16-plan-hands.jpg',
          ['Сначала', 'чертёж'],
          'как начинается проект',
          'Проект бесплатный — и без обязательств', focus=(0.5, 0.5))
    story('story-03-evening', 'photo-14-dark-real.jpg',
          ['Кухня — это', 'не картинка'],
          'наше мнение', 'А место, где вы живёте каждый день', focus=(0.5, 0.45))

    clip_cover('clip-01-kitchen', 'photo-17-measure-hands.jpg',
               'Замер, который решает всё', 'Клип · Роберт · 0:42',
               focus=(0.5, 0.3))
    clip_cover('clip-02-samples', 'photo-15-light-real.jpg',
               'Три фасада, один свет', 'Клип · Катя · 0:38',
               focus=(0.5, 0.3))
