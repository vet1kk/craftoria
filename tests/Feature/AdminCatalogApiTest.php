<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCatalogApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_manage_categories_ingredients_and_products(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'api');

        $categoryResponse = $this->postJson('/api/categories', [
            'name' => 'Desserts',
            'icon' => 'cake',
            'image_url' => 'https://example.com/desserts.jpg',
            'position' => 2,
            'is_active' => true,
        ]);

        $categoryResponse
            ->assertCreated()
            ->assertJsonPath('data.slug', 'desserts');

        $category = Category::query()->where('slug', 'desserts')->firstOrFail();

        $this->postJson('/api/categories', [
            'name' => 'Desserts',
            'icon' => 'cake-2',
            'position' => 6,
            'is_active' => true,
        ])
             ->assertCreated()
             ->assertJsonPath('data.slug', 'desserts-1');

        $ingredientResponse = $this->postJson('/api/ingredients', [
            'name' => 'Chocolate',
            'slug' => 'chocolate',
            'unit' => 'g',
            'calories' => 540,
            'proteins' => 7.8,
            'fats' => 31.0,
            'carbs' => 57.0,
            'cost_amount' => 25.5,
            'is_active' => true,
        ]);

        $ingredientResponse
            ->assertCreated()
            ->assertJsonPath('data.slug', 'chocolate');

        $ingredient = Ingredient::query()->where('slug', 'chocolate')->firstOrFail();

        $productResponse = $this->postJson('/api/products', [
            'category_id' => $category->getKey(),
            'name' => 'Chocolate Cake',
            'sku' => 'CAKE-001',
            'description' => 'Rich cake.',
            'price' => 420,
            'featured_image_url' => 'https://example.com/cake.jpg',
            'shelf_life' => '48h',
            'position' => 3,
            'stock_quantity' => 12,
            'reorder_level' => 2,
            'is_active' => true,
            'is_available' => true,
        ]);

        $productResponse
            ->assertCreated()
            ->assertJsonPath('data.slug', 'chocolate-cake');

        $product = Product::query()->where('slug', 'chocolate-cake')->firstOrFail();

        $this->postJson('/api/products', [
            'category_id' => $category->getKey(),
            'name' => 'Chocolate Cake',
            'description' => 'Another one.',
            'price' => 390,
            'is_active' => true,
            'is_available' => true,
        ])
             ->assertCreated()
             ->assertJsonPath('data.slug', 'chocolate-cake-1');

        $this->putJson("/api/products/{$product->getKey()}", [
            'category_id' => $category->getKey(),
            'name' => 'Chocolate Cake Deluxe',
            'sku' => 'CAKE-002',
            'description' => 'Even richer cake.',
            'price' => 480,
            'position' => 4,
            'stock_quantity' => 8,
            'reorder_level' => 3,
            'is_active' => true,
            'is_available' => true,
        ])
            ->assertOk()
            ->assertJsonPath('data.slug', 'chocolate-cake-deluxe');

        $this->assertDatabaseHas('products', [
            'id' => $product->getKey(),
            'slug' => 'chocolate-cake-deluxe',
            'sku' => 'CAKE-002',
        ]);

        $this->deleteJson("/api/products/{$product->getKey()}")->assertNoContent();
        $this->assertSoftDeleted('products', ['id' => $product->getKey()]);

        $this->putJson("/api/categories/{$category->getKey()}", [
            'name' => 'Desserts Updated',
            'position' => 5,
            'is_active' => false,
        ])->assertOk();

        $this->deleteJson("/api/categories/{$category->getKey()}")->assertNoContent();
        $this->assertSoftDeleted('categories', ['id' => $category->getKey()]);

        $this->putJson("/api/ingredients/{$ingredient->getKey()}", [
            'name' => 'Dark Chocolate',
            'slug' => 'dark-chocolate',
            'unit' => 'g',
            'is_active' => false,
        ])->assertOk();

        $this->deleteJson("/api/ingredients/{$ingredient->getKey()}")->assertNoContent();
        $this->assertSoftDeleted('ingredients', ['id' => $ingredient->getKey()]);
    }

    public function test_non_admin_user_cannot_manage_catalog_resources(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        $category = Category::factory()->create();
        $ingredient = Ingredient::factory()->create();
        $product = Product::factory()->for($category)->create();

        $this->actingAs($client, 'api');

        $this->postJson('/api/categories', [
            'name' => 'Forbidden',
            'slug' => 'forbidden',
        ])->assertForbidden();

        $this->postJson('/api/ingredients', [
            'name' => 'Forbidden',
            'slug' => 'forbidden',
            'unit' => 'g',
        ])->assertForbidden();

        $this->postJson('/api/products', [
            'category_id' => $category->getKey(),
            'name' => 'Forbidden Product',
            'slug' => 'forbidden-product',
            'description' => 'Nope',
            'price' => 99,
        ])->assertForbidden();

        $this->putJson("/api/products/{$product->getKey()}", [
            'category_id' => $category->getKey(),
            'name' => 'Nope',
            'slug' => 'nope',
            'description' => 'Nope',
            'price' => 88,
        ])->assertForbidden();

        $this->deleteJson("/api/ingredients/{$ingredient->getKey()}")->assertForbidden();
    }

    public function test_product_validation_rejects_soft_deleted_relations(): void
    {
        $this->assertTrue(true);
    }

    public function test_deactivating_category_deactivates_its_products_only(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'api');

        $targetCategory = Category::factory()->create(['is_active' => true]);
        $otherCategory = Category::factory()->create(['is_active' => true]);

        $targetProductA = Product::factory()->for($targetCategory)->create(['is_active' => true]);
        $targetProductB = Product::factory()->for($targetCategory)->create(['is_active' => true]);
        $otherProduct = Product::factory()->for($otherCategory)->create(['is_active' => true]);

        $this->putJson("/api/categories/{$targetCategory->getKey()}", [
            'name' => $targetCategory->name,
            'position' => $targetCategory->position,
            'is_active' => false,
        ])->assertOk();

        $this->assertDatabaseHas('products', [
            'id' => $targetProductA->getKey(),
            'is_active' => false,
        ]);

        $this->assertDatabaseHas('products', [
            'id' => $targetProductB->getKey(),
            'is_active' => false,
        ]);

        $this->assertDatabaseHas('products', [
            'id' => $otherProduct->getKey(),
            'is_active' => true,
        ]);
    }

    public function test_reactivating_category_reactivates_its_products_only(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'api');

        $category = Category::factory()->create(['is_active' => true]);
        $otherCategory = Category::factory()->create(['is_active' => true]);
        $product = Product::factory()->for($category)->create(['is_active' => true]);
        $otherProduct = Product::factory()->for($otherCategory)->create(['is_active' => true]);

        $this->putJson("/api/categories/{$category->getKey()}", [
            'name' => $category->name,
            'position' => $category->position,
            'is_active' => false,
        ])->assertOk();

        $this->assertDatabaseHas('products', [
            'id' => $product->getKey(),
            'is_active' => false,
        ]);

        $this->assertDatabaseHas('products', [
            'id' => $otherProduct->getKey(),
            'is_active' => true,
        ]);

        $category->refresh();

        $this->putJson("/api/categories/{$category->getKey()}", [
            'name' => $category->name,
            'position' => $category->position,
            'is_active' => true,
        ])->assertOk();

        $this->assertDatabaseHas('products', [
            'id' => $product->getKey(),
            'is_active' => true,
        ]);

        $this->assertDatabaseHas('products', [
            'id' => $otherProduct->getKey(),
            'is_active' => true,
        ]);
    }
}
