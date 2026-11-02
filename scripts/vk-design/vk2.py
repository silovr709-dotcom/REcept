# -*- coding: utf-8 -*-
"""
РЕцепт · ВКонтакте, версия 2
============================
Визуальная система: «чертёж на серебре».

Палитра бренда — тёмно-синий и серебро / белое золото:
    синий в трёх ступенях (ночной, основной, средний),
    серебро (линии, волосяные рамки), белое золото (подпись, акцент),
    холодная бумага и графит для текста.

Приёмы, которые делают узнаваемым любой макет:
    1. бумажное поле с еле заметной миллиметровкой — отсылка к чертежу;
    2. серебряная волосяная линия и засечки по углам — рамка чертежа;
    3. номер раздела капителью (01, 02…) и подпись Golos Text;
    4. антиква Playfair Display в заголовках, Cormorant — в знаке,
       Marck Script — там, где говорит человек, а не ателье;
    5. фотография всегда во всю ширину, без скруглений и теней.

Имена констант исторические (OLIVE, BRASS…), цвета — брендовые.
"""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance, ImageOps

FDIR = os.environ.get('VK_FONTS', '/tmp/fonts/out')
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(REPO, 'vk2')

# ------------------------------------------------------------------ палитра
BONE   = (242, 243, 246)   # холодная бумага
PAPER  = (250, 251, 253)
SAND   = (231, 233, 237)
LINE   = (215, 219, 225)
LINED  = (182, 189, 198)
GRAPH  = (9, 20, 37)       # ночной синий, почти чёрный
INK    = (19, 41, 74)      # основной тёмно-синий: текст, заголовки
OLIVE  = (30, 63, 104)     # средний синий: второй акцент, плашки
OLIVED = (13, 31, 58)      # тёмная плашка
SAGE   = (78, 106, 138)
CLAY   = (111, 123, 139)   # подписи: серебристо-серый
BRASS  = (150, 136, 106)   # белое золото, тёмное — для текста на бумаге
BRASSL = (183, 191, 201)   # серебро — линии и рамки
BRASSS = (226, 216, 193)   # светлое белое золото — текст на синем
CREAM  = (252, 252, 250)

# --------------------------------------------------------------- шрифты
# fontsource режет гарнитуры по unicode-range: в кириллическом файле нет цифр
# и латиницы. Поэтому каждый символ берётся из той половины, где он есть.
_FAMILIES = {
    'golos':      ('golos-400.ttf', 'golos-latin.ttf'),
    'golos-m':    ('golos-500.ttf', 'golos-latin.ttf'),
    'golos-b':    ('golos-600.ttf', 'golos-latin.ttf'),
    'corm':       ('corm-400.ttf', 'corm-latin.ttf'),
    'corm-l':     ('corm-300.ttf', 'corm-latin.ttf'),
    'corm-m':     ('corm-500.ttf', 'corm-latin.ttf'),
    'playfair':   ('playfair-400.ttf', 'playfair-latin.ttf'),
    'playfair-m': ('playfair-500.ttf', 'playfair-latin.ttf'),
    'marck':      ('marck-400.ttf', 'marck-latin.ttf'),
}

_cmaps = {}
def _cmap(path):
    if path not in _cmaps:
        from fontTools.ttLib import TTFont as _TT
        _cmaps[path] = set(_TT(path).getBestCmap().keys())
    return _cmaps[path]


class Font:
    def __init__(self, fam, size):
        cyr, lat = _FAMILIES[fam]
        self.fam, self.size = fam, size
        self.c = ImageFont.truetype(os.path.join(FDIR, cyr), size)
        self.l = ImageFont.truetype(os.path.join(FDIR, lat), size)
        self.cmap_c = _cmap(os.path.join(FDIR, cyr))
        self.cmap_l = _cmap(os.path.join(FDIR, lat))

    def for_char(self, ch):
        if ord(ch) in self.cmap_c:
            return self.c
        if ord(ch) in self.cmap_l:
            return self.l
        return None

    def getmetrics(self):
        return self.c.getmetrics()

    def getlength(self, s, tracking=0.0):
        total = 0.0
        for i, ch in enumerate(s):
            f = self.for_char(ch) or self.c
            total += f.getlength(ch, mode='L')
            if tracking and i != len(s) - 1:
                total += tracking * self.size
        return total

    def draw(self, d, xy, s, fill, tracking=0.0):
        x, y = xy
        for i, ch in enumerate(s):
            f = self.for_char(ch)
            if f is not None:
                d.text((x, y), ch, font=f, fill=fill, anchor='ls')
                x += f.getlength(ch, mode='L')
            else:
                x += self.size * 0.45
            if tracking and i != len(s) - 1:
                x += tracking * self.size
        return x


