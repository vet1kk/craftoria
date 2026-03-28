<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Order;

class OrderObserver
{
    /**
     * @param \App\Models\Order $order
     * @return void
     */
    public function saving(Order $order): void
    {
        if ($order->isDirty('status')) {
            $status = $order->status;

            $column = match ($status) {
                'confirmed' => 'confirmed_at',
                'preparing' => 'preparing_at',
                'ready' => 'ready_at',
                'delivered' => 'delivered_at',
                'cancelled' => 'cancelled_at',
                default => null,
            };

            if ($column) {
                $order->{$column} = now();
            }
        }

        if ($order->payment_status === 'paid' && $order->isDirty('payment_status')) {
            $order->paid_at = now();
        }
    }
}
