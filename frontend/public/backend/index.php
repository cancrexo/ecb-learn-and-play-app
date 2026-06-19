<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Laravel fuera del webroot: /euro-api (hermano de /www)
$laravel = dirname(__DIR__) . '/../euro-api';

if (! is_dir($laravel)) {
    http_response_code(500);
    exit('Laravel path not found: ' . $laravel);
}

if (file_exists($maintenance = $laravel.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $laravel.'/vendor/autoload.php';

/** @var Application $app */
$app = require_once $laravel.'/bootstrap/app.php';

$app->handleRequest(Request::capture());
