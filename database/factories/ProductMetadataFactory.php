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
    /**
     * @var array<int, array{type:string, value:string}>
     */
    private const array PROFILES = [
        ['type' => 'serving_details', 'value' => 'Best served warm.'],
        ['type' => 'storage_instructions', 'value' => 'Keep refrigerated and consume within 24 hours after opening.'],
        ['type' => 'allergen_note', 'value' => 'Contains gluten and dairy.'],
        ['type' => 'preparation_tip', 'value' => 'Warm briefly before serving for the best texture.'],
    ];

    private static int $sequence = 0;

    protected $model = ProductMetadata::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $profile = self::PROFILES[self::$sequence++ % count(self::PROFILES)];

        return [
            'product_id' => Product::factory(),
            'type' => $profile['type'],
            'value' => $profile['value'],
        ];
    }
}
