<?php

declare(strict_types=1);

$allowedOrigins = array_values(array_filter(array_map(
    static fn(string $origin): string => trim($origin),
    explode(',', (string)env('CORS_ALLOWED_ORIGINS', ''))
)));

$allowedOriginPatterns = array_values(array_filter(array_map(
    static fn(string $pattern): string => trim($pattern),
    explode(',', (string)env('CORS_ALLOWED_ORIGIN_PATTERNS', ''))
)));

if ($allowedOrigins === [] && $allowedOriginPatterns === []) {
    $allowedOriginPatterns = ['#^https?://[^/]+$#'];
}

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $allowedOrigins,
    'allowed_origins_patterns' => $allowedOriginPatterns,
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
