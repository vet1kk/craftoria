<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Product;
use Database\Factories\Concerns\BuildsInlineImage;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    use BuildsInlineImage;

    /**
     * Seed system catalog data (idempotent) and optionally fake data.
     *
     * @return void
     *
     * @throws \Random\RandomException
     */
    public function run(): void
    {
        $this->seedSystemCategories();

        if ($this->shouldSeedFakeData()) {
            $this->seedFakeCatalogData();
        }
    }

    /**
     * Create system categories if they don't exist.
     *
     * @return void
     */
    private function seedSystemCategories(): void
    {
        Category::query()->firstOrCreate(
            ['slug' => 'all'],
            [
                'name' => 'All',
                'icon' => '🍽️',
                'image_url' => null,
                'position' => -1,
                'is_active' => true,
                'is_system' => true,
            ]
        );
    }

    /**
     * Only seed fake data if no non-system categories exist.
     *
     * @return bool
     */
    private function shouldSeedFakeData(): bool
    {
        return Category::query()->where('is_system', false)->doesntExist();
    }

    /**
     * Seed fake catalog data for development.
     *
     * @return void
     *
     * @throws \Random\RandomException
     */
    private function seedFakeCatalogData(): void
    {
        $ingredients = Ingredient::factory()->count(24)->create();
        $categories = Category::factory()->count(6)->create();

        $categories->each(function (Category $category) use ($ingredients): void {
            Product::factory()
                   ->count(5)
                   ->for($category)
                   ->create()
                   ->each(function (Product $product) use ($ingredients): void {
                       $this->seedProductMetadata($product);
                       $this->seedProductImages($product);
                       $this->seedProductIngredients($product, $ingredients);
                   });
        });
    }

    /**
     * @param \App\Models\Product $product
     * @return void
     */
    private function seedProductMetadata(Product $product): void
    {
        $metadata = [
            ['type' => 'serving_details', 'value' => fake()->sentence()],
            ['type' => 'storage_instructions', 'value' => fake()->sentence()],
            ['type' => 'allergen_note', 'value' => fake()->sentence()],
        ];

        $product->metadata()->createMany($metadata);
    }

    /**
     * @param \App\Models\Product $product
     * @return void
     *
     * @throws \Random\RandomException
     */
    private function seedProductImages(Product $product): void
    {
        $images = collect(range(0, random_int(1, 3)))
            ->map(fn(int $position): array => [
                'image_url' => $this->inlineImage($product->name . ' ' . ($position + 1), 900, 600),
                'position' => $position,
            ])
            ->all();

        $product->images()->createMany($images);
    }

    /**
     * @param \App\Models\Product $product
     * @param \Illuminate\Database\Eloquent\Collection<int, \App\Models\Ingredient> $ingredients
     * @return void
     *
     * @throws \Random\RandomException
     */
    private function seedProductIngredients(Product $product, Collection $ingredients): void
    {
        $rows = $ingredients
            ->shuffle()
            ->take(random_int(3, 6))
            ->values()
            ->map(fn(Ingredient $ingredient, int $position): array => [
                'ingredient_id' => $ingredient->getKey(),
                'quantity' => fake()->randomFloat(2, 10, 50),
                'position' => $position,
                'image_url' => $this->inlineImage($ingredient->name, 900, 600),
            ])
            ->all();

        $product->productIngredients()->createMany($rows);
    }
}
