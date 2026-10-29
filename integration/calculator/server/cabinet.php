<?php
/**
 * Мост «калькулятор → личный кабинет клиента».
 *
 * Кладётся рядом с index.php и core.php: server/api/cabinet.php
 * Подключается одной строкой в index.php (см. README рядом).
 *
 * Весь обмен идёт сервер-сервером. Секретный ключ кабинета живёт только
 * в api/config.php на хостинге, в браузер он не попадает никогда.
 */

declare(strict_types=1);

/* ------------------------------------------------------------------ */
/* Настройки                                                           */
/* ------------------------------------------------------------------ */

/**
 * Читает настройки кабинета из api/config.php.
 * Ожидаются ключи: cabinetUrl, cabinetSecret, cabinetSite.
 *
 * @return array{url:string,secret:string,site:string}|null null — мост не настроен.
 */
function recept_cabinet_config(): ?array
{
    static $cached = false;
    static $value = null;
    if ($cached) {
        return $value;
    }
    $cached = true;

    $config = [];
    $file = __DIR__ . '/config.php';
    if (is_file($file)) {
        $loaded = require $file;
        if (is_array($loaded)) {
            $config = $loaded;
        }
    }

    $url = trim((string) ($config['cabinetUrl'] ?? getenv('RECEPT_CABINET_URL') ?: ''));
    $secret = trim((string) ($config['cabinetSecret'] ?? getenv('RECEPT_CABINET_SECRET') ?: ''));
    $site = trim((string) ($config['cabinetSite'] ?? getenv('RECEPT_CABINET_SITE') ?: ''));

    if ($url === '' || $secret === '') {
        return null;
    }

    $value = [
        'url' => rtrim($url, '/'),
        'secret' => $secret,
        'site' => rtrim($site, '/'),
    ];
    return $value;
}

/** Ошибка моста: сообщение уже пригодно для показа человеку. */
class ReceptCabinetError extends RuntimeException
{
}

/* ------------------------------------------------------------------ */
/* Обмен с кабинетом                                                   */
/* ------------------------------------------------------------------ */

/**
 * Общий HTTP-запрос к кабинету.
 *
 * @param string          $path    путь от корня, например /rest/v1/rpc/integration_status
 * @param string|null     $body    тело запроса; null — запрос без тела
 * @param array<int,string> $headers дополнительные заголовки
 * @return array{status:int,body:string}
 */
function recept_cabinet_http(string $path, ?string $body, array $headers = [], string $method = 'POST'): array
{
    $config = recept_cabinet_config();
    if ($config === null) {
        throw new ReceptCabinetError('Кабинет не настроен: в api/config.php нет ключей cabinetUrl и cabinetSecret.');
    }
    if (!function_exists('curl_init')) {
        throw new ReceptCabinetError('На хостинге выключено расширение cURL — без него кабинет недоступен.');
    }

    $all = array_merge([
        'apikey: ' . $config['secret'],
        'Authorization: Bearer ' . $config['secret'],
        'Accept: application/json',
    ], $headers);

    $ch = curl_init($config['url'] . $path);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $all,
        CURLOPT_TIMEOUT => 60,
        CURLOPT_CONNECTTIMEOUT => 15,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }

    $response = curl_exec($ch);
    if ($response === false) {
        $error = curl_error($ch);
        curl_close($ch);
        throw new ReceptCabinetError('Кабинет не отвечает: ' . $error);
    }
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);

    return ['status' => $status, 'body' => (string) $response];
}

/**
 * Вызов функции базы кабинета.
 *
 * @param array<string,mixed> $payload
 * @return mixed
 */
function recept_cabinet_rpc(string $function, array $payload)
{
    $json = json_encode(['p' => $payload], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        throw new ReceptCabinetError('Не удалось собрать данные для кабинета.');
    }

    $res = recept_cabinet_http('/rest/v1/rpc/' . $function, $json, [
        'Content-Type: application/json',
        'Content-Profile: public',
    ]);

    $data = json_decode($res['body'], true);

    if ($res['status'] >= 400) {
        $message = '';
        if (is_array($data)) {
            $message = (string) ($data['message'] ?? $data['error'] ?? $data['hint'] ?? '');
        }
        if ($message === '') {
            $message = 'код ответа ' . $res['status'];
        }
        throw new ReceptCabinetError('Кабинет отказал: ' . $message);
    }

    return $data;
}

/**
 * Заливка файла в закрытое хранилище кабинета.
 * Путь выдаёт сама база на шаге «начать публикацию» — придумывать его нельзя.
 */
function recept_cabinet_upload(string $storagePath, string $bytes, string $mime): void
{
    if ($bytes === '') {
        throw new ReceptCabinetError('Пустой файл — публиковать нечего.');
    }
    $res = recept_cabinet_http(
        '/storage/v1/object/project-files/' . implode('/', array_map('rawurlencode', explode('/', $storagePath))),
        $bytes,
        [
            'Content-Type: ' . ($mime !== '' ? $mime : 'application/octet-stream'),
            'Cache-Control: max-age=3600',
            'x-upsert: true',
        ]
    );
    if ($res['status'] >= 400) {
        $data = json_decode($res['body'], true);
        $message = is_array($data) ? (string) ($data['message'] ?? $data['error'] ?? '') : '';
        throw new ReceptCabinetError('Файл не загрузился в кабинет: ' . ($message !== '' ? $message : 'код ' . $res['status']));
    }
}

