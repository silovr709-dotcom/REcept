# -*- coding: utf-8 -*-
"""
Сборка визуалов для сообщества ВКонтакте vk.ru/tverkuhniru.
Палитра, шрифты и правила — те же, что на сайте «РЕцепт».
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance, ImageOps

FDIR = os.environ.get('VK_FONTS', '/tmp/fonts/out')
REPO = '/home/user/REcept'
OUT = os.path.join(REPO, 'vk')

INK    = (19, 41, 74)
SOOT   = (11, 26, 48)
COAL   = (31, 63, 104)
CREAM  = (255, 252, 247)
BONE   = (246, 240, 231)
SAND   = (236, 227, 213)
LINE   = (221, 212, 197)
STONE  = (107, 99, 92)
CLAY   = (162, 152, 140)
GOLD   = (122, 97, 60)
GOLDL  = (182, 154, 99)
GOLDS  = (211, 189, 149)

# --------------------------------------------------------------- шрифты
# fontsource режет гарнитуры по unicode-range: в кириллическом файле нет цифр
# и латиницы. Поэтому каждый символ берётся из той половины, где он есть.
_FAMILIES = {
    'golos':    ('golos-400.ttf', 'golos-latin.ttf'),
    'golos-m':  ('golos-500.ttf', 'golos-latin.ttf'),
    'golos-b':  ('golos-600.ttf', 'golos-latin.ttf'),
    'corm':     ('corm-400.ttf', 'corm-latin.ttf'),
    'corm-l':   ('corm-300.ttf', 'corm-latin.ttf'),
    'corm-m':   ('corm-500.ttf', 'corm-latin.ttf'),
    'playfair': ('playfair-400.ttf', 'playfair-latin.ttf'),
    'playfair-m': ('playfair-500.ttf', 'playfair-latin.ttf'),
    'marck':    ('marck-400.ttf', 'marck-latin.ttf'),
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
            total += f.getlength(ch, mode='L') if hasattr(f, 'getlength') else f.getsize(ch)[0]
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


def tw(draw, s, f, tracking=0.0):
    return f.getlength(s, tracking)


def text(draw, xy, s, f, fill, tracking=0.0, anchor='la'):
    """anchor: 'l'/'m'/'r' по горизонтали, 'a'/'s'/'m' по вертикали (a — верх)."""
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
    words, lines, cur = s.split(' '), [], ''
    for wd in words:
        probe = (cur + ' ' + wd).strip()
        if tw(draw, probe, f, tracking) <= maxw or not cur:
            cur = probe
        else:
            lines.append(cur); cur = wd
    if cur:
        lines.append(cur)
    return lines


def para(draw, xy, s, f, fill, maxw, lh, tracking=0.0, align='l'):
    x, y = xy
    for ln in wrap(draw, s, f, maxw, tracking):
        text(draw, (x, y), ln, f, fill, tracking, align + 'a')
        y += lh
    return y


def caps_rule(draw, xy, s, f, fill, rule=(GOLDL, 2, 16), tracking=0.22, anchor='la'):
    """Надзаголовок капителью с латунным штрихом слева — как на сайте."""
    x, y = xy
    asc, _ = f.getmetrics()
    color, w, gap = rule
    if anchor[0] == 'm':
        x -= (tw(draw, s, f, tracking) + w + gap) / 2
    ry = y + asc * 0.56
    draw.rectangle([x, ry - w / 2, x + w, ry + w / 2], fill=color)
    text(draw, (x + w + gap, y), s, f, fill, tracking, 'la')


def rule(draw, xy, w, color, t=1.5):
    x, y = xy
    draw.rectangle([x, y, x + w, y + t], fill=color)


# --------------------------------------------------------------- фото
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


def _interp(stops, t):
    stops = sorted(stops)
    if t <= stops[0][0]:
        return stops[0][1]
    for (p0, c0), (p1, c1) in zip(stops, stops[1:]):
        if p0 <= t <= p1:
            k = 0 if p1 == p0 else (t - p0) / (p1 - p0)
            return tuple(int(c0[i] + (c1[i] - c0[i]) * k) for i in range(4))
    return stops[-1][1]


def linear(size, stops, horizontal=False):
    w, h = (1024, 1) if not horizontal else (1, 1024)
    grad = Image.new('RGBA', (w, h))
    px = grad.load()
    for i in range(1024):
        col = _interp(stops, i / 1023)
        if horizontal:
            px[0, i] = col
        else:
            px[i, 0] = col
    return grad.resize(size, Image.BILINEAR)


def rgba(color, a):
    return (color[0], color[1], color[2], int(a))


def veil(img, stops, horizontal=False):
    base = img.convert('RGBA')
    base.alpha_composite(linear(img.size, stops, horizontal))
    return base


def spot(img, center, radius, color=SOOT, alpha=140, blur=None):
    """Мягкое затемнение/подсветка эллипсом — держит контраст локально."""
    w, h = img.size
    m = Image.new('L', (w, h), 0)
    md = ImageDraw.Draw(m)
    cx, cy = center[0] * w, center[1] * h
    rx, ry = radius[0] * w, radius[1] * h
    md.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=alpha)
    m = m.filter(ImageFilter.GaussianBlur(blur or min(rx, ry) * 0.55))
    layer = Image.new('RGBA', (w, h), rgba(color, 255))
    layer.putalpha(m)
    base = img.convert('RGBA')
    base.alpha_composite(layer)
    return base


def lighten(img, center, radius, amount=0.16):
    """Тёплый свет на лицах: снимок не глушим, а показываем."""
    w, h = img.size
    m = Image.new('L', (w, h), 0)
    md = ImageDraw.Draw(m)
    cx, cy = center[0] * w, center[1] * h
    rx, ry = radius[0] * w, radius[1] * h
    md.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=int(255 * amount))
    m = m.filter(ImageFilter.GaussianBlur(min(rx, ry) * 0.7))
    white = Image.new('RGB', (w, h), (255, 246, 232))
    mask = m.convert('RGB')
    return Image.composite(Image.blend(img.convert('RGB'), white, 0.55), img.convert('RGB'),
                           mask.convert('L'))


def grain(img, amount=7):
    n = Image.effect_noise(img.size, 42).convert('L').filter(ImageFilter.GaussianBlur(0.4))
    return Image.blend(img.convert('RGB'), Image.merge('RGB', (n, n, n)), amount / 100 * 0.5)


def paper(size):
    w, h = size
    base = Image.new('RGB', (w, h), CREAM)
    n = Image.effect_noise((w, h), 22).convert('L').filter(ImageFilter.GaussianBlur(0.7))
    n = n.point(lambda v: 128 + (v - 128) * 0.5)
    return Image.blend(base, Image.merge('RGB', (n, n, n)), 0.14)


def save(img, path, quality=92):
    full = os.path.join(OUT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    if path.endswith('.png'):
        img.convert('RGB').save(full, optimize=True)
    else:
        img.convert('RGB').save(full, quality=quality, subsampling=1, optimize=True, progressive=True)
    print('%-56s %5dx%-5d %6.0f KB' % (path, img.size[0], img.size[1],
                                       os.path.getsize(full) / 1024))


# --------------------------------------------------------------- знак
def wordmark(draw, xy, size, tone='light', anchor='la', color=None, gold=None):
    f = F('corm', size)
    s1, s2 = 'РЕ', 'цепт'
    w1 = tw(draw, s1, f); w2 = tw(draw, s2, f)
    x, y = xy
    if anchor[0] == 'm': x -= (w1 + w2) / 2
    elif anchor[0] == 'r': x -= (w1 + w2)
    asc, _ = f.getmetrics(); y += asc
    col = color or (CREAM if tone == 'light' else INK)
    gl = gold or (GOLDS if tone == 'light' else GOLD)
    f.draw(draw, (x, y), s1, gl)
    f.draw(draw, (x + w1, y), s2, col)
    return w1 + w2


def wordmark_tver(draw, xy, size, tone='light', gap=None, tracking=0.30):
    """Знак + «ТВЕРЬ» капителью и латунный штрих между ними."""
    x, y = xy
    w = wordmark(draw, (x, y), size, tone)
    asc, _ = F('corm', size).getmetrics()
    f = F('golos', size * 0.29)
    g = gap if gap is not None else size * 0.34
    cy = y + asc * 0.60
    col = rgba(CREAM, 175) if tone == 'light' else rgba(STONE, 255)
    draw.rectangle([x + w + g, cy - 0.8, x + w + g + size * 0.30, cy + 0.8],
                   fill=GOLDL)
    text(draw, (x + w + g + size * 0.30 + g, cy), 'ТВЕРЬ', f, col, tracking, 'lm')
    return w


THE = ['с 2004 года', 'гарантия 24 месяца', 'оплата 50 / 50']

def theses(draw, xy, f, color, sep_color, anchor='la', gap=None, tracking=0.14):
    """Три тезиса в строку, разделённые латунными волосяными линиями."""
    x, y = xy
    gap = gap or f.size * 1.5
    asc, _ = f.getmetrics()
    items = [tw(draw, t, f, tracking) for t in THE]
    total = sum(items) + gap * (len(THE) - 1)
    if anchor[0] == 'm': x -= total / 2
    elif anchor[0] == 'r': x -= total
    cx = x
    for i, t in enumerate(THE):
        text(draw, (cx, y), t, f, color, tracking, 'la')
        cx += items[i]
        if i < len(THE) - 1:
            my = y + asc * 0.56
            draw.rectangle([cx + gap / 2 - 0.6, my, cx + gap / 2 + 0.6, my + 1.2], fill=sep_color)
            cx += gap
    return total
