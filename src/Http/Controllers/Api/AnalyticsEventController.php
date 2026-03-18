<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAnalyticsEventRequest;
use App\Models\AnalyticsEvent;
use Illuminate\Http\JsonResponse;

class AnalyticsEventController extends Controller
{
    /**
     * Store a client-side analytics event.
     *
     * @param  \App\Http\Requests\StoreAnalyticsEventRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreAnalyticsEventRequest $request): JsonResponse
    {
        AnalyticsEvent::query()->create([
            'user_id' => $request->user()?->getKey(),
            'session_id' => $request->validated('session_id'),
            'name' => $request->validated('name'),
            'url' => $request->validated('url'),
            'properties' => $request->validated('properties', []),
            'occurred_at' => $request->validated('occurred_at', now()),
        ]);

        return response()->json(['status' => 'accepted'], 202);
    }
}
