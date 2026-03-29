<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Ingredient;
use App\Models\Product;
use App\Models\ProductIngredient;
use Database\Factories\Concerns\BuildsInlineImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProductIngredient>
 */
class ProductIngredientFactory extends Factory
{
    use BuildsInlineImage;

    protected $model = ProductIngredient::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'ingredient_id' => Ingredient::factory(),
            'quantity' => fake()->randomFloat(2, 5, 50),
            'position' => fake()->numberBetween(0, 10),
            'image_url' => $this->inlineImage('photo', 900, 600),
        ];
    }
}
