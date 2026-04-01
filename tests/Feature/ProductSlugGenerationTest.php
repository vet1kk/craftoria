<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductSlugGenerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_slug_is_generated_from_name_and_collision_gets_incremented_suffix(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = Category::factory()->create();

        $this->actingAs($admin, 'api');

        $firstResponse = $this->postJson('/api/products', [
            'category_id' => $category->getKey(),
            'name' => '  Pizza Pepperoni  ',
            'description' => 'Classic pizza.',
            'price' => 10,
            'is_active' => true,
            'is_available' => true,
        ]);

        $firstResponse
            ->assertCreated()
            ->assertJsonPath('data.slug', 'pizza-pepperoni');

        $secondResponse = $this->postJson('/api/products', [
            'category_id' => $category->getKey(),
            'name' => 'Pizza Pepperoni',
            'description' => 'Another classic pizza.',
            'price' => 11,
            'is_active' => true,
            'is_available' => true,
        ]);

        $secondResponse
            ->assertCreated()
            ->assertJsonPath('data.slug', 'pizza-pepperoni-1');

        $this->assertDatabaseHas('products', [
            'slug' => 'pizza-pepperoni',
        ]);

        $this->assertDatabaseHas('products', [
            'slug' => 'pizza-pepperoni-1',
        ]);

        $this->assertSame(2, Product::query()->count());
    }
}
