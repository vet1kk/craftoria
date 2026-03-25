<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Order;
use App\Models\OrderItem;

class OrderItemObserver
{
    /**
     * @param \App\Models\OrderItem $orderItem
     * @return void
     */
    public function saved(OrderItem $orderItem): void
    {
        $this->recalculateOrderAmount($orderItem);
    }

    /**
     * @param \App\Models\OrderItem $orderItem
     * @return void
     */
    public function deleted(OrderItem $orderItem): void
    {
        $this->recalculateOrderAmount($orderItem);
    }

    /**
     * @param \App\Models\OrderItem $orderItem
     * @return void
     */
    protected function recalculateOrderAmount(OrderItem $orderItem): void
    {
        $order = $orderItem->order()->withSum('orderItems', 'line_total')->first();

        if (!$order instanceof Order) {
            return;
        }
        $subtotal = (int)$order->order_items_sum_line_total;

        $order->forceFill([
            'subtotal_amount' => $subtotal,
            'total_amount' => ($subtotal + (int)$order->delivery_fee_amount) - (int)$order->discount_amount,
        ])->saveQuietly();
    }
}