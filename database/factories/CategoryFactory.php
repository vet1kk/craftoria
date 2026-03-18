<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'name' => ucwords($name),
            'slug' => fake()->unique()->slug(2),
            'icon' => fake()->optional()->emoji(),
            'image_url' => fake()->optional()->imageUrl(),
            'position' => fake()->numberBetween(0, 25),
            'is_active' => true,
        ];
    }
}
