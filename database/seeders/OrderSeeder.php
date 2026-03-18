<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Seed fake orders only if no orders exist.
     *
     * @return void
     *
     * @throws \Random\RandomException
     */
    public function run(): void
    {
        // Skip if orders already exist
        if (Order::query()->exists()) {
            return;
        }

        /** @var \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $customers */
        $customers = User::query()->where('role', 'client')->get();

        /** @var \Illuminate\Database\Eloquent\Collection<int, \App\Models\Product> $products */
        $products = Product::query()->publiclyVisible()->get();

        if ($customers->isEmpty() || $products->isEmpty()) {
            return;
        }

        foreach (range(1, 18) as $index) {
            $this->seedOrder($customers, $products, $index);
        }
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Collection<int, \App\Models\User>  $customers
     * @param  \Illuminate\Database\Eloquent\Collection<int, \App\Models\Product>  $products
     * @param  int  $index
     * @return void
     *
     * @throws \Random\RandomException
     */
    private function seedOrder(Collection $customers, Collection $products, int $index): void
    {
        $customer = $customers->random();
        $status = fake()->randomElement(['pending', 'confirmed', 'preparing', 'ready', 'delivered']);
        $fulfillmentType = fake()->randomElement(['delivery', 'pickup']);
        $placedAt = now()->subDays(random_int(0, 30))->subMinutes(random_int(0, 1440));

        /** @var \App\Models\Order $order */
        $order = Order::factory()->for($customer)->create([
            'order_number' => sprintf('SEED-%s-%03d', now()->format('Ymd'), $index),
            'status' => $status,
            'fulfillment_type' => $fulfillmentType,
            'payment_status' => in_array($status, ['ready', 'delivered'], true) ? 'paid' : 'pending',
            'placed_at' => $placedAt,
            'confirmed_at' => in_array($status, ['confirmed', 'preparing', 'ready', 'delivered'], true) ? $placedAt->copy()->addMinutes(10) : null,
            'preparing_at' => in_array($status, ['preparing', 'ready', 'delivered'], true) ? $placedAt->copy()->addMinutes(25) : null,
            'ready_at' => in_array($status, ['ready', 'delivered'], true) ? $placedAt->copy()->addMinutes(55) : null,
            'delivered_at' => $status === 'delivered' ? $placedAt->copy()->addMinutes(95) : null,
        ]);

        $subtotal = 0.0;

        $products
            ->shuffle()
            ->take(random_int(1, 4))
            ->values()
            ->each(function (Product $product) use ($order, &$subtotal): void {
                $quantity = random_int(1, 3);
                $unitPrice = (float) $product->price;
                $lineTotal = $quantity * $unitPrice;
                $subtotal += $lineTotal;

                $order->items()->create([
                    'product_id' => $product->getKey(),
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                    'notes' => fake()->optional()->sentence(),
                ]);
            });

        $deliveryFee = $fulfillmentType === 'delivery' ? 79.0 : 0.0;
        $discount = $subtotal >= 800 ? 50.0 : 0.0;

        $order->update([
            'subtotal_amount' => $subtotal,
            'discount_amount' => $discount,
            'delivery_fee_amount' => $deliveryFee,
            'total_amount' => $subtotal - $discount + $deliveryFee,
        ]);
    }
}
