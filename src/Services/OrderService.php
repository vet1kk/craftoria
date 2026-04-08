<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Order;
use Illuminate\Database\Eloquent\Collection;

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

    /**
     * @param array<string, mixed> $validated
     * @param string|null $userId
     * @return \App\Models\Order
     * @throws \Random\RandomException
     */
    public function store(array $validated, ?string $userId): Order
    {
        return Order::create(array_merge($validated, [
            'user_id' => $userId,
            'order_number' => self::generateOrderNumber(),
            'status' => 'pending',
            'placed_at' => now(),
        ]));
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, \App\Models\Order>
     */
    public function index(): Collection
    {
        return Order::with(['orderItems', 'user'])
                    ->latest('placed_at')
                    ->latest('created_at')
                    ->get();
    }

    /**
     * @param \App\Models\Order $order
     * @return \App\Models\Order
     */
    public function show(Order $order): Order
    {
        return $order->loadDetails();
    }

    /**
     * @param \App\Models\Order $order
     * @param array<string, mixed> $validated
     * @return \App\Models\Order
     */
    public function update(Order $order, array $validated): Order
    {
        $order->update($validated);

        return $this->show($order);
    }
}
