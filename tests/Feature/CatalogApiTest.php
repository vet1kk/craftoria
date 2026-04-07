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
        $allCategory = Category::create([
            'name' => 'All',
            'slug' => 'all',
            'icon' => '🍽️',
            'image_url' => null,
            'position' => -1,
            'is_active' => true,
        ]);

        $allCategory->translations()->create([
            'locale' => 'uk',
            'field' => 'name',
            'value' => 'Все меню',
        ]);

        $category = Category::create([
            'name' => 'Burgers',
            'slug' => 'burgers',
            'icon' => '🍔',
            'image_url' => 'https://example.com/burgers.jpg',
            'position' => 1,
            'is_active' => true,
        ]);

        $category->translations()->create([
            'locale' => 'uk',
            'field' => 'name',
            'value' => 'Бургери',
        ]);

        $ingredient = Ingredient::create([
            'name' => 'Beef',
            'slug' => 'beef',
            'unit' => 'g',
            'calories' => 2.50,
            'proteins' => 26,
            'fats' => 18,
            'carbs' => 0,
            'cost_amount' => 45,
            'is_active' => true,
        ]);

        $ingredient->translations()->create([
            'locale' => 'uk',
            'field' => 'name',
            'value' => 'Яловичина',
        ]);

        $product = Product::create([
            'category_id' => $category->getKey(),
            'name' => 'Classic Burger',
            'slug' => 'classic-burger',
            'description' => 'A solid burger.',
            'shelf_life' => 48,
            'price' => 250,
            'featured_image_url' => 'https://example.com/burger.jpg',
            'position' => 1,
            'stock_quantity' => 10,
            'reorder_level' => 2,
            'is_active' => true,
            'is_available' => true,
        ]);

        $product->translations()->createMany([
            [
                'locale' => 'uk',
                'field' => 'name',
                'value' => 'Класичний бургер',
            ],
            [
                'locale' => 'uk',
                'field' => 'description',
                'value' => 'Надійний бургер на щодень.',
            ],
        ]);

        $metadata = $product->metadata()->create([
            'type' => 'serving_details',
            'value' => 'Served warm.',
        ]);

        $metadata->translations()->create([
            'locale' => 'uk',
            'field' => 'value',
            'value' => 'Подавати теплим.',
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
            ->assertJsonPath('data.0.shelf_life', 48);
    }

    public function test_it_uses_database_catalog_translations_when_present(): void
    {
        $category = Category::create([
            'name' => 'Handmade Drinks',
            'slug' => 'handmade-drinks',
            'icon' => '🥤',
            'position' => 1,
            'is_active' => true,
            'is_system' => false,
        ]);

        $category->translations()->create([
            'locale' => 'uk',
            'field' => 'name',
            'value' => 'Авторські напої',
        ]);

        $product = Product::create([
            'category_id' => $category->getKey(),
            'name' => 'Seasonal Lemonade',
            'slug' => 'seasonal-lemonade',
            'description' => 'Fresh lemonade with herbs.',
            'price' => 150,
            'position' => 1,
            'stock_quantity' => 5,
            'reorder_level' => 1,
            'is_active' => true,
            'is_available' => true,
        ]);

        $product->translations()->createMany([
            [
                'locale' => 'uk',
                'field' => 'name',
                'value' => 'Сезонний лимонад',
            ],
            [
                'locale' => 'uk',
                'field' => 'description',
                'value' => 'Свіжий лимонад із травами.',
            ],
        ]);

        $this->withHeader('Accept-Language', 'uk')
             ->getJson('/api/categories')
             ->assertOk()
             ->assertJsonFragment([
                 'slug' => 'handmade-drinks',
                 'name' => 'Авторські напої',
             ]);

        $this->withHeader('Accept-Language', 'uk')
             ->getJson('/api/products')
             ->assertOk()
             ->assertJsonFragment([
                 'slug' => 'seasonal-lemonade',
                 'name' => 'Сезонний лимонад',
             ])
             ->assertJsonFragment([
                 'description' => 'Свіжий лимонад із травами.',
             ]);
    }
}
