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

    public function test_it_returns_public_categories_and_products(): void
    {
        // Create the "All" category first
        Category::query()->create([
            'name' => 'All',
            'slug' => 'all',
            'icon' => '🍽️',
            'image_url' => null,
            'position' => -1,
            'is_active' => true,
        ]);

        $category = Category::query()->create([
            'name' => 'Burgers',
            'slug' => 'burgers',
            'icon' => '🍔',
            'image_url' => 'https://example.com/burgers.jpg',
            'position' => 1,
            'is_active' => true,
        ]);

        $ingredient = Ingredient::query()->create([
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

        $product = Product::query()->create([
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

        $product->images()->create([
            'image_url' => 'https://example.com/burger-gallery.jpg',
            'position' => 0,
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

        $this->getJson('/api/categories')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'all')
            ->assertJsonPath('data.0.name', 'All')
            ->assertJsonFragment([
                'name' => 'Burgers',
                'slug' => 'burgers',
            ]);

        $this->getJson('/api/products?category=burgers')
            ->assertOk()
            ->assertJsonFragment([
                'name' => 'Classic Burger',
                'slug' => 'classic-burger',
            ])
            ->assertJsonPath('data.0.gallery_image_urls.0', 'https://example.com/burger-gallery.jpg')
            ->assertJsonPath('data.0.metadata.serving_details', 'Served warm.');
    }

    public function test_it_returns_localized_catalog_fields_when_requested_locale_exists(): void
    {
        // Create the "All" category first (translation key: catalog.categories.all.name)
        Category::query()->create([
            'name' => 'All',
            'slug' => 'all',
            'icon' => '🍽️',
            'image_url' => null,
            'position' => -1,
            'is_active' => true,
        ]);

        $category = Category::query()->create([
            'name' => 'Burgers',
            'slug' => 'burgers',
            'icon' => '🍔',
            'image_url' => 'https://example.com/burgers.jpg',
            'position' => 1,
            'is_active' => true,
        ]);

        $ingredient = Ingredient::query()->create([
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

        $product = Product::query()->create([
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
            'value' => 'Serve warm.',
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
            ->getJson('/api/products?category=burgers')
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Класичний бургер')
            ->assertJsonPath('data.0.description', 'Надійний бургер на щодень.')
            ->assertJsonPath('data.0.metadata.serving_details', 'Подавати теплим.')
            ->assertJsonPath('data.0.ingredients.0.name', 'Яловичина')
            ->assertJsonPath('data.0.shelf_life', '48 hours');
    }
}