_cache = {}
def F(fam, size):
    key = (fam, int(round(size)))
    if key not in _cache:
        _cache[key] = Font(fam, int(round(size)))
    return _cache[key]


# ------------------------------------------------------------------ текст
def tw(draw, s, f, tracking=0.0):
    return f.getlength(s, tracking)


def text(draw, xy, s, f, fill, tracking=0.0, anchor='la'):
    x, y = xy
    w = tw(draw, s, f, tracking)
    if anchor[0] == 'm':
        x -= w / 2
    elif anchor[0] == 'r':
        x -= w
    asc, desc = f.getmetrics()
    if anchor[1] == 'a':
        y += asc
    elif anchor[1] == 'm':
        y += (asc - desc) / 2
    f.draw(draw, (x, y), s, fill, tracking)
    return w


def wrap(draw, s, f, maxw, tracking=0.0):
    out, cur = [], ''
    for wd in s.split(' '):
        probe = (cur + ' ' + wd).strip()
        if tw(draw, probe, f, tracking) <= maxw or not cur:
            cur = probe
        else:
            out.append(cur)
            cur = wd
    if cur:
        out.append(cur)
    return out


def para(draw, xy, s, f, fill, maxw, lh, tracking=0.0, align='l'):
    x, y = xy
    for ln in wrap(draw, s, f, maxw, tracking):
        text(draw, (x, y), ln, f, fill, tracking, align + 'a')
        y += lh
    return y


def caps(draw, xy, s, f, fill, tracking=0.22, anchor='la'):
    return text(draw, xy, s, f, fill, tracking, anchor)


def caps_rule(draw, xy, s, f, fill, color=BRASSL, w=26, gap=14,
              tracking=0.22, anchor='la'):
    x, y = xy
    asc, _ = f.getmetrics()
    full = tw(draw, s, f, tracking) + w + gap
    if anchor[0] == 'm':
        x -= full / 2
    elif anchor[0] == 'r':
        x -= full
    cy = y + asc * 0.56
    draw.rectangle([x, cy - 0.8, x + w, cy + 0.8], fill=color)
    text(draw, (x + w + gap, y), s, f, fill, tracking, 'la')
    return full


def rule(draw, xy, w, color=BRASSL, t=1.4):
    x, y = xy
    draw.rectangle([x, y, x + w, y + t], fill=color)


def rule_v(draw, xy, h, color=BRASSL, t=1.4):
    x, y = xy
    draw.rectangle([x, y, x + t, y + h], fill=color)


# ------------------------------------------------------------- бумага/сетка
def vgrad(size, stops):
    w, h = size
    grad = Image.new('RGBA', (1, 1024))
    px = grad.load()
    for i in range(1024):
        px[0, i] = _interp(stops, i / 1023)
    return grad.resize(size, Image.BILINEAR)


def hgrad(size, stops):
    w, h = size
    grad = Image.new('RGBA', (1024, 1))
    px = grad.load()
    for i in range(1024):
        px[i, 0] = _interp(stops, i / 1023)
    return grad.resize(size, Image.BILINEAR)


def _interp(stops, t):
    stops = sorted(stops)
    if t <= stops[0][0]:
        return stops[0][1]
    for (p0, c0), (p1, c1) in zip(stops, stops[1:]):
        if p0 <= t <= p1:
            k = 0 if p1 == p0 else (t - p0) / (p1 - p0)
            return tuple(int(c0[i] + (c1[i] - c0[i]) * k) for i in range(4))
    return stops[-1][1]


def rgba(color, a):
    return (color[0], color[1], color[2], int(a))


