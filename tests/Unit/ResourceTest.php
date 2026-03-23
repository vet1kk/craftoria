<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Http\Resources\CategoryResource;
use App\Http\Resources\IngredientResource;
use App\Http\Resources\OrderItemResource;
use App\Http\Resources\OrderResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\UserResource;
use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Tests\TestCase;

class ResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_category_and_ingredient_resources_return_expected_shape(): void
    {
        $category = Category::factory()->create([
            'icon' => 'cake',
            'image_url' => 'https://example.com/cat.jpg',
        ]);
        $ingredient = Ingredient::factory()->create([
            'calories' => 123,
            'proteins' => 10.5,
            'fats' => 2.4,
            'carbs' => 18.7,
            'cost_amount' => 14.2,
        ]);

        $categoryPayload = (new CategoryResource($category))->toArray(new Request());
        $ingredientPayload = (new IngredientResource($ingredient))->toArray(new Request());

        $this->assertSame('cake', $categoryPayload['icon']);
        $this->assertSame('https://example.com/cat.jpg', $categoryPayload['image_url']);
        $this->assertSame(123, $ingredientPayload['nutrition_per_100']['calories']);
        $this->assertSame(10.5, $ingredientPayload['nutrition_per_100']['proteins']);
        $this->assertSame(14.2, $ingredientPayload['cost_amount']);
    }

    public function test_resources_use_locale_translations_when_available(): void
    {
        App::setLocale('uk');

        $category = Category::factory()->create([
            'name' => 'Burgers',
            'slug' => 'burgers',
        ]);
        $ingredient = Ingredient::factory()->create([
            'name' => 'Beef',
            'slug' => 'beef',
        ]);
        $product = Product::factory()->for($category)->create([
            'name' => 'Classic Burger',
            'slug' => 'classic-burger',
            'description' => 'A solid burger.',
            'shelf_life' => '48 hours',
        ]);
        $product->metadata()->create([
            'type' => 'serving_details',
            'value' => 'Serve warm.',
        ]);
        $product->productIngredients()->create([
            'ingredient_id' => $ingredient->getKey(),
            'quantity' => 50,
            'position' => 0,
        ]);

        $categoryPayload = (new CategoryResource($category))->toArray(new Request());
        $ingredientPayload = (new IngredientResource($ingredient))->toArray(new Request());
        $productPayload = (new ProductResource($product->fresh()->load(['metadata', 'ingredients'])))->toArray(new Request());

        $this->assertSame('Бургери', $categoryPayload['name']);
        $this->assertSame('Яловичина', $ingredientPayload['name']);
        $this->assertSame('Класичний бургер', $productPayload['name']);
        $this->assertSame('Надійний бургер на щодень.', $productPayload['description']);
        $this->assertSame('Подавати теплим.', $productPayload['metadata']['serving_details']);
        $this->assertSame('Яловичина', $productPayload['ingredients'][0]['name']);
        $this->assertSame('48 hours', $productPayload['shelf_life']);
    }

    public function test_product_resource_returns_nested_relations_and_nutrition_totals(): void
    {
        $category = Category::factory()->create();
        $ingredient = Ingredient::factory()->create([
            'calories' => 200,
            'proteins' => 10,
            'fats' => 5,
            'carbs' => 20,
        ]);
        $product = Product::factory()->for($category)->create();
        $product->images()->create(['image_url' => 'https://example.com/p1.jpg', 'position' => 0]);
        $product->metadata()->create(['type' => 'serving_details', 'value' => 'Serve warm']);
        $product->productIngredients()->create([
            'ingredient_id' => $ingredient->getKey(),
            'quantity' => 50,
            'position' => 0,
        ]);

        $product = $product->fresh()->load(['images', 'metadata', 'ingredients']);
        $payload = (new ProductResource($product))->toArray(new Request());

        $this->assertSame('https://example.com/p1.jpg', $payload['gallery_image_urls'][0]);
        $this->assertSame(
            __("catalog.products.{$product->slug}.metadata.serving_details"),
            $payload['metadata']['serving_details'],
        );
        $this->assertSame(100, $payload['nutrition_totals']['calories']);
        $this->assertSame(5.0, $payload['nutrition_totals']['proteins']);
        $this->assertSame(50.0, $payload['ingredients'][0]['quantity']);
    }

    public function test_order_related_resources_return_expected_shape(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->for($user)->create([
            'delivery_address_line_1' => 'Main St',
            'delivery_city' => 'Kyiv',
            'delivery_postal_code' => '01001',
            'delivery_country_code' => 'UA',
        ]);
        $item = $order->items()->create([
            'product_name' => 'Cake',
            'quantity' => 2,
            'unit_price' => 150,
            'line_total' => 300,
        ]);

        $order = $order->fresh()->load(['items', 'user']);

        $itemPayload = (new OrderItemResource($item))->toArray(new Request());
        $orderPayload = (new OrderResource($order))->toArray(new Request());
        $userPayload = (new UserResource($user->load('orders')))->toArray(new Request());

        $this->assertSame('Cake', $itemPayload['product_name']);
        $this->assertSame('Main St', $orderPayload['delivery_address']['line_1']);
        $this->assertSame('Kyiv', $orderPayload['delivery_address']['city']);
        $this->assertCount(1, $orderPayload['items']);
        $this->assertSame($user->email, $userPayload['email']);
    }
}
