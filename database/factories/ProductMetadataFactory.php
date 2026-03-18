<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductMetadata;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProductMetadata>
 */
class ProductMetadataFactory extends Factory
{
    protected $model = ProductMetadata::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'type' => fake()->unique()->randomElement([
                'serving_details',
                'storage_instructions',
                'allergen_note',
                'preparation_tip',
            ]),
            'value' => fake()->sentence(),
        ];
    }
}