def paper(size, grid=True, tone=BONE):
    """Бумажное поле с миллиметровкой: шаг крупный и мелкий."""
    w, h = size
    img = Image.new('RGB', (w, h), tone)
    # живая фактура: очень мягкое зерно и теплое пятно света
    n = Image.effect_noise((w, h), 16).convert('L').filter(ImageFilter.GaussianBlur(0.6))
    n = n.point(lambda v: 128 + (v - 128) * 0.45)
    img = Image.blend(img, Image.merge('RGB', (n, n, n)), 0.07)
    glow = Image.new('RGB', (w, h), tone)
    gd = ImageDraw.Draw(glow)
    gd.ellipse([-w * 0.3, -h * 0.4, w * 0.95, h * 0.55],
               fill=(252, 253, 255))
    glow = glow.filter(ImageFilter.GaussianBlur(min(w, h) * 0.12))
    img = Image.blend(img, glow, 0.5)
    if grid:
        d = ImageDraw.Draw(img, 'RGBA')
        step = max(24, int(w / 34))
        minor = rgba(LINED, 16)
        major = rgba(LINED, 30)
        for i, x in enumerate(range(0, w, step)):
            d.rectangle([x, 0, x + 1, h], fill=major if i % 5 == 0 else minor)
        for j, y in enumerate(range(0, h, step)):
            d.rectangle([0, y, w, y + 1], fill=major if j % 5 == 0 else minor)
    return img


def crop_marks(draw, size, inset=34, length=42, color=None, t=1.6):
    """Засечки по углам — рамка чертежа."""
    w, h = size
    c = color or rgba(BRASSL, 150)
    for (x, y, dx, dy) in [(inset, inset, 1, 1), (w - inset, inset, -1, 1),
                           (inset, h - inset, 1, -1), (w - inset, h - inset, -1, -1)]:
        draw.rectangle([min(x, x + dx * length), y, max(x, x + dx * length), y + t], fill=c)
        draw.rectangle([x, min(y, y + dy * length), x + t, max(y, y + dy * length)], fill=c)


def dim_line(draw, x1, x2, y, color, t=1.2, ticks=10):
    """Размерная линия с засечками — деталь из чертежа."""
    draw.rectangle([x1, y, x2, y + t], fill=color)
    for x in (x1, x2):
        draw.line([(x - ticks * 0.4, y - ticks * 0.45),
                   (x + ticks * 0.4, y + ticks * 0.45 + t)], fill=color, width=int(t + 1))


# ------------------------------------------------------------------ фото
def cover(img, size, focus=(0.5, 0.5), zoom=1.0):
    tw_, th_ = size
    if img.mode != 'RGB':
        img = img.convert('RGB')
    sw, sh = img.size
    scale = max(tw_ / sw, th_ / sh) * zoom
    nw, nh = int(sw * scale + 0.5), int(sh * scale + 0.5)
    im = img.resize((nw, nh), Image.LANCZOS)
    fx = int((nw - tw_) * focus[0] + 0.5)
    fy = int((nh - th_) * focus[1] + 0.5)
    fx = max(0, min(nw - tw_, fx)); fy = max(0, min(nh - th_, fy))
    return im.crop((fx, fy, fx + tw_, fy + th_))


def veil(img, stops, horizontal=False):
    base = img.convert('RGBA')
    base.alpha_composite(hgrad(img.size, stops) if horizontal else vgrad(img.size, stops))
    return base


def spot(img, center, radius, color=GRAPH, alpha=150, blur=None):
    w, h = img.size
    m = Image.new('L', (w, h), 0)
    md = ImageDraw.Draw(m)
    cx, cy = center[0] * w, center[1] * h
    rx, ry = radius[0] * w, radius[1] * h
    md.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=alpha)
    m = m.filter(ImageFilter.GaussianBlur(blur or min(rx, ry) * 0.6))
    layer = Image.new('RGBA', (w, h), rgba(color, 255))
    layer.putalpha(m)
    base = img.convert('RGBA')
    base.alpha_composite(layer)
    return base


def lift(img, center, radius, amount=0.14):
    """Мягкий свет на лицах: снимок не глушим, а показываем."""
    w, h = img.size
    m = Image.new('L', (w, h), 0)
    md = ImageDraw.Draw(m)
    cx, cy = center[0] * w, center[1] * h
    rx, ry = radius[0] * w, radius[1] * h
    md.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=int(255 * amount))
    m = m.filter(ImageFilter.GaussianBlur(min(rx, ry) * 0.75))
    warm = Image.new('RGB', (w, h), (255, 248, 238))
    return Image.composite(Image.blend(img.convert('RGB'), warm, 0.5),
                           img.convert('RGB'), m)


