<?php

declare(strict_types=1);

namespace Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_an_order_from_public_checkout_payload(): void
    {
        $category = Category::query()->create([
            'name' => 'Pizza',
            'slug' => 'pizza',
            'position' => 1,
            'is_active' => true,
        ]);

        $product = Product::query()->create([
            'category_id' => $category->getKey(),
            'name' => 'Margherita',
            'slug' => 'margherita',
            'description' => 'Classic pizza',
            'price' => 300,
            'position' => 1,
            'stock_quantity' => 10,
            'reorder_level' => 2,
            'is_active' => true,
            'is_available' => true,
        ]);

        $response = $this->postJson('/api/orders', [
            'customer_name' => 'Ihor Client',
            'customer_email' => 'ihor@example.test',
            'customer_phone' => '+380671112233',
            'fulfillment_type' => 'delivery',
            'currency' => 'UAH',
            'customer_notes' => 'Call on arrival.',
            'payment_method' => 'cash',
            'delivery_address_line_1' => 'Main street 1',
            'delivery_city' => 'Kyiv',
            'delivery_postal_code' => '01001',
            'delivery_country_code' => 'UA',
            'items' => [
                [
                    'product_id' => $product->getKey(),
                    'quantity' => 2,
                    'notes' => 'Extra cheese',
                ],
            ],
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.items.0.product_name', 'Margherita')
            ->assertJsonPath('data.total_amount', 600);

        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('order_items', 1);
        $this->assertDatabaseHas('orders', [
            'customer_phone' => '+380671112233',
            'total_amount' => 600,
        ]);
    }

    public function test_admin_endpoints_require_authentication(): void
    {
        $this->postJson('/api/categories', [
            'name' => 'Protected Category',
            'slug' => 'protected-category',
            'position' => 1,
            'is_active' => true,
        ])->assertUnauthorized();
    }
}
