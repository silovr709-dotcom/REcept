<?php
/**
 * ПРИЁМ ЗАЯВОК С САЙТА «РЕцепт» — для обычного хостинга с PHP.
 * =============================================================
 * Сюда форма сайта отправляет заявку. Файл делает три вещи:
 *   1) проверяет, что это живой человек, а не робот;
 *   2) СНАЧАЛА сохраняет заявку в файл — чтобы она не потерялась,
 *      даже если почта откажет;
 *   3) отправляет письмо на почту мастерской.
 *
 * Ничего настраивать не обязательно: по умолчанию письмо уходит
 * средствами хостинга. Если хостинг письма не отправляет, заполните
 * блок SMTP ниже — тогда письма пойдут через Яндекс Почту.
 *
 * Внимание: это единственный файл сайта, который что-то исполняет.
 * Паролей от базы и ключей здесь нет и быть не должно.
 */

declare(strict_types=1);

/* ------------------------------------------------------------------ *
 * НАСТРОЙКИ
 * ------------------------------------------------------------------ */

/**
 * Личные настройки (почта, пароль приложения) живут в отдельном файле
 * api/lead-config.php. Он НЕ входит в обновления сайта, поэтому при
 * следующей выгрузке ваши настройки не затираются.
 * Образец лежит рядом: lead-config.example.php.
 */
if (is_file(__DIR__ . '/lead-config.php')) {
    require __DIR__ . '/lead-config.php';
}

/** Куда приходят заявки. Можно указать несколько через запятую. */
if (!defined('LEAD_TO')) {
    define('LEAD_TO', 'tver-kuhni11@yandex.ru');
}

/** Домен сайта в «машинном» написании (рецепт-тверь.рф). */
if (!defined('SITE_DOMAIN')) {
    define('SITE_DOMAIN', 'xn----dtbhac1degob3b6e.xn--p1ai');
}

/** Обратный адрес письма. Должен быть на вашем домене. */
if (!defined('MAIL_FROM')) {
    define('MAIL_FROM', 'no-reply@xn----dtbhac1degob3b6e.xn--p1ai');
}
if (!defined('MAIL_FROM_NAME')) {
    define('MAIL_FROM_NAME', 'Сайт РЕцепт');
}

/**
 * Запасной способ отправки — через почтовый сервер (SMTP).
 * Нужен, только если хостинг сам письма не шлёт. Задаётся
 * в lead-config.php, сюда пароли не вписываются.
 */
if (!defined('SMTP_HOST')) {
    define('SMTP_HOST', '');
}
if (!defined('SMTP_PORT')) {
    define('SMTP_PORT', 465);
}
if (!defined('SMTP_USER')) {
    define('SMTP_USER', '');
}
if (!defined('SMTP_PASS')) {
    define('SMTP_PASS', '');
}

/** Папка для резервных копий заявок (создаётся сама, закрыта от посторонних). */
const STORE_DIR = __DIR__ . '/../_zayavki';

const MAX_FILES = 3;
const MAX_FILE_BYTES = 8388608; // 8 МБ
const RATE_LIMIT = 5;           // заявок с одного адреса
const RATE_WINDOW = 600;        // за 10 минут

/* ------------------------------------------------------------------ *
 * СЛУЖЕБНОЕ
 * ------------------------------------------------------------------ */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function reply(bool $ok, string $error = '', int $code = 200): void
{
    http_response_code($code);
    echo json_encode(
        $ok ? ['success' => true] : ['success' => false, 'error' => $error],
        JSON_UNESCAPED_UNICODE
    );
    exit;
}

function clientIp(): string
{
    foreach (['HTTP_X_REAL_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'] as $key) {
        if (!empty($_SERVER[$key])) {
            $value = explode(',', (string) $_SERVER[$key])[0];
            return trim($value);
        }
    }
    return 'unknown';
}

/** Папка с заявками закрывается от чужих глаз сразу при создании. */
function storeDir(): ?string
{
    if (!is_dir(STORE_DIR) && !@mkdir(STORE_DIR, 0750, true) && !is_dir(STORE_DIR)) {
        return null;
    }
    $guard = STORE_DIR . '/.htaccess';
    if (!file_exists($guard)) {
        @file_put_contents(
            $guard,
            "Require all denied\n<IfModule !mod_authz_core.c>\n  Order allow,deny\n  Deny from all\n</IfModule>\n"
        );
    }
    return STORE_DIR;
}

/** Не больше пяти заявок с одного адреса за десять минут. */
function rateOk(string $ip): bool
{
    $dir = storeDir();
    if ($dir === null) {
        return true;
    }
    $file = $dir . '/rate-' . substr(hash('sha256', $ip), 0, 16) . '.txt';
    $now = time();
    $hits = [];
    if (is_file($file)) {
        $raw = (string) @file_get_contents($file);
        foreach (explode("\n", $raw) as $line) {
            $line = trim($line);
            if ($line !== '' && (int) $line > $now - RATE_WINDOW) {
                $hits[] = (int) $line;
            }
        }
    }
    if (count($hits) >= RATE_LIMIT) {
        return false;
    }
    $hits[] = $now;
    @file_put_contents($file, implode("\n", $hits), LOCK_EX);
    return true;
}