def grain(img, amount=6):
    n = Image.effect_noise(img.size, 34).convert('L').filter(ImageFilter.GaussianBlur(0.4))
    return Image.blend(img.convert('RGB'), Image.merge('RGB', (n, n, n)), amount / 100 * 0.5)


def warm_grade(img, sat=1.02, contrast=1.03, brightness=1.0, tint=(246, 250, 255), mix=0.05):
    """Единая холодная коррекция под синюю палитру: разные кадры звучат вместе."""
    im = img.convert('RGB')
    im = ImageEnhance.Color(im).enhance(sat)
    im = ImageEnhance.Contrast(im).enhance(contrast)
    im = ImageEnhance.Brightness(im).enhance(brightness)
    flat = Image.new('RGB', im.size, tint)
    im = Image.blend(im, Image.blend(im, flat, 0.5), mix)
    return im


def paper_photo_plate(img, box, color=None, t=2):
    """Латунная рамка по краю фотографии — вместо тени."""
    d = ImageDraw.Draw(img, 'RGBA')
    x0, y0, x1, y1 = box
    d.rectangle([x0, y0, x1, y1], outline=color or rgba(BRASSL, 190), width=t)
    return img


def star(draw, xy, r, color):
    x, y = xy
    import math
    pts = []
    for i in range(10):
        ang = math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * 0.42
        pts.append((x + rr * math.cos(ang), y - rr * math.sin(ang)))
    draw.polygon(pts, fill=color)


def save(img, path, quality=92):
    full = os.path.join(OUT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    if path.endswith('.png'):
        img.convert('RGB').save(full, optimize=True)
    else:
        img.convert('RGB').save(full, quality=quality, subsampling=1,
                                optimize=True, progressive=True)
    print('%-58s %5dx%-5d %6.0f KB' % (path, img.size[0], img.size[1],
                                       os.path.getsize(full) / 1024))


# ------------------------------------------------------------------ знак
def wordmark(draw, xy, size, anchor='la', color=None, gold=None):
    """«РЕцепт» — «РЕ» латунью, остальное цветом текста."""
    f = F('corm', size)
    s1, s2 = 'РЕ', 'цепт'
    w1 = tw(draw, s1, f); w2 = tw(draw, s2, f)
    x, y = xy
    if anchor[0] == 'm':
        x -= (w1 + w2) / 2
    elif anchor[0] == 'r':
        x -= (w1 + w2)
    asc, _ = f.getmetrics()
    y += asc
    f.draw(draw, (x, y), s1, gold or BRASS)
    f.draw(draw, (x + w1, y), s2, color or INK)
    return w1 + w2


def wordmark_tver(draw, xy, size, gap=None, tracking=0.30, color=None, gold=None,
                  sub=None):
    x, y = xy
    w = wordmark(draw, (x, y), size, 'la', color, gold)
    asc, _ = F('corm', size).getmetrics()
    g = gap if gap is not None else size * 0.34
    f = F('golos', size * 0.28)
    cy = y + asc * 0.62
    draw.rectangle([x + w + g, cy - 0.8, x + w + g + size * 0.28, cy + 0.8], fill=BRASSL)
    text(draw, (x + w + g + size * 0.28 + g, cy), sub or 'ТВЕРЬ', f,
         color or rgba(INK, 200), tracking, 'lm')
    return w


def monogram(draw, xy, size, color=None, gold=None):
    """Знак «РЕ» без продолжения — для аватара и мелких носителей."""
    f = F('corm-l', size)
    x, y = xy
    asc, _ = f.getmetrics()
    y += asc
    f.draw(draw, (x, y), 'Р', color or OLIVED)
    x += tw(draw, 'Р', f) - size * 0.045
    f.draw(draw, (x, y), 'Е', gold or BRASS)
    return x


# ------------------------------------------------------------- служебное
def load(path):
    return Image.open(os.path.join(REPO, path))


def src(name):
    return Image.open(os.path.join(REPO, 'vk2/_source', name))
