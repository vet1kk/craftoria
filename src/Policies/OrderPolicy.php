<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    /**
     * Determine whether the user can view the resource list.
     *
     * @param  ?\App\Models\User  $user
     * @return bool
     */
    public function viewAny(?User $user): bool
    {
        return $user?->isAdmin() ?? false;
    }

    /**
     * Determine whether the user can view the resource.
     *
     * @param  ?\App\Models\User  $user
     * @param  \App\Models\Order  $order
     * @return bool
     */
    public function view(?User $user, Order $order): bool
    {
        if ($user?->isAdmin()) {
            return true;
        }

        return $user !== null && $order->user_id === $user->getKey();
    }

    /**
     * Determine whether the user can create the resource.
     *
     * @param  ?\App\Models\User  $user
     * @return bool
     */
    public function create(?User $user): bool
    {
        return true;
    }

    /**
     * Handle the incoming update request.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Order  $order
     * @return bool
     */
    public function update(User $user, Order $order): bool
    {
        return $order->status === 'pending';
    }

    /**
     * Determine whether the user can delete the resource.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Order  $order
     * @return bool
     */
    public function delete(User $user, Order $order): bool
    {
        return $order->status === 'pending';
    }
}
