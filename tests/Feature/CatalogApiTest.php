<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_returns_localized_catalog_fields_when_requested_locale_exists(): void
    {
        Category::create([
            'name' => 'All',
            'slug' => 'all',
            'icon' => '🍽️',
            'image_url' => null,
            'position' => -1,
            'is_active' => true,
        ]);

        $category = Category::create([
            'name' => 'Burgers',
            'slug' => 'burgers',
            'icon' => '🍔',
            'image_url' => 'https://example.com/burgers.jpg',
            'position' => 1,
            'is_active' => true,
        ]);

        $ingredient = Ingredient::create([
            'name' => 'Beef',
            'slug' => 'beef',
            'unit' => 'g',
            'calories' => 250,
            'proteins' => 26,
            'fats' => 18,
            'carbs' => 0,
            'cost_amount' => 45,
            'is_active' => true,
        ]);

        $product = Product::create([
            'category_id' => $category->getKey(),
            'name' => 'Classic Burger',
            'slug' => 'classic-burger',
            'description' => 'A solid burger.',
            'shelf_life' => '48 hours',
            'price' => 250,
            'featured_image_url' => 'https://example.com/burger.jpg',
            'position' => 1,
            'stock_quantity' => 10,
            'reorder_level' => 2,
            'is_active' => true,
            'is_available' => true,
        ]);

        $product->metadata()->create([
            'type' => 'serving_details',
            'value' => 'Served warm.',
        ]);

        $product->productIngredients()->create([
            'ingredient_id' => $ingredient->getKey(),
            'quantity' => 150,
            'position' => 0,
        ]);

        $this->withHeader('Accept-Language', 'uk')
            ->getJson('/api/categories')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Все меню')
            ->assertJsonFragment([
                'name' => 'Бургери',
                'slug' => 'burgers',
            ]);

        $this->withHeader('Accept-Language', 'uk')
            ->getJson('/api/products')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Класичний бургер')
            ->assertJsonPath('data.0.description', 'Надійний бургер на щодень.')
            ->assertJsonPath('data.0.metadata.0.value', 'Подавати теплим.')
            ->assertJsonPath('data.0.ingredients.0.name', 'Яловичина')
            ->assertJsonPath('data.0.shelf_life', '48 hours');
    }
}
