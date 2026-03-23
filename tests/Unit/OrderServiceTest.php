<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\OrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class OrderServiceTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @throws \Throwable
     */
    public function test_it_creates_and_lists_orders(): void
    {
        $service = app(OrderService::class);
        $customer = User::factory()->create();
        $category = Category::factory()->create();
        $product = Product::factory()->for($category)->create([
            'price' => 200,
            'is_active' => true,
            'is_available' => true,
        ]);

        $order = $service->create([
            'customer_name' => 'Ihor Client',
            'customer_phone' => '+380671112233',
            'customer_email' => 'ihor@example.test',
            'currency' => 'uah',
            'items' => [
                ['product_id' => $product->getKey(), 'quantity' => 3, 'notes' => 'No sugar'],
            ],
        ], $customer->getKey());

        $this->assertSame($customer->getKey(), $order->user_id);
        $this->assertSame('UAH', $order->currency);
        $this->assertSame('pending', $order->status);
        $this->assertSame('600.00', $order->subtotal_amount);
        $this->assertCount(1, $order->items);

        $filtered = $service->listAll([
            'status' => 'pending',
            'search' => 'Ihor',
        ]);

        $this->assertCount(1, $filtered);
        $this->assertTrue($filtered->first()->is($order));
        $this->assertTrue($service->loadDetails($order)->relationLoaded('items'));
    }

    /**
     * @throws \Throwable
     */
    public function test_it_rejects_unavailable_products(): void
    {
        $service = app(OrderService::class);
        $category = Category::factory()->create();
        $product = Product::factory()->for($category)->create([
            'is_active' => false,
            'is_available' => true,
        ]);

        $this->expectException(ValidationException::class);

        $service->create([
            'customer_name' => 'Ihor Client',
            'customer_phone' => '+380671112233',
            'items' => [
                ['product_id' => $product->getKey(), 'quantity' => 1],
            ],
        ]);
    }

    public function test_it_applies_status_related_timestamps_on_update(): void
    {
        $service = app(OrderService::class);
        $order = Order::factory()->create([
            'status' => 'pending',
            'payment_status' => 'pending',
        ]);

        $updated = $service->update($order, [
            'status' => 'delivered',
            'payment_status' => 'paid',
        ]);

        $this->assertSame('delivered', $updated->status);
        $this->assertSame('paid', $updated->payment_status);
        $this->assertNotNull($updated->delivered_at);
        $this->assertNotNull($updated->paid_at);
    }
}
