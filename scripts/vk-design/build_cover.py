# -*- coding: utf-8 -*-
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vk import *

COUPLE_WIDE = Image.open(os.path.join(REPO, 'vk/_source/base_cover_wide2.jpg'))
COUPLE_VERT = Image.open(os.path.join(REPO, 'vk/_source/base_cover_vertical.jpg'))

PHOTO = os.path.join(REPO, 'public/images')
def ph(p):
    return Image.open(os.path.join(PHOTO, p))


def base_wide(W, H, focus, zoom=1.02, light=(0.685, 0.34), light_r=(0.19, 0.33)):
    img = cover(COUPLE_WIDE, (W, H), focus=focus, zoom=zoom)
    img = ImageEnhance.Color(img).enhance(1.07)
    img = ImageEnhance.Contrast(img).enhance(1.04)
    img = ImageEnhance.Brightness(img).enhance(1.05)
    img = lighten(img, light, light_r, 0.22)
    # кухня слева остаётся читаемой: её не глушим, а только притушиваем
    img = veil(img, [(0.00, rgba(INK, 252)), (0.32, rgba(INK, 250)),
                     (0.40, rgba(INK, 224)), (0.47, rgba(INK, 150)),
                     (0.55, rgba(INK, 60)), (0.63, rgba(INK, 6)),
                     (1.00, rgba(INK, 0))], horizontal=True)
    img = veil(img, [(0.00, rgba(SOOT, 120)), (0.13, rgba(SOOT, 20)),
                     (0.70, rgba(SOOT, 0)), (0.88, rgba(SOOT, 64)),
                     (1.00, rgba(SOOT, 140))])
    return grain(img, 7)


