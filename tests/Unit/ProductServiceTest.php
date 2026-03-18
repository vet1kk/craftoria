<?php

declare(strict_types=1);

namespace Unit;

use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_lists_public_products_with_filters(): void
    {
        $service = app(ProductService::class);
        $category = Category::factory()->create(['slug' => 'desserts']);
        $otherCategory = Category::factory()->create(['slug' => 'drinks']);

        $match = Product::factory()->for($category)->create([
            'name' => 'Chocolate Cake',
            'description' => 'Rich dessert',
            'is_active' => true,
            'is_available' => true,
        ]);
        Product::factory()->for($otherCategory)->create([
            'name' => 'Lemonade',
            'description' => 'Fresh drink',
        ]);
        Product::factory()->for($category)->create([
            'name' => 'Hidden Cake',
            'is_active' => false,
            'is_available' => true,
        ]);

        $result = $service->listPublic('desserts', 'Chocolate');

        $this->assertCount(1, $result);
        $this->assertTrue($result->first()->is($match));
    }

    /**
     * @throws \Throwable
     */
    public function test_it_creates_updates_and_deletes_products_with_relations(): void
    {
        $service = app(ProductService::class);
        $category = Category::factory()->create();
        $ingredient = Ingredient::factory()->create();

        $product = $service->create([
            'category_id' => $category->getKey(),
            'name' => 'Test Product',
            'slug' => 'test-product',
            'description' => 'Created',
            'price' => 125,
            'metadata' => [
                ['type' => 'serving_details', 'value' => 'Serve cold'],
            ],
            'images' => [
                ['image_url' => 'https://example.com/product.jpg', 'position' => 0],
            ],
            'ingredients' => [
                ['ingredient_id' => $ingredient->getKey(), 'quantity' => 50, 'position' => 0],
            ],
        ]);

        $this->assertCount(1, $product->metadata);
        $this->assertCount(1, $product->images);
        $this->assertCount(1, $product->ingredients);
        $this->assertSame($product->getKey(), $service->findPublicBySlug('test-product')->getKey());

        $updated = $service->update($product, [
            'category_id' => $category->getKey(),
            'name' => 'Updated Product',
            'slug' => 'updated-product',
            'description' => 'Updated',
            'price' => 140,
            'metadata' => [
                ['type' => 'storage_instructions', 'value' => 'Keep dry'],
            ],
            'images' => [],
            'ingredients' => [],
        ]);

        $this->assertSame('updated-product', $updated->slug);
        $this->assertCount(1, $updated->metadata);
        $this->assertCount(0, $updated->images);
        $this->assertCount(0, $updated->ingredients);

        $allProducts = $service->listAll();
        $this->assertCount(1, $allProducts);

        $service->delete($product);
        $this->assertSoftDeleted('products', ['id' => $product->getKey()]);
    }
}