function cut(string $value, int $limit): string
{
    $value = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $value) ?? '');
    return function_exists('mb_substr') ? mb_substr($value, 0, $limit) : substr($value, 0, $limit);
}

/** Защита от подстановки чужих заголовков в письмо. */
function clean(string $value): string
{
    return str_replace(["\r", "\n"], ' ', $value);
}

function mimeHeader(string $text): string
{
    return '=?UTF-8?B?' . base64_encode($text) . '?=';
}

/* ------------------------------------------------------------------ *
 * ОТПРАВКА ПИСЬМА
 * ------------------------------------------------------------------ */

/** Собирает письмо целиком: текст плюс вложения. */
function buildBody(string $text, array $files, string $boundary): string
{
    $body = "--$boundary\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\n"
        . "Content-Transfer-Encoding: base64\r\n\r\n"
        . chunk_split(base64_encode($text)) . "\r\n";

    foreach ($files as $file) {
        $body .= "--$boundary\r\n"
            . 'Content-Type: ' . clean($file['type']) . '; name="' . clean($file['name']) . "\"\r\n"
            . "Content-Transfer-Encoding: base64\r\n"
            . 'Content-Disposition: attachment; filename="' . clean($file['name']) . "\"\r\n\r\n"
            . chunk_split(base64_encode($file['data'])) . "\r\n";
    }

    return $body . "--$boundary--\r\n";
}

function sendViaMail(string $subject, string $text, array $files, string $replyTo): bool
{
    if (!function_exists('mail')) {
        return false;
    }
    $boundary = 'b' . bin2hex(random_bytes(12));
    $headers = [
        'From: ' . mimeHeader(MAIL_FROM_NAME) . ' <' . MAIL_FROM . '>',
        'MIME-Version: 1.0',
        'Content-Type: multipart/mixed; boundary="' . $boundary . '"',
    ];
    if ($replyTo !== '') {
        $headers[] = 'Reply-To: ' . clean($replyTo);
    }

    return @mail(
        LEAD_TO,
        mimeHeader($subject),
        buildBody($text, $files, $boundary),
        implode("\r\n", $headers),
        '-f' . MAIL_FROM
    );
}

/** Разговор с почтовым сервером напрямую — запасной путь. */
function sendViaSmtp(string $subject, string $text, array $files, string $replyTo): bool
{
    if (SMTP_HOST === '' || SMTP_USER === '' || SMTP_PASS === '') {
        return false;
    }
    $socket = @stream_socket_client(
        SMTP_HOST . ':' . SMTP_PORT,
        $errno,
        $errstr,
        20,
        STREAM_CLIENT_CONNECT
    );
    if (!$socket) {
        return false;
    }
    stream_set_timeout($socket, 20);

    $read = static function () use ($socket): string {
        $data = '';
        while (($line = fgets($socket, 515)) !== false) {
            $data .= $line;
            if (strlen($line) < 4 || $line[3] !== '-') {
                break;
            }
        }
        return $data;
    };
    $say = static function (string $cmd, string $expect) use ($socket, $read): bool {
        fwrite($socket, $cmd . "\r\n");
        return strncmp($read(), $expect, strlen($expect)) === 0;
    };

    $ok = strncmp($read(), '220', 3) === 0
        && $say('EHLO ' . SITE_DOMAIN, '250')
        && $say('AUTH LOGIN', '334')
        && $say(base64_encode(SMTP_USER), '334')
        && $say(base64_encode(SMTP_PASS), '235')
        && $say('MAIL FROM:<' . SMTP_USER . '>', '250');

    if ($ok) {
        foreach (array_map('trim', explode(',', LEAD_TO)) as $to) {
            $ok = $say('RCPT TO:<' . $to . '>', '250') && $ok;
        }
    }

    if ($ok && $say('DATA', '354')) {
        $boundary = 'b' . bin2hex(random_bytes(12));
        $headers = 'From: ' . mimeHeader(MAIL_FROM_NAME) . ' <' . SMTP_USER . ">\r\n"
            . 'To: ' . LEAD_TO . "\r\n"
            . 'Subject: ' . mimeHeader($subject) . "\r\n"
            . ($replyTo !== '' ? 'Reply-To: ' . clean($replyTo) . "\r\n" : '')
            . "MIME-Version: 1.0\r\n"
            . 'Content-Type: multipart/mixed; boundary="' . $boundary . "\"\r\n\r\n";
        $data = $headers . buildBody($text, $files, $boundary);
        // Точка в начале строки экранируется — иначе письмо оборвётся
        $data = preg_replace('/^\./m', '..', $data);
        fwrite($socket, $data . "\r\n.\r\n");
        $ok = strncmp($read(), '250', 3) === 0;
    } else {
        $ok = false;
    }

    $say('QUIT', '221');
    fclose($socket);
    return $ok;
}

