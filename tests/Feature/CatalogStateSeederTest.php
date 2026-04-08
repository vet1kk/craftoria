<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Database\Seeders\TestCatalogSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogStateSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_deterministic_catalog_with_multiple_product_states(): void
    {
        $this->seed(TestCatalogSeeder::class);

        $this->assertDatabaseHas('categories', [
            'slug' => 'artisan-breads',
            'is_active' => true,
            'is_system' => false,
        ]);

        $this->assertDatabaseHas('categories', [
            'slug' => 'archived-menu',
            'is_active' => true,
            'is_system' => false,
        ]);

        $this->assertDatabaseCount('products', 6);
        $this->assertDatabaseCount('ingredients', 7);

        $this->assertSame(1, Product::query()->where('is_active', false)->count());
        $this->assertSame(2, Product::query()->where('is_available', false)->count());
        $this->assertSame(1, Product::query()->whereNull('category_id')->count());

        $this->assertDatabaseHas('products', [
            'slug' => 'honey-berry-layer-cake',
            'stock_quantity' => 0,
            'is_available' => false,
        ]);

        $this->assertDatabaseHas('product_metadata', [
            'type' => 'storage_instructions',
        ]);

        $this->assertDatabaseHas('product_ingredients', [
            'position' => 0,
        ]);

        $this->assertTrue(Category::query()->where('slug', 'all')->exists());
    }
}
