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
            'calories' => 250,
            'proteins' => 26.0,
            'fats' => 18.0,
            'carbs' => 0.0,
            'cost_amount' => 55.0
        ],
        [
            'name' => 'Chicken Fillet',
            'slug' => 'chicken-fillet',
            'unit' => 'g',
            'calories' => 165,
            'proteins' => 31.0,
            'fats' => 3.6,
            'carbs' => 0.0,
            'cost_amount' => 44.0
        ],
        [
            'name' => 'Brioche Bun',
            'slug' => 'brioche-bun',
            'unit' => 'g',
            'calories' => 290,
            'proteins' => 9.0,
            'fats' => 6.0,
            'carbs' => 49.0,
            'cost_amount' => 12.0
        ],
        [
            'name' => 'Cheddar',
            'slug' => 'cheddar',
            'unit' => 'g',
            'calories' => 403,
            'proteins' => 25.0,
            'fats' => 33.0,
            'carbs' => 1.3,
            'cost_amount' => 18.0
        ],
        [
            'name' => 'Mozzarella',
            'slug' => 'mozzarella',
            'unit' => 'g',
            'calories' => 280,
            'proteins' => 28.0,
            'fats' => 17.0,
            'carbs' => 3.1,
            'cost_amount' => 19.0
        ],
        [
            'name' => 'Romaine Lettuce',
            'slug' => 'romaine-lettuce',
            'unit' => 'g',
            'calories' => 17,
            'proteins' => 1.2,
            'fats' => 0.3,
            'carbs' => 3.3,
            'cost_amount' => 8.0
        ],
        [
            'name' => 'Tomato',
            'slug' => 'tomato',
            'unit' => 'g',
            'calories' => 18,
            'proteins' => 0.9,
            'fats' => 0.2,
            'carbs' => 3.9,
            'cost_amount' => 7.0
        ],
        [
            'name' => 'Cucumber',
            'slug' => 'cucumber',
            'unit' => 'g',
            'calories' => 15,
            'proteins' => 0.7,
            'fats' => 0.1,
            'carbs' => 3.6,
            'cost_amount' => 6.0
        ],
        [
            'name' => 'Bacon',
            'slug' => 'bacon',
            'unit' => 'g',
            'calories' => 541,
            'proteins' => 37.0,
            'fats' => 42.0,
            'carbs' => 1.4,
            'cost_amount' => 22.0
        ],
        [
            'name' => 'Egg',
            'slug' => 'egg',
            'unit' => 'g',
            'calories' => 155,
            'proteins' => 13.0,
            'fats' => 11.0,
            'carbs' => 1.1,
            'cost_amount' => 9.0
        ],
        [
            'name' => 'Avocado',
            'slug' => 'avocado',
            'unit' => 'g',
            'calories' => 160,
            'proteins' => 2.0,
            'fats' => 14.7,
            'carbs' => 8.5,
            'cost_amount' => 24.0
        ],
        [
            'name' => 'Mushroom',
            'slug' => 'mushroom',
            'unit' => 'g',
            'calories' => 22,
            'proteins' => 3.1,
            'fats' => 0.3,
            'carbs' => 3.3,
            'cost_amount' => 11.0
        ],
        [
            'name' => 'Caramelized Onion',
            'slug' => 'caramelized-onion',
            'unit' => 'g',
            'calories' => 96,
            'proteins' => 1.2,
            'fats' => 3.0,
            'carbs' => 16.0,
            'cost_amount' => 10.0
        ],
        [
            'name' => 'Pickled Cucumber',
            'slug' => 'pickled-cucumber',
            'unit' => 'g',
            'calories' => 11,
            'proteins' => 0.3,
            'fats' => 0.2,
            'carbs' => 2.3,
            'cost_amount' => 7.0
        ],
        [
            'name' => 'Fries',
            'slug' => 'fries',
            'unit' => 'g',
            'calories' => 312,
            'proteins' => 3.4,
            'fats' => 15.0,
            'carbs' => 41.0,
            'cost_amount' => 13.0
        ],
        [
            'name' => 'Garlic Sauce',
            'slug' => 'garlic-sauce',
            'unit' => 'ml',
            'calories' => 320,
            'proteins' => 1.0,
            'fats' => 33.0,
            'carbs' => 5.0,
            'cost_amount' => 8.0
        ],
        [
            'name' => 'Caesar Dressing',
            'slug' => 'caesar-dressing',
            'unit' => 'ml',
            'calories' => 270,
            'proteins' => 2.0,
            'fats' => 28.0,
            'carbs' => 4.0,
            'cost_amount' => 9.0
        ],
        [
            'name' => 'Brownie Crumb',
            'slug' => 'brownie-crumb',
            'unit' => 'g',
            'calories' => 410,
            'proteins' => 5.0,
            'fats' => 18.0,
            'carbs' => 58.0,
            'cost_amount' => 16.0
        ],
        [
            'name' => 'Vanilla Cream',
            'slug' => 'vanilla-cream',
            'unit' => 'g',
            'calories' => 285,
            'proteins' => 3.0,
            'fats' => 21.0,
            'carbs' => 22.0,
            'cost_amount' => 14.0
        ],
        [
            'name' => 'Espresso Shot',
            'slug' => 'espresso-shot',
            'unit' => 'ml',
            'calories' => 9,
            'proteins' => 0.1,
            'fats' => 0.2,
            'carbs' => 1.7,
            'cost_amount' => 6.0
        ],
        [
            'name' => 'Oat Milk',
            'slug' => 'oat-milk',
            'unit' => 'ml',
            'calories' => 46,
            'proteins' => 1.0,
            'fats' => 1.5,
            'carbs' => 7.0,
            'cost_amount' => 7.0
        ],
        [
            'name' => 'Orange Juice',
            'slug' => 'orange-juice',
            'unit' => 'ml',
            'calories' => 45,
            'proteins' => 0.7,
            'fats' => 0.2,
            'carbs' => 10.4,
            'cost_amount' => 8.0
        ],
        [
            'name' => 'Spinach',
            'slug' => 'spinach',
            'unit' => 'g',
            'calories' => 23,
            'proteins' => 2.9,
            'fats' => 0.4,
            'carbs' => 3.6,
            'cost_amount' => 8.0
        ],
        [
            'name' => 'Smoked Salmon',
            'slug' => 'smoked-salmon',
            'unit' => 'g',
            'calories' => 117,
            'proteins' => 18.3,
            'fats' => 4.3,
            'carbs' => 0.0,
            'cost_amount' => 38.0
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
