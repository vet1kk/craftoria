<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\CatalogTranslation;
use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Product;
use App\Models\ProductMetadata;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CatalogTranslation>
 */
class CatalogTranslationFactory extends Factory
{
    /**
     * @var array<int, array{field:string, value:string}>
     */
    private const array PROFILES = [
        ['field' => 'name', 'value' => 'Тестовий переклад'],
        ['field' => 'description', 'value' => 'Опис українською мовою для демо.'],
        ['field' => 'value', 'value' => 'Локалізоване значення для метаданих.'],
    ];

    private static int $sequence = 0;

    protected $model = CatalogTranslation::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $profile = self::PROFILES[self::$sequence++ % count(self::PROFILES)];

        return [
            'translatable_type' => Category::class,
            'translatable_id' => Category::factory(),
            'locale' => 'uk',
            'field' => $profile['field'],
            'value' => $profile['value'],
        ];
    }

    /**
     * @return self
     */
    public function forCategory(): self
    {
        return $this->state(fn() => [
            'translatable_type' => Category::class,
            'translatable_id' => Category::factory(),
            'field' => 'name',
        ]);
    }

    /**
     * @return self
     */
    public function forIngredient(): self
    {
        return $this->state(fn() => [
            'translatable_type' => Ingredient::class,
            'translatable_id' => Ingredient::factory(),
            'field' => 'name',
        ]);
    }

    /**
     * @return self
     */
    public function forProduct(): self
    {
        return $this->state(fn() => [
            'translatable_type' => Product::class,
            'translatable_id' => Product::factory(),
            'field' => fake()->randomElement(['name', 'description']),
        ]);
    }

    /**
     * @return self
     */
    public function forProductMetadata(): self
    {
        return $this->state(fn() => [
            'translatable_type' => ProductMetadata::class,
            'translatable_id' => ProductMetadata::factory(),
            'field' => 'value',
        ]);
    }
}
