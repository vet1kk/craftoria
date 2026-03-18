<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Ingredient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Ingredient>
 */
class IngredientFactory extends Factory
{
    protected $model = Ingredient::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name' => ucwords($name),
            'slug' => fake()->unique()->slug(2),
            'unit' => fake()->randomElement(['g', 'ml']),
            'calories' => fake()->numberBetween(0, 450),
            'proteins' => fake()->randomFloat(2, 0, 35),
            'fats' => fake()->randomFloat(2, 0, 35),
            'carbs' => fake()->randomFloat(2, 0, 60),
            'cost_amount' => fake()->randomFloat(2, 1, 300),
            'is_active' => true,
        ];
    }
}
