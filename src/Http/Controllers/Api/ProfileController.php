<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Return the authenticated profile payload.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \App\Http\Resources\UserResource
     */
    public function show(Request $request): UserResource
    {
        $user = $request->user();
        $this->authorize('view', $user);

        return new UserResource($user->load(['orders.items']));
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

        return new UserResource($user->refresh()->load(['orders.items']));
    }
}