/* ------------------------------------------------------------------ */
/* Действия                                                            */
/* ------------------------------------------------------------------ */

/**
 * Публикация документа: бронь → заливка файла → подтверждение.
 * Если заливка сорвалась, бронь снимается, и в кабинете не остаётся пустой карточки.
 *
 * @param array<string,mixed> $input client, project, document, data (base64), actor
 * @return array<string,mixed>
 */
function recept_cabinet_publish(array $input): array
{
    $document = isset($input['document']) && is_array($input['document']) ? $input['document'] : [];
    $base64 = (string) ($input['data'] ?? '');
    if ($base64 === '') {
        throw new ReceptCabinetError('Не передан файл документа.');
    }
    $bytes = base64_decode($base64, true);
    if ($bytes === false) {
        throw new ReceptCabinetError('Документ повредился при передаче.');
    }

    $begin = recept_cabinet_rpc('integration_publish_begin', [
        'actor' => (string) ($input['actor'] ?? ''),
        'client' => $input['client'] ?? [],
        'project' => $input['project'] ?? [],
        'document' => $document,
    ]);
    if (!is_array($begin) || empty($begin['version_id'])) {
        throw new ReceptCabinetError('Кабинет не выдал место под файл.');
    }

    try {
        recept_cabinet_upload(
            (string) $begin['storage_path'],
            $bytes,
            (string) ($document['mime_type'] ?? '')
        );
    } catch (Throwable $e) {
        try {
            recept_cabinet_rpc('integration_publish_abort', ['version_id' => $begin['version_id']]);
        } catch (Throwable $ignored) {
            // Снять бронь не удалось — это не причина скрывать исходную ошибку.
        }
        throw $e;
    }

    $finish = recept_cabinet_rpc('integration_publish_finish', [
        'version_id' => $begin['version_id'],
        'size_bytes' => (string) strlen($bytes),
        'publish' => ($input['publish'] ?? true) ? true : false,
        'actor' => (string) ($input['actor'] ?? ''),
    ]);

    return [
        'ok' => true,
        'projectId' => $begin['project_id'] ?? null,
        'documentId' => $begin['document_id'] ?? null,
        'version' => $begin['version'] ?? null,
        'published' => is_array($finish) ? ($finish['ok'] ?? true) : true,
        'sizeBytes' => strlen($bytes),
    ];
}

/** Ссылка-приглашение для клиента. Письма кабинет шлёт сам; эту ссылку можно отдать руками. */
function recept_cabinet_invite_link(string $token): string
{
    $config = recept_cabinet_config();
    $site = $config === null ? '' : $config['site'];
    if ($site === '' || $token === '') {
        return '';
    }
    return $site . '/kabinet/vhod/?invite=' . rawurlencode($token);
}

/* ------------------------------------------------------------------ */
/* Маршруты API                                                        */
/* ------------------------------------------------------------------ */

/** Кто имеет право работать с кабинетом: владелец и менеджеры. */
function recept_cabinet_require_user(): array
{
    $user = recept_require_user();
    $role = (string) ($user['role'] ?? '');
    if (!in_array($role, ['admin', 'manager'], true)) {
        recept_fail(403, 'Отправлять документы клиенту могут только администратор и менеджер.');
    }
    return $user;
}

/**
 * Обработка маршрутов кабинета. Возвращает false, если маршрут не наш, —
 * тогда index.php отвечает своей обычной ошибкой «неизвестный запрос».
 */
function recept_cabinet_route(string $key): bool
{
    if (strpos($key, 'cabinet') !== 0) {
        return false;
    }

    // Проверка настройки доступна всем, кто вошёл: по ней видно, включён ли мост.
    if ($key === 'cabinet/health GET') {
        recept_require_user();
        $config = recept_cabinet_config();
        if ($config === null) {
            recept_json(200, ['ok' => true, 'configured' => false]);
        }
        recept_json(200, [
            'ok' => true,
            'configured' => true,
            'url' => $config['url'],
            'site' => $config['site'],
            'curl' => function_exists('curl_init'),
        ]);
    }

    $user = recept_cabinet_require_user();
    $body = recept_body();
    $actor = (string) ($user['name'] ?? $user['login'] ?? '');

    try {
        switch ($key) {
            case 'cabinet/publish POST': {
                $body['actor'] = $actor;
                recept_json(200, recept_cabinet_publish($body));
            }

            case 'cabinet/sync POST': {
                $body['actor'] = $actor;
                $result = recept_cabinet_rpc('integration_sync_project', $body);
                recept_json(200, ['ok' => true, 'result' => $result]);
            }

            case 'cabinet/invite POST': {
                $body['actor'] = $actor;
                $result = recept_cabinet_rpc('integration_invite', $body);
                $token = is_array($result) ? (string) ($result['token'] ?? '') : '';
                recept_json(200, [
                    'ok' => true,
                    'token' => $token,
                    'link' => recept_cabinet_invite_link($token),
                    'result' => $result,
                ]);
            }

            case 'cabinet/status POST': {
                recept_json(200, ['ok' => true, 'result' => recept_cabinet_rpc('integration_status', $body)]);
            }

            case 'cabinet/events POST': {
                recept_json(200, ['ok' => true, 'result' => recept_cabinet_rpc('integration_events', $body)]);
            }
        }
    } catch (ReceptCabinetError $e) {
        recept_fail(502, $e->getMessage());
    } catch (Throwable $e) {
        recept_fail(500, 'Сбой моста кабинета: ' . $e->getMessage());
    }

    return false;
}
