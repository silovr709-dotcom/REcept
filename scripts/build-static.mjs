/**
 * Сборка статической витрины для GitHub Pages.
 *
 * На статике не бывает сервера, поэтому из сборки временно убираются части,
 * которым сервер обязателен: админка, приём заявок и охрана админки.
 * После сборки всё возвращается на место — исходники не меняются.
 */
import { execSync } from 'node:child_process';
import {
  existsSync,
  renameSync,
  rmSync,
  cpSync,
  writeFileSync,
  mkdirSync,
} from 'node:fs';
import path from 'node:path';

const root = process.cwd();
// Прятать нужно ЗА пределы src: проверка типов обходит весь каталог
// целиком, и переименованная внутри него папка всё равно попадёт в сборку.
const STASH = '.static-stash';

const moves = [
  ['src/app/admin', `${STASH}/app-admin`],
  ['src/app/api', `${STASH}/app-api`],
  ['src/middleware.ts', `${STASH}/middleware.ts`],
  ['src/components/admin', `${STASH}/components-admin`],
  ['src/lib/admin', `${STASH}/lib-admin`],
];

function shift(back = false) {
  mkdirSync(path.join(root, STASH), { recursive: true });
  for (const [from, to] of moves) {
    const a = path.join(root, back ? to : from);
    const b = path.join(root, back ? from : to);
    if (existsSync(a)) renameSync(a, b);
  }
  if (back) rmSync(path.join(root, STASH), { recursive: true, force: true });
}

try {
  shift();
  rmSync(path.join(root, 'out'), { recursive: true, force: true });
  execSync('npx --no-install next build', {
    stdio: 'inherit',
    env: { ...process.env, STATIC_EXPORT: '1' },
  });

  const docs = path.join(root, 'docs');
  rmSync(docs, { recursive: true, force: true });
  mkdirSync(docs, { recursive: true });
  cpSync(path.join(root, 'out'), docs, { recursive: true });
  // Без этого файла GitHub Pages прячет папки, начинающиеся с подчёркивания
  writeFileSync(path.join(docs, '.nojekyll'), '');
  console.log('\nВитрина собрана в docs/');
} finally {
  shift(true);
  rmSync(path.join(root, '.next'), { recursive: true, force: true });
}
