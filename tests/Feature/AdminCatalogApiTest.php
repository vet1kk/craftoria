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
        $this->actingAs($admin);

        $categoryResponse = $this->postJson('/api/categories', [
            'name' => 'Desserts',
            'slug' => 'desserts',
            'icon' => 'cake',
            'image_url' => 'https://example.com/desserts.jpg',
            'position' => 2,
            'is_active' => true,
        ]);

        $categoryResponse
            ->assertCreated()
            ->assertJsonPath('data.slug', 'desserts');

        $category = Category::query()->where('slug', 'desserts')->firstOrFail();

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
            'slug' => 'chocolate-cake',
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
            'metadata' => [
                ['type' => 'serving_details', 'value' => 'Serve chilled'],
            ],
            'images' => [
                ['image_url' => 'https://example.com/cake-1.jpg', 'position' => 0],
                ['image_url' => 'https://example.com/cake-2.jpg', 'position' => 1],
            ],
            'ingredients' => [
                ['ingredient_id' => $ingredient->getKey(), 'quantity' => 150, 'position' => 0],
            ],
        ]);

        $productResponse
            ->assertCreated()
            ->assertJsonPath('data.slug', 'chocolate-cake')
            ->assertJsonPath('data.metadata.serving_details', 'Serve chilled')
            ->assertJsonPath('data.gallery_image_urls.1', 'https://example.com/cake-2.jpg');

        $product = Product::query()->where('slug', 'chocolate-cake')->firstOrFail();

        $this->putJson("/api/products/{$product->getKey()}", [
            'category_id' => $category->getKey(),
            'name' => 'Chocolate Cake Deluxe',
            'slug' => 'chocolate-cake-deluxe',
            'sku' => 'CAKE-002',
            'description' => 'Even richer cake.',
            'price' => 480,
            'position' => 4,
            'stock_quantity' => 8,
            'reorder_level' => 3,
            'is_active' => true,
            'is_available' => true,
            'metadata' => [
                ['type' => 'storage_instructions', 'value' => 'Keep refrigerated'],
            ],
            'images' => [
                ['image_url' => 'https://example.com/cake-deluxe.jpg', 'position' => 0],
            ],
            'ingredients' => [
                ['ingredient_id' => $ingredient->getKey(), 'quantity' => 175, 'position' => 0],
            ],
        ])
            ->assertOk()
            ->assertJsonPath('data.slug', 'chocolate-cake-deluxe')
            ->assertJsonPath('data.metadata.storage_instructions', 'Keep refrigerated')
            ->assertJsonMissingPath('data.metadata.serving_details');

        $this->assertDatabaseHas('products', [
            'id' => $product->getKey(),
            'slug' => 'chocolate-cake-deluxe',
            'sku' => 'CAKE-002',
        ]);
        $this->assertDatabaseCount('product_metadata', 1);
        $this->assertDatabaseCount('product_images', 1);
        $this->assertDatabaseCount('product_ingredients', 1);

        $this->deleteJson("/api/products/{$product->getKey()}")->assertNoContent();
        $this->assertSoftDeleted('products', ['id' => $product->getKey()]);

        $this->putJson("/api/categories/{$category->getKey()}", [
            'name' => 'Desserts Updated',
            'slug' => 'desserts-updated',
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

        $this->actingAs($client);

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
        $admin = User::factory()->create(['role' => 'admin']);
        $category = Category::factory()->create();
        $ingredient = Ingredient::factory()->create();
        $category->delete();
        $ingredient->delete();

        $this->actingAs($admin);

        $this->postJson('/api/products', [
            'category_id' => $category->getKey(),
            'name' => 'Broken Product',
            'slug' => 'broken-product',
            'description' => 'Invalid refs',
            'price' => 100,
            'ingredients' => [
                ['ingredient_id' => $ingredient->getKey(), 'quantity' => 10],
            ],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['category_id', 'ingredients.0.ingredient_id']);
    }
}