def ink_field(size, seam_side='right'):
    """Плотное синее поле, как на первом экране сайта: свет сверху справа,
    глубокая тень снизу слева. Не заливка, а среда."""
    w, h = size
    img = linear(size, [(0.00, rgba(SOOT, 255)), (0.45, rgba(INK, 255)),
                        (1.00, rgba(COAL, 255))], horizontal=True)
    glow = Image.new('RGB', (w, h), (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([w * 0.25, -h * 0.65, w * 1.25, h * 0.85], fill=(38, 30, 12))
    glow = glow.filter(ImageFilter.GaussianBlur(170))
    img = Image.blend(img.convert('RGB'), glow, 0.30)
    return grain(img, 8)


def cover_desktop():
    W, H = 1920, 768
    SEAM = 748
    panel = ink_field((SEAM, H))
    d = ImageDraw.Draw(panel, 'RGBA')
    X = 148

    wordmark_tver(d, (X, 78), 40, 'light', gap=14, tracking=0.30)
    caps_rule(d, (X, 164), 'мебельное ателье · тверь', F('golos', 14),
              rgba(CREAM, 198), rule=(GOLDL, 2, 14), tracking=0.26)

    fh = F('playfair', 76)
    text(d, (X - 3, 216), 'Кухни', fh, CREAM, 0, 'la')
    text(d, (X - 3, 300), 'на заказ', fh, CREAM, 0, 'la')
    text(d, (X - 3, 384), 'в Твери', fh, rgba(GOLDS, 255), 0, 'la')

    para(d, (X, 492), 'Проект, схемы электрики и расчёт — бесплатно.',
         F('golos', 21), rgba(CREAM, 232), 540, 32)
    text(d, (X + 1, 578), 'Роберт и Катя ведут проект лично',
         F('marck', 29), rgba(GOLDS, 248), 0, 'la')

    rule(d, (X, 644), 470, rgba(GOLDL, 110), 1.2)
    theses(d, (X, 672), F('golos', 15), rgba(CREAM, 216), rgba(GOLDL, 170))

    # правая часть — портрет без вуали: лица не глушим ни на процент
    right_w = W - SEAM
    photo = cover(COUPLE_WIDE, (right_w, H), focus=(0.60, 0.02), zoom=1.20)
    photo = ImageEnhance.Color(photo).enhance(1.03)
    photo = lighten(photo, (0.58, 0.42), (0.42, 0.32), 0.10)
    photo = grain(photo, 6)

    canvas = Image.new('RGB', (W, H))
    canvas.paste(panel.convert('RGB'), (0, 0))
    canvas.paste(photo.convert('RGB'), (SEAM, 0))
    d = ImageDraw.Draw(canvas, 'RGBA')
    # шов: тень от панели и латунная линия — как рамка паспарту на сайте
    d.rectangle([SEAM - 1, 0, SEAM, H], fill=rgba(SOOT, 90))
    d.rectangle([SEAM, 0, SEAM + 1, H], fill=rgba(GOLDL, 120))
    for cy in (0, H):
        pass
    # засечки по углам кадра
    for (cx, cy, dx, dy) in [(SEAM + 26, 26, 1, 1), (W - 26, 26, -1, 1),
                             (SEAM + 26, H - 26, 1, -1), (W - 26, H - 26, -1, -1)]:
        L = 46
        d.rectangle([min(cx, cx + dx * L), cy, max(cx, cx + dx * L), cy + 1],
                    fill=rgba(GOLDS, 150))
        d.rectangle([cx, min(cy, cy + dy * L), cx + 1, max(cy, cy + dy * L)],
                    fill=rgba(GOLDS, 150))

    save(canvas, 'cover/cover-desktop-1920x768.jpg')

    # --- классический 1590×530: та же двухпанельная схема
    W2, H2, S2 = 1590, 530, 618
    panel = ink_field((S2, H2))
    d = ImageDraw.Draw(panel, 'RGBA')
    X = 122
    wordmark_tver(d, (X, 44), 32, 'light', gap=12, tracking=0.30)
    caps_rule(d, (X, 108), 'мебельное ателье · тверь', F('golos', 11),
              rgba(CREAM, 198), rule=(GOLDL, 2, 11), tracking=0.26)
    fh = F('playfair', 54)
    text(d, (X - 2, 144), 'Кухни', fh, CREAM, 0, 'la')
    text(d, (X - 2, 203), 'на заказ', fh, CREAM, 0, 'la')
    text(d, (X - 2, 262), 'в Твери', fh, rgba(GOLDS, 255), 0, 'la')
    para(d, (X, 336), 'Проект, схемы электрики и расчёт — бесплатно.',
         F('golos', 15), rgba(CREAM, 232), 400, 24)
    text(d, (X + 1, 392), 'Роберт и Катя ведут проект лично',
         F('marck', 21), rgba(GOLDS, 248), 0, 'la')
    rule(d, (X, 434), 360, rgba(GOLDL, 110), 1.2)
    theses(d, (X, 456), F('golos', 11.5), rgba(CREAM, 216), rgba(GOLDL, 170))

    photo = cover(COUPLE_WIDE, (W2 - S2, H2), focus=(0.60, 0.02), zoom=1.22)
    photo = ImageEnhance.Color(photo).enhance(1.03)
    photo = lighten(photo, (0.58, 0.42), (0.42, 0.32), 0.10)
    photo = grain(photo, 6)
    canvas = Image.new('RGB', (W2, H2))
    canvas.paste(panel.convert('RGB'), (0, 0))
    canvas.paste(photo.convert('RGB'), (S2, 0))
    d = ImageDraw.Draw(canvas, 'RGBA')
    d.rectangle([S2 - 1, 0, S2, H2], fill=rgba(SOOT, 90))
    d.rectangle([S2, 0, S2 + 1, H2], fill=rgba(GOLDL, 120))
    save(canvas, 'cover/cover-classic-1590x530.jpg')


# ============================================================ ОБЛОЖКА МОБИЛЬНАЯ
def cover_mobile():
    W, H = 1080, 1350
    img = cover(COUPLE_VERT, (W, H), focus=(0.5, 0.26), zoom=1.01)
    img = ImageEnhance.Contrast(img).enhance(1.06)
    img = ImageEnhance.Color(img).enhance(1.06)
    img = lighten(img, (0.55, 0.42), (0.40, 0.26), 0.16)
    img = veil(img, [(0.00, rgba(SOOT, 236)), (0.16, rgba(INK, 204)),
                     (0.30, rgba(INK, 120)), (0.44, rgba(INK, 26)),
                     (0.62, rgba(INK, 14)), (0.72, rgba(SOOT, 120)),
                     (0.80, rgba(SOOT, 210)), (1.00, rgba(SOOT, 246))])
    img = grain(img, 7)
    d = ImageDraw.Draw(img, 'RGBA')

    X = 84
    wordmark_tver(d, (X, 70), 40, 'light', gap=14, tracking=0.30)
    caps_rule(d, (X, 176), 'индивидуальные кухни · тверь', F('golos', 14),
              rgba(CREAM, 212), rule=(GOLDL, 2, 14), tracking=0.24)

    fh = F('playfair', 80)
    text(d, (X - 3, 222), 'Кухни', fh, CREAM, 0, 'la')
    text(d, (X - 3, 314), 'на заказ', fh, CREAM, 0, 'la')
    text(d, (X - 3, 406), 'в Твери', fh, rgba(GOLDS, 255), 0, 'la')

    para(d, (X, 528), 'Проект, схемы электрики и расчёт — бесплатно.',
         F('golos', 26), rgba(CREAM, 234), 720, 37)

    rule(d, (X, 1152), 900, rgba(GOLDL, 110), 1.2)
    text(d, (X + 1, 1178), 'Роберт и Катя ведут проект лично',
         F('marck', 34), rgba(GOLDS, 248), 0, 'la')
    theses(d, (X, 1244), F('golos', 18), rgba(CREAM, 220), rgba(GOLDL, 170))
    save(img, 'cover/cover-mobile-1080x1350.jpg')


if __name__ == '__main__':
    cover_desktop()
    cover_mobile()
