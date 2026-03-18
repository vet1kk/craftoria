<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;

class CatalogSeeder extends Seeder
{
    /**
     * @return void
     *
     * @throws \Random\RandomException
     */
    public function run(): void
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
     * @param  \App\Models\Product  $product
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
     * @param  \App\Models\Product  $product
     * @return void
     *
     * @throws \Random\RandomException
     */
    private function seedProductImages(Product $product): void
    {
        $images = collect(range(0, random_int(1, 3)))
            ->map(fn (int $position): array => [
                'image_url' => fake()->unique()->imageUrl(),
                'position' => $position,
            ])
            ->all();

        $product->images()->createMany($images);
    }

    /**
     * @param  \App\Models\Product  $product
     * @param  \Illuminate\Database\Eloquent\Collection<int, \App\Models\Ingredient>  $ingredients
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
            ->map(fn (Ingredient $ingredient, int $position): array => [
                'ingredient_id' => $ingredient->getKey(),
                'quantity' => fake()->randomFloat(2, 10, 250),
                'position' => $position,
            ])
            ->all();

        $product->productIngredients()->createMany($rows);
    }
}
