<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderManagementApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_show_and_update_orders(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $customer = User::factory()->create(['role' => 'client']);
        $order = Order::factory()->for($customer)->create([
            'status' => 'pending',
            'payment_status' => 'pending',
            'fulfillment_type' => 'delivery',
            'customer_name' => 'Ihor Client',
            'customer_phone' => '+380671112233',
            'placed_at' => now()->subHour(),
        ]);

        $order->items()->create([
            'product_name' => 'Cake',
            'quantity' => 2,
            'unit_price' => 150,
            'line_total' => 300,
        ]);

        $this->actingAs($admin);

        $this->getJson('/api/orders?status=pending&payment_status=pending&fulfillment_type=delivery&search=Ihor')
            ->assertOk()
            ->assertJsonPath('data.0.id', $order->getKey());

        $this->getJson("/api/orders/{$order->getKey()}")
            ->assertOk()
            ->assertJsonPath('data.items.0.product_name', 'Cake');

        $response = $this->putJson("/api/orders/{$order->getKey()}", [
            'status' => 'ready',
            'payment_status' => 'paid',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.status', 'ready')
            ->assertJsonPath('data.payment_status', 'paid');

        $order->refresh();

        $this->assertNotNull($order->ready_at);
        $this->assertNotNull($order->paid_at);
    }

    public function test_order_update_validates_allowed_state_values(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $order = Order::factory()->create();

        $this->actingAs($admin);

        $this->putJson("/api/orders/{$order->getKey()}", [
            'status' => 'unsupported',
            'payment_status' => 'mystery',
            'fulfillment_type' => 'spaceship',
            'payment_method' => 'crypto',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status', 'payment_status', 'fulfillment_type', 'payment_method']);
    }

    public function test_checkout_validation_rejects_unavailable_or_deleted_products(): void
    {
        $category = Category::factory()->create();
        $product = Product::factory()->for($category)->create([
            'is_active' => false,
            'is_available' => true,
        ]);

        $this->postJson('/api/orders', [
            'customer_name' => 'Ihor Client',
            'customer_phone' => '+380671112233',
            'items' => [
                ['product_id' => $product->getKey(), 'quantity' => 1],
            ],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['items.0.product_id']);

        $product->forceFill([
            'is_active' => true,
            'is_available' => true,
        ])->save();
        $product->delete();

        $this->postJson('/api/orders', [
            'customer_name' => 'Ihor Client',
            'customer_phone' => '+380671112233',
            'items' => [
                ['product_id' => $product->getKey(), 'quantity' => 1],
            ],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['items.0.product_id']);
    }

    public function test_non_admin_user_cannot_manage_order_backoffice_routes(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        $order = Order::factory()->create();

        $this->actingAs($client);

        $this->getJson('/api/orders')->assertForbidden();
        $this->getJson("/api/orders/{$order->getKey()}")->assertForbidden();
        $this->putJson("/api/orders/{$order->getKey()}", ['status' => 'confirmed'])->assertForbidden();
    }
}
