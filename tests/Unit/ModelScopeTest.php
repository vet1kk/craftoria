<?php

declare(strict_types=1);

namespace Unit;

use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModelScopeTest extends TestCase
{
    use RefreshDatabase;

    public function test_category_and_ingredient_active_scopes_filter_inactive_records(): void
    {
        Category::factory()->create(['is_active' => true]);
        Category::factory()->create(['is_active' => false]);
        Ingredient::factory()->create(['is_active' => true]);
        Ingredient::factory()->create(['is_active' => false]);

        $this->assertCount(1, Category::query()->active()->get());
        $this->assertCount(1, Ingredient::query()->active()->get());
    }

    public function test_product_publicly_visible_scope_filters_hidden_records(): void
    {
        $category = Category::factory()->create();

        Product::factory()->for($category)->create(['is_active' => true, 'is_available' => true]);
        Product::factory()->for($category)->create(['is_active' => false, 'is_available' => true]);
        Product::factory()->for($category)->create(['is_active' => true, 'is_available' => false]);

        $this->assertCount(1, Product::query()->publiclyVisible()->get());
    }
}
