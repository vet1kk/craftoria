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
    /**
     * @var array<int, array{name:string, slug:string, unit:string, calories:int, proteins:float, fats:float, carbs:float, cost_amount:float}>
     */
    private const array PROFILES = [
        [
            'name' => 'Beef Patty',
            'slug' => 'beef-patty',
            'unit' => 'g',
            'calories' => 3,
            'proteins' => 0.02,
            'fats' => 0.01,
            'carbs' => 0.0,
            'cost_amount' => 0.05,
        ],
        [
            'name' => 'Chicken Fillet',
            'slug' => 'chicken-fillet',
            'unit' => 'g',
            'calories' => 2,
            'proteins' => 0.03,
            'fats' => 0.04,
            'carbs' => 0.0,
            'cost_amount' => 0.04,
        ],
        [
            'name' => 'Brioche Bun',
            'slug' => 'brioche-bun',
            'unit' => 'g',
            'calories' => 3,
            'proteins' => 0.02,
            'fats' => 0.01,
            'carbs' => 0.03,
            'cost_amount' => 0.12,
        ],
        [
            'name' => 'Cheddar',
            'slug' => 'cheddar',
            'unit' => 'g',
            'calories' => 4,
            'proteins' => 0.05,
            'fats' => 0.03,
            'carbs' => 0.01,
            'cost_amount' => 0.01,
        ],
        [
            'name' => 'Mozzarella',
            'slug' => 'mozzarella',
            'unit' => 'g',
            'calories' => 3,
            'proteins' => 0.01,
            'fats' => 0.01,
            'carbs' => 0.03,
            'cost_amount' => 0.03,
        ],
        [
            'name' => 'Romaine Lettuce',
            'slug' => 'romaine-lettuce',
            'unit' => 'g',
            'calories' => 1,
            'proteins' => 0.01,
            'fats' => 0.0,
            'carbs' => 0.03,
            'cost_amount' => 0.08,
        ],
        [
            'name' => 'Tomato',
            'slug' => 'tomato',
            'unit' => 'g',
            'calories' => 1,
            'proteins' => 0.01,
            'fats' => 0.0,
            'carbs' => 0.04,
            'cost_amount' => 0.07,
        ],
        [
            'name' => 'Cucumber',
            'slug' => 'cucumber',
            'unit' => 'g',
            'calories' => 1,
            'proteins' => 0.01,
            'fats' => 0.0,
            'carbs' => 0.04,
            'cost_amount' => 0.06,
        ],
        [
            'name' => 'Bacon',
            'slug' => 'bacon',
            'unit' => 'g',
            'calories' => 5,
            'proteins' => 0.37,
            'fats' => 0.42,
            'carbs' => 0.01,
            'cost_amount' => 0.22,
        ],
        [
            'name' => 'Egg',
            'slug' => 'egg',
            'unit' => 'g',
            'calories' => 2,
            'proteins' => 0.13,
            'fats' => 0.11,
            'carbs' => 0.01,
            'cost_amount' => 0.09,
        ],
        [
            'name' => 'Avocado',
            'slug' => 'avocado',
            'unit' => 'g',
            'calories' => 2,
            'proteins' => 0.02,
            'fats' => 0.15,
            'carbs' => 0.09,
            'cost_amount' => 0.24,
        ],
        [
            'name' => 'Mushroom',
            'slug' => 'mushroom',
            'unit' => 'g',
            'calories' => 1,
            'proteins' => 0.03,
            'fats' => 0.0,
            'carbs' => 0.03,
            'cost_amount' => 0.11,
        ],
        [
            'name' => 'Caramelized Onion',
            'slug' => 'caramelized-onion',
            'unit' => 'g',
            'calories' => 1,
            'proteins' => 0.01,
            'fats' => 0.03,
            'carbs' => 0.16,
            'cost_amount' => 0.1,
        ],
        [
            'name' => 'Pickled Cucumber',
            'slug' => 'pickled-cucumber',
            'unit' => 'g',
            'calories' => 1,
            'proteins' => 0.0,
            'fats' => 0.0,
            'carbs' => 0.02,
            'cost_amount' => 0.07,
        ],
        [
            'name' => 'Fries',
            'slug' => 'fries',
            'unit' => 'g',
            'calories' => 3,
            'proteins' => 0.03,
            'fats' => 0.15,
            'carbs' => 0.41,
            'cost_amount' => 0.13,
        ],
        [
            'name' => 'Garlic Sauce',
            'slug' => 'garlic-sauce',
            'unit' => 'ml',
            'calories' => 3,
            'proteins' => 0.01,
            'fats' => 0.33,
            'carbs' => 0.05,
            'cost_amount' => 0.08,
        ],
        [
            'name' => 'Caesar Dressing',
            'slug' => 'caesar-dressing',
            'unit' => 'ml',
            'calories' => 3,
            'proteins' => 0.02,
            'fats' => 0.28,
            'carbs' => 0.04,
            'cost_amount' => 0.09,
        ],
        [
            'name' => 'Brownie Crumb',
            'slug' => 'brownie-crumb',
            'unit' => 'g',
            'calories' => 4,
            'proteins' => 0.05,
            'fats' => 0.18,
            'carbs' => 0.58,
            'cost_amount' => 0.16,
        ],
        [
            'name' => 'Vanilla Cream',
            'slug' => 'vanilla-cream',
            'unit' => 'g',
            'calories' => 3,
            'proteins' => 0.03,
            'fats' => 0.21,
            'carbs' => 0.22,
            'cost_amount' => 0.14,
        ],
        [
            'name' => 'Espresso Shot',
            'slug' => 'espresso-shot',
            'unit' => 'ml',
            'calories' => 1,
            'proteins' => 0.0,
            'fats' => 0.0,
            'carbs' => 0.02,
            'cost_amount' => 0.06,
        ],
        [
            'name' => 'Oat Milk',
            'slug' => 'oat-milk',
            'unit' => 'ml',
            'calories' => 1,
            'proteins' => 0.01,
            'fats' => 0.02,
            'carbs' => 0.07,
            'cost_amount' => 0.07,
        ],
        [
            'name' => 'Orange Juice',
            'slug' => 'orange-juice',
            'unit' => 'ml',
            'calories' => 1,
            'proteins' => 0.01,
            'fats' => 0.0,
            'carbs' => 0.1,
            'cost_amount' => 0.08,
        ],
        [
            'name' => 'Spinach',
            'slug' => 'spinach',
            'unit' => 'g',
            'calories' => 1,
            'proteins' => 0.03,
            'fats' => 0.0,
            'carbs' => 0.04,
            'cost_amount' => 0.08,
        ],
        [
            'name' => 'Smoked Salmon',
            'slug' => 'smoked-salmon',
            'unit' => 'g',
            'calories' => 1,
            'proteins' => 0.18,
            'fats' => 0.04,
            'carbs' => 0.0,
            'cost_amount' => 0.38,
        ],
    ];

    private static int $sequence = 0;

    protected $model = Ingredient::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $profile = $this->profile(self::$sequence++);

        return [
            'name' => $profile['name'],
            'slug' => $profile['slug'],
            'unit' => $profile['unit'],
            'calories' => $profile['calories'],
            'proteins' => $profile['proteins'],
            'fats' => $profile['fats'],
            'carbs' => $profile['carbs'],
            'cost_amount' => $profile['cost_amount'],
            'is_active' => true,
        ];
    }

    /**
     * @return array{name:string, slug:string, unit:string, calories:int, proteins:float, fats:float, carbs:float, cost_amount:float}
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
