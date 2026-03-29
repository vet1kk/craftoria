<?php

declare(strict_types=1);

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));
const ROOT = __DIR__ . '/..';

if (file_exists($maintenance = ROOT . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

require ROOT . '/vendor/autoload.php';

/** @var Application $app */
$app = require ROOT . '/bootstrap/app.php';

$app->handleRequest(Request::capture());
