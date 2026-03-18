<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    /**
     * @param  array  $validated
     * @param  string|null  $userId
     * @return \App\Models\Order
     *
     * @throws \Throwable
     */
    public function create(array $validated, ?string $userId = null): Order
    {
        $requestedItems = collect($validated['items']);
        $products = Product::query()
            ->publiclyVisible()
            ->whereIn('id', $requestedItems->pluck('product_id')->unique())
            ->get()
            ->keyBy('id');

        if ($products->count() !== $requestedItems->pluck('product_id')->unique()->count()) {
            throw ValidationException::withMessages([
                'items' => 'One or more selected products are unavailable.',
            ]);
        }

        return DB::transaction(function () use ($validated, $userId, $requestedItems, $products): Order {
            $subtotal = 0.0;

            $order = Order::query()->create([
                'user_id' => $userId,
                'order_number' => $this->generateOrderNumber(),
                'status' => 'pending',
                'fulfillment_type' => $validated['fulfillment_type'] ?? 'delivery',
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'] ?? null,
                'customer_phone' => $validated['customer_phone'],
                'currency' => strtoupper($validated['currency'] ?? 'UAH'),
                'subtotal_amount' => 0,
                'discount_amount' => 0,
                'delivery_fee_amount' => 0,
                'total_amount' => 0,
                'customer_notes' => $validated['customer_notes'] ?? null,
                'payment_method' => $validated['payment_method'] ?? null,
                'payment_status' => 'pending',
                'payment_reference' => $validated['payment_reference'] ?? null,
                'delivery_address_line_1' => $validated['delivery_address_line_1'] ?? null,
                'delivery_address_line_2' => $validated['delivery_address_line_2'] ?? null,
                'delivery_city' => $validated['delivery_city'] ?? null,
                'delivery_postal_code' => $validated['delivery_postal_code'] ?? null,
                'delivery_country_code' => isset($validated['delivery_country_code'])
                    ? strtoupper($validated['delivery_country_code'])
                    : null,
                'placed_at' => now(),
            ]);

            foreach ($requestedItems as $requestedItem) {
                /** @var \App\Models\Product $product */
                $product = $products->get($requestedItem['product_id']);
                $lineTotal = (float) $product->price * (int) $requestedItem['quantity'];
                $subtotal += $lineTotal;

                $order->items()->create([
                    'product_id' => $product->getKey(),
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity' => (int) $requestedItem['quantity'],
                    'unit_price' => $product->price,
                    'line_total' => $lineTotal,
                    'notes' => $requestedItem['notes'] ?? null,
                ]);
            }

            $order->forceFill([
                'subtotal_amount' => $subtotal,
                'total_amount' => $subtotal,
            ])->save();

            return $this->loadDetails($order);
        });
    }

    /**
     * @param  array  $filters
     * @return \Illuminate\Database\Eloquent\Collection<int, \App\Models\Order>
     */
    public function listAll(array $filters = []): Collection
    {
        $status = isset($filters['status']) ? trim((string) $filters['status']) : null;
        $paymentStatus = isset($filters['payment_status']) ? trim((string) $filters['payment_status']) : null;
        $fulfillmentType = isset($filters['fulfillment_type']) ? trim((string) $filters['fulfillment_type']) : null;
        $search = isset($filters['search']) ? trim((string) $filters['search']) : null;

        return Order::query()
            ->with(['items', 'user'])
            ->when($status !== null && $status !== '', fn ($query) => $query->where('status', $status))
            ->when($paymentStatus !== null && $paymentStatus !== '', fn ($query) => $query->where('payment_status', $paymentStatus))
            ->when($fulfillmentType !== null && $fulfillmentType !== '', fn ($query) => $query->where('fulfillment_type', $fulfillmentType))
            ->when($search !== null && $search !== '', function ($query) use ($search): void {
                $query->where(function ($searchQuery) use ($search): void {
                    $searchQuery
                        ->where('order_number', 'like', "%$search%")
                        ->orWhere('customer_name', 'like', "%$search%")
                        ->orWhere('customer_phone', 'like', "%$search%");
                });
            })
            ->latest('placed_at')
            ->latest('created_at')
            ->get();
    }

    /**
     * @param  \App\Models\Order  $order
     * @return \App\Models\Order
     */
    public function loadDetails(Order $order): Order
    {
        return $order->load(['items', 'user']);
    }

    /**
     * @param  \App\Models\Order  $order
     * @param  array  $validated
     * @return \App\Models\Order
     */
    public function update(Order $order, array $validated): Order
    {
        if (($validated['status'] ?? null) === 'confirmed' && ! array_key_exists('confirmed_at', $validated)) {
            $validated['confirmed_at'] = now();
        }

        if (($validated['status'] ?? null) === 'preparing' && ! array_key_exists('preparing_at', $validated)) {
            $validated['preparing_at'] = now();
        }

        if (($validated['status'] ?? null) === 'ready' && ! array_key_exists('ready_at', $validated)) {
            $validated['ready_at'] = now();
        }

        if (($validated['status'] ?? null) === 'delivered' && ! array_key_exists('delivered_at', $validated)) {
            $validated['delivered_at'] = now();
        }

        if (($validated['status'] ?? null) === 'cancelled' && ! array_key_exists('cancelled_at', $validated)) {
            $validated['cancelled_at'] = now();
        }

        if (($validated['payment_status'] ?? null) === 'paid' && ! array_key_exists('paid_at', $validated)) {
            $validated['paid_at'] = now();
        }

        $order->update($validated);

        return $this->loadDetails($order->refresh());
    }

    /**
     * @return string
     *
     * @throws \Random\RandomException
     */
    private function generateOrderNumber(): string
    {
        do {
            $orderNumber = sprintf('ORD-%s-%04d', now()->format('YmdHis'), random_int(1000, 9999));
        } while (Order::query()->where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }
}
