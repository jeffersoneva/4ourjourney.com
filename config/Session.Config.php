<?php

$isLocalhost = in_array($_SERVER['HTTP_HOST'], ['localhost', '127.0.0.1']);

$secure = (
    !$isLocalhost &&
    !empty($_SERVER['HTTPS']) &&
    $_SERVER['HTTPS'] !== 'off'
);

function startSessionIfExists(): bool
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return true;
    }

    if (!isset($_COOKIE[session_name()])) {
        return false;
    }

    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'domain'   => $GLOBALS['isLocalhost'] ? '' : '.4ourjourney.com',
        'secure'   => $GLOBALS['secure'],
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

    session_start();
    return true;
}

function forceStartSession(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'domain'   => $GLOBALS['isLocalhost'] ? '' : '.4ourjourney.com',
        'secure'   => $GLOBALS['secure'],
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

    session_start();
}
