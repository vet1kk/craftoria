<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Category;
use Database\Factories\Concerns\BuildsInlineImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    use BuildsInlineImage;

    /**
     * @var array<int, array{name:string, slug:string, icon:string}>
     */
    private const array PROFILES = [
        ['name' => 'Burgers', 'slug' => 'burgers', 'icon' => 'lunch_dining'],
        ['name' => 'Pizzas', 'slug' => 'pizzas', 'icon' => 'local_pizza'],
        ['name' => 'Salads', 'slug' => 'salads', 'icon' => 'eco'],
        ['name' => 'Desserts', 'slug' => 'desserts', 'icon' => 'cake'],
        ['name' => 'Drinks', 'slug' => 'drinks', 'icon' => 'local_cafe'],
        ['name' => 'Breakfasts', 'slug' => 'breakfasts', 'icon' => 'free_breakfast'],
    ];

    private static int $sequence = 0;

    protected $model = Category::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $profile = $this->profile(self::$sequence++);

        return [
            'name' => $profile['name'],
            'slug' => $profile['slug'],
            'icon' => $profile['icon'],
            'image_url' => $this->inlineImage($profile['name'], 320, 200),
            'position' => fake()->numberBetween(0, 25),
            'is_active' => true,
        ];
    }

    /**
     * @return array{name:string, slug:string, icon:string}
     */
    private function profile(int $index): array
    {
        $profile = self::PROFILES[$index % count(self::PROFILES)];
        $cycle = intdiv($index, count(self::PROFILES));

        if ($cycle === 0) {
            return $profile;
        }

        return [
            ...$profile,
            'name' => $profile['name'] . ' ' . ($cycle + 1),
            'slug' => $profile['slug'] . '-' . $cycle,
        ];
    }
}
