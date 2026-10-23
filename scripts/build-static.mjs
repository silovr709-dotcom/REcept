/**
 * Сборка сайта в набор файлов — без сервера.
 *
 * Два применения:
 *   npm run build:static  → витрина для GitHub Pages: папка docs/, адреса
 *                           с приставкой /REcept/;
 *   npm run build:domain  → сайт для собственного домена: папка site/,
 *                           адреса от корня, плюс .htaccess для хостинга.
 *
 * На статике не бывает сервера, поэтому из сборки временно убираются части,
 * которым сервер обязателен: админка, приём заявок и охрана админки.
 * После сборки всё возвращается на место — исходники не меняются.
 */
import { execSync } from 'node:child_process';
import {
  existsSync,
  readdirSync,
  readFileSync,
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

/** Режим «свой домен»: сайт лежит в корне, а не в подпапке репозитория. */
const forDomain = process.env.SITE_TARGET === 'domain';
const outDir = process.env.OUT_DIR || (forDomain ? 'site' : 'docs');
const basePath = process.env.BASE_PATH !== undefined ? process.env.BASE_PATH : forDomain ? '' : '/REcept';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

/**
 * Настройки Apache для обычного хостинга.
 * Кладутся рядом с файлами сайта и включают то, чего на голой статике
 * нет: страницу 404, сжатие, кэш картинок и шрифтов, переход на https.
 */
const HTACCESS = `# Настройки сайта «РЕцепт». Файл читает веб-сервер Apache.
# Если хостинг работает на nginx, этот файл просто не нужен —
# попросите поддержку включить сжатие gzip и страницу ошибки 404.

Options -Indexes
DirectoryIndex index.html

ErrorDocument 404 /404.html

# Всегда https и один адрес без www — иначе поисковики видят два разных сайта.
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} !=on
  RewriteCond %{HTTP:X-Forwarded-Proto} !https
  RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

  RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]
  RewriteRule ^(.*)$ https://%1/$1 [R=301,L]
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/plain text/xml application/javascript application/json image/svg+xml
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/avif "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
</IfModule>

<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  <FilesMatch "\\.(webp|avif|jpg|jpeg|png|svg|woff2|js|css)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\\.html$">
    Header set Cache-Control "public, max-age=0, must-revalidate"
  </FilesMatch>
</IfModule>
`;

try {
  shift();
  rmSync(path.join(root, 'out'), { recursive: true, force: true });
  execSync('npx --no-install next build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      STATIC_EXPORT: '1',
      BASE_PATH: basePath,
      // На хостинге заявки принимает hosting/api/lead.php
      NEXT_PUBLIC_FORM_ENDPOINT:
        process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? (forDomain ? '/api/lead.php' : ''),
    },
  });

  const target = path.join(root, outDir);

  // В docs/ лежит не только собранный сайт, но и написанные от руки справки
  // (например, docs/шаблон-договора.md). Папка пересобирается с нуля, поэтому
  // текстовые файлы из её корня сохраняются и возвращаются обратно —
  // иначе каждая сборка молча их стирает.
  const handwritten = existsSync(target)
    ? readdirSync(target, { withFileTypes: true })
        .filter((e) => e.isFile() && /\.(md|txt)$/i.test(e.name))
        .map((e) => ({ name: e.name, body: readFileSync(path.join(target, e.name)) }))
    : [];

  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  cpSync(path.join(root, 'out'), target, { recursive: true });

  for (const file of handwritten) {
    const dest = path.join(target, file.name);
    if (!existsSync(dest)) writeFileSync(dest, file.body);
  }
  // Без этого файла GitHub Pages прячет папки, начинающиеся с подчёркивания
  writeFileSync(path.join(target, '.nojekyll'), '');

  if (forDomain) {
    writeFileSync(path.join(target, '.htaccess'), HTACCESS);

    // Серверная часть для обычного хостинга: приём заявок на PHP.
    const hosting = path.join(root, 'hosting');
    if (existsSync(hosting)) cpSync(hosting, target, { recursive: true });

    if (process.env.WRITE_CNAME === '1' && siteUrl) {
      // Для GitHub Pages со своим доменом нужен файл CNAME с голым доменом.
      writeFileSync(path.join(target, 'CNAME'), `${siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}\n`);
    }
  }

  console.log(`\nСайт собран в ${outDir}/${forDomain ? ' (адреса от корня домена)' : ''}`);
} finally {
  shift(true);
  rmSync(path.join(root, '.next'), { recursive: true, force: true });
}
