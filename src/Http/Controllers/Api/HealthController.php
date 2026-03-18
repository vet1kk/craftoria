<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    /**
     * Return the API health payload.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'name' => config('app.name'),
            'environment' => config('app.env'),
            'debug' => (bool) config('app.debug'),
            'framework' => app()->version(),
            'php' => PHP_VERSION,
            'api' => 'ready',
            'database' => [
                'connection' => config('database.default'),
                'host' => config('database.connections.pgsql.host'),
                'port' => config('database.connections.pgsql.port'),
                'database' => config('database.connections.pgsql.database'),
            ],
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
