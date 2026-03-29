<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Order;

class OrderService
{
    /**
     * @return string
     *
     * @throws \Random\RandomException
     */
    public static function generateOrderNumber(): string
    {
        do {
            $orderNumber = sprintf('ORD-%s-%04d', now()->format('YmdHis'), random_int(1000, 9999));
        } while (Order::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }
}
