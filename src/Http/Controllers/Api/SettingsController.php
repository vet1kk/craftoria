<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    /**
     * Return the public settings payload.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'data' => [
                'currency' => config('app.currency'),
            ],
        ]);
    }
}
