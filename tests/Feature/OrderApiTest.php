<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_place_order(): void
    {
        $user = User::factory()->create(['role' => 'client']);
        $this->actingAs($user);

        $response = $this->postJson('/api/orders', [
            'customer_name' => 'John Doe',
            'customer_phone' => '+380501234567',
            'fulfillment_type' => 'delivery',
            'payment_method' => 'cash',
            'delivery_address_line_1' => '123 Main St',
            'delivery_city' => 'Kyiv',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('orders', ['user_id' => $user->id, 'status' => 'pending']);
    }

    public function test_admin_can_manage_order_items(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $order = Order::factory()->create();
        $product = Product::factory()->create(['price' => 100]);

        $this->actingAs($admin);

        $this
            ->postJson("/api/orders/{$order->id}/items", [
                'product_id' => $product->id,
                'quantity' => 2,
                'notes' => 'No onions',
            ])
            ->assertStatus(201)
            ->assertJsonPath('data.line_total', 200)
            ->assertJsonPath('data.notes', 'No onions')
            ->assertJsonPath('data.product_name', $product->name)
            ->assertJsonPath('data.product_sku', $product->sku);

        $item = $order->refresh()->orderItems()->first();

        $this
            ->putJson("/api/orders/{$order->id}/items/{$item->id}", [
                'quantity' => 3,
            ])
            ->assertOk()
            ->assertJsonPath('data.line_total', 300);

        $this->deleteJson("/api/orders/{$order->id}/items/{$item->id}")
             ->assertNoContent();
    }

    public function test_order_update_validates_allowed_state_values(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $order = Order::factory()->create();

        $this->actingAs($admin);

        $this
            ->putJson("/api/orders/{$order->getKey()}", [
                'status' => 'unsupported',
                'payment_status' => 'mystery',
                'payment_method' => 'crypto',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status', 'payment_status', 'payment_method']);
    }

    public function test_order_creation_generates_automatic_fields(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['price' => 1000]);

        $response = $this->actingAs($user)->postJson('/api/orders', [
            'delivery_address' => '456 Side St',
            'total_amount' => 2500,
            'quantity' => 1,
            'product_id' => $product->id,
            'customer_name' => 'John Doe',
            'customer_phone' => '+380501234567',
            'fulfillment_type' => 'delivery',
            'payment_method' => 'cash',
            'delivery_address_line_1' => '456 Side St',
            'delivery_city' => 'Kyiv',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['data' => ['order_number', 'status', 'placed_at']])
                 ->assertJsonPath('data.status', 'pending');
    }

    public function test_admin_can_update_order_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $order = Order::factory()->create(['status' => 'pending']);

        $this
            ->actingAs($admin)->putJson("/api/orders/{$order->id}", [
                'status' => 'ready',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'ready');
    }
}
