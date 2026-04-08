<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProfileController extends Controller
{
    /**
     * Return the authenticated profile payload.
     *
     * @param \Illuminate\Http\Request $request
     * @return \App\Http\Resources\UserResource
     */
    public function show(Request $request): UserResource
    {
        $user = $request->user();
        $this->authorize('view', $user);

        return new UserResource($user);
    }

    /**
     * Update the authenticated profile.
     *
     * @param \App\Http\Requests\Auth\UpdateProfileRequest $request
     * @return \App\Http\Resources\UserResource
     */
    public function update(UpdateProfileRequest $request): UserResource
    {
        $user = $request->user();
        $this->authorize('update', $user);

        $user->update($request->validated());

        return new UserResource($user->refresh());
    }

    /**
     * Return authenticated user orders as a separate payload.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function orders(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $this->authorize('view', $user);

        $orders = $user->orders()
                       ->with(['orderItems'])
                       ->orderByDesc('placed_at')
                       ->orderByDesc('created_at')
                       ->get();

        return OrderResource::collection($orders);
    }
}
