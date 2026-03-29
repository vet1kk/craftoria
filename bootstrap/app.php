<?php

declare(strict_types=1);

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return tap(
    Application::configure(basePath: dirname(__DIR__))
               ->withRouting(
                   api: __DIR__ . '/../routes/api.php',
                   commands: __DIR__ . '/../routes/console.php',
                   health: '/api/up',
               )
               ->withMiddleware(function (Middleware $middleware): void {
                   $middleware->api(prepend: [
                       \App\Http\Middleware\SetRequestLocale::class,
                   ]);
                   $middleware->trustProxies(at: '*');
               })
               ->withExceptions(function (Exceptions $exceptions): void {
                   //
               })
               ->create(),
    static function (Application $app): void {
        $app->useAppPath(__DIR__ . '/../src');
    }
);
