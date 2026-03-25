<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\OrderItem;
use App\Models\User;

class OrderItemPolicy
{
    /**
     * Determine whether the user can view the resource list.
     *
     * @param  ?\App\Models\User $user
     * @return bool
     */
    public function viewAny(?User $user): bool
    {
        return $user?->isAdmin() ?? false;
    }

    /**
     * Determine whether the user can view the resource.
     *
     * @param  ?\App\Models\User $user
     * @param \App\Models\OrderItem $orderItem
     * @return bool
     */
    public function view(?User $user, OrderItem $orderItem): bool
    {
        if ($user?->isAdmin()) {
            return true;
        }

        return $user !== null && $orderItem->order->user_id === $user->getKey();
    }

    /**
     * Determine whether the user can create the resource.
     *
     * @param  ?\App\Models\User $user
     * @return bool
     */
    public function create(?User $user): bool
    {
        return true;
    }

    /**
     * Handle the incoming update request.
     *
     * @param \App\Models\User $user
     * @param \App\Models\OrderItem $orderItem
     * @return bool
     */
    public function update(User $user, OrderItem $orderItem): bool
    {
        return $orderItem->order->status === 'pending';
    }

    /**
     * Determine whether the user can delete the resource.
     *
     * @param \App\Models\User $user
     * @param \App\Models\OrderItem $orderItem
     * @return bool
     */
    public function delete(User $user, OrderItem $orderItem): bool
    {
        return $orderItem->order->status === 'pending';
    }
}
