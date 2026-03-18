<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = ucwords(fake()->unique()->words(2, true));

        return [
            'category_id' => Category::factory(),
            'name' => $name,
            'slug' => fake()->unique()->slug(3),
            'sku' => fake()->unique()->bothify('SKU-#####'),
            'description' => fake()->paragraph(),
            'price' => fake()->randomFloat(2, 50, 2000),
            'featured_image_url' => fake()->optional()->imageUrl(),
            'shelf_life' => fake()->optional()->randomElement(['24h', '48h', '72h']),
            'position' => fake()->numberBetween(0, 50),
            'stock_quantity' => fake()->numberBetween(0, 250),
            'reorder_level' => fake()->numberBetween(0, 50),
            'is_active' => true,
            'is_available' => true,
        ];
    }
}