/* ------------------------------------------------------------------ *
 * ОБРАБОТКА ЗАЯВКИ
 * ------------------------------------------------------------------ */

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    reply(false, 'Метод не поддерживается', 405);
}

// Ловушка для роботов: поле скрыто от людей, его заполняют только боты.
if (trim((string) ($_POST['company'] ?? '')) !== '') {
    reply(true);
}

$ip = clientIp();
if (!rateOk($ip)) {
    reply(false, 'Слишком много заявок подряд. Попробуйте через несколько минут или позвоните нам.', 429);
}

$name = cut((string) ($_POST['name'] ?? ''), 120);
$contact = cut((string) ($_POST['contact'] ?? ''), 160);
$message = cut((string) ($_POST['message'] ?? ''), 4000);
$source = cut((string) ($_POST['source'] ?? 'site'), 60);
$page = cut((string) ($_POST['page'] ?? ''), 200);

if ($name === '' || $contact === '') {
    reply(false, 'Заполните, пожалуйста, имя и контакт.', 422);
}

// Ответы на вопросы брифа приходят отдельными полями
$skip = ['name', 'contact', 'message', 'source', 'page', 'company', 'access_key', 'subject'];
$extra = [];
foreach ($_POST as $key => $value) {
    if (!in_array($key, $skip, true) && is_string($value) && trim($value) !== '') {
        $extra[cut((string) $key, 60)] = cut($value, 500);
    }
}

// Вложения
$allowed = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'gif', 'pdf'];
$files = [];
$uploads = $_FILES['files'] ?? null;
if (is_array($uploads) && isset($uploads['name']) && is_array($uploads['name'])) {
    $count = min(count($uploads['name']), MAX_FILES);
    for ($i = 0; $i < $count; $i++) {
        if ((int) $uploads['error'][$i] !== UPLOAD_ERR_OK) {
            continue;
        }
        if ((int) $uploads['size'][$i] > MAX_FILE_BYTES) {
            continue;
        }
        $original = (string) $uploads['name'][$i];
        $ext = strtolower((string) pathinfo($original, PATHINFO_EXTENSION));
        if (!in_array($ext, $allowed, true)) {
            continue;
        }
        $data = (string) @file_get_contents($uploads['tmp_name'][$i]);
        if ($data === '') {
            continue;
        }
        $files[] = [
            'name' => preg_replace('/[^\w\-. ]+/u', '_', $original) ?: ('file.' . $ext),
            'type' => $ext === 'pdf' ? 'application/pdf' : 'image/' . ($ext === 'jpg' ? 'jpeg' : $ext),
            'data' => $data,
        ];
    }
}

// Текст письма
$lines = [
    'Заявка с сайта ' . SITE_DOMAIN,
    '',
    'Имя: ' . $name,
    'Контакт: ' . $contact,
];
if ($message !== '') {
    $lines[] = '';
    $lines[] = 'Сообщение:';
    $lines[] = $message;
}
if ($extra) {
    $lines[] = '';
    $lines[] = 'Ответы на вопросы:';
    foreach ($extra as $key => $value) {
        $lines[] = '  ' . $key . ': ' . $value;
    }
}
$lines[] = '';
$lines[] = 'Откуда: ' . $source . ($page !== '' ? ' (страница ' . $page . ')' : '');
$lines[] = 'Время: ' . date('d.m.Y H:i');
if ($files) {
    $lines[] = 'Вложений: ' . count($files);
}
$text = implode("\r\n", $lines);

// 1. Сохраняем ДО отправки: письмо может не уйти, заявка потеряться не должна
$record = [
    'receivedAt' => date('c'),
    'name' => $name,
    'contact' => $contact,
    'message' => $message,
    'source' => $source,
    'page' => $page,
    'extra' => $extra,
    'files' => array_column($files, 'name'),
];
$dir = storeDir();
if ($dir !== null) {
    @file_put_contents(
        $dir . '/zayavki.jsonl',
        json_encode($record, JSON_UNESCAPED_UNICODE) . "\n",
        FILE_APPEND | LOCK_EX
    );
}

// 2. Отправляем письмо
$subject = 'Заявка с сайта: ' . $name;
$replyTo = filter_var($contact, FILTER_VALIDATE_EMAIL) ? $contact : '';
$sent = sendViaSmtp($subject, $text, $files, $replyTo)
    || sendViaMail($subject, $text, $files, $replyTo);

if (!$sent && $dir === null) {
    // Ни письма, ни записи — честно говорим, что не дошло
    reply(false, 'Не удалось отправить заявку. Позвоните нам, пожалуйста: +7 (910) 537-89-91', 500);
}

reply(true);
