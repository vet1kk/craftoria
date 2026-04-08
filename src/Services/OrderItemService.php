<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;

class OrderItemService
{
    /**
     * @param \App\Models\Order $order
     * @param array<string, mixed> $validated
     * @return \App\Models\OrderItem
     */
    public function store(Order $order, array $validated): OrderItem
    {
        $product = Product::findOrFail($validated['product_id']);

        return $order->orderItems()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'product_sku' => $product->sku,
            'quantity' => $validated['quantity'],
            'unit_price' => $product->price,
            'line_total' => $product->price * $validated['quantity'],
            'notes' => $validated['notes'] ?? null,
        ]);
    }

    /**
     * @param \App\Models\OrderItem $orderItem
     * @param array<string, mixed> $validated
     * @return \App\Models\OrderItem
     * @throws \Throwable
     */
    public function update(OrderItem $orderItem, array $validated): OrderItem
    {
        $orderItem->fill($validated);
        $orderItem->line_total = $orderItem->unit_price * $orderItem->quantity;
        $orderItem->save();

        return $orderItem->refresh();
    }

    /**
     * @param \App\Models\OrderItem $orderItem
     * @return void
     */
    public function delete(OrderItem $orderItem): void
    {
        $orderItem->delete();
    }
}
