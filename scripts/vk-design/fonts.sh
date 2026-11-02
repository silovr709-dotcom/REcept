#!/usr/bin/env bash
# Кириллица и цифры в @fontsource лежат в разных файлах, поэтому одна строка
# текста требует двух начертаний. Pillow к тому же не читает woff2 — шрифты
# распаковываются в TTF. Скрипт делает это из пакетов, которые уже стоят
# в node_modules, и складывает результат в /tmp/fonts/out (путь из vk.py).
set -euo pipefail

OUT="${1:-/tmp/fonts/out}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
mkdir -p "$OUT"

python3 - "$ROOT" "$OUT" <<'PY'
import os, sys
from fontTools.ttLib import TTFont

root, out = sys.argv[1], sys.argv[2]
pkgs = {
    'golos': 'golos-text',
    'corm': 'cormorant-garamond',
    'playfair': 'playfair-display',
    'marck': 'marck-script',
}
jobs = [
    ('golos', ['400', '500', '600']),
    ('corm', ['300', '400', '500']),
    ('playfair', ['400', '500']),
    ('marck', ['400']),
]

for fam, weights in jobs:
    base = os.path.join(root, 'node_modules', '@fontsource', pkgs[fam], 'files', pkgs[fam])
    for w in weights:
        for script in ('cyrillic', 'latin'):
            src = f'{base}-{script}-{w}-normal.woff2'
            if not os.path.exists(src):
                print('пропуск:', src)
                continue
            f = TTFont(src)
            f.flavor = None
            f.save(os.path.join(out, f'{fam}-{w}.ttf' if script == 'cyrillic'
                                else f'{fam}-latin.ttf'))
            print('ok:', fam, script, w)
PY

echo
echo "Шрифты в $OUT. Дальше: python3 scripts/vk-design/build_cover.py"
