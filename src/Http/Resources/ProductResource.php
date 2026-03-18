<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Traits\ResolvesTranslatedValue;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Product */
class ProductResource extends JsonResource
{
    use ResolvesTranslatedValue;

    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray(Request $request): array
    {
        return $this->translateResource([
            'id' => $this->id,
            'category_id' => $this->category_id,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'name' => $this->name,
            'description' => $this->description,
            'price' => (float) $this->price,
            'featured_image_url' => $this->featured_image_url,
            'gallery_image_urls' => $this->whenLoaded('images', fn () => $this->images->pluck('image_url')->values()->all()),
            'metadata' => $this->whenLoaded('metadata', function (): array {
                return $this->metadata->mapWithKeys(function ($metadata): array {
                    $metadata->setRelation('product', $this->resource);
                    $translatedMetadata = $this->translatePayloadForModel([
                        'type' => $metadata->type,
                        'value' => $metadata->value,
                    ], $metadata);

                    return [
                        $translatedMetadata['type'] => $translatedMetadata['value'],
                    ];
                })->all();
            }),
            'ingredients' => $this->whenLoaded('ingredients', function () {
                return $this->ingredients->map(function ($ingredient): array {
                    return $this->translatePayloadForModel([
                        'id' => $ingredient->id,
                        'name' => $ingredient->name,
                        'slug' => $ingredient->slug,
                        'unit' => $ingredient->unit,
                        'quantity' => (float) $ingredient->pivot->quantity,
                        'position' => (int) $ingredient->pivot->position,
                        'nutrition_per_100' => [
                            'calories' => $ingredient->calories,
                            'proteins' => (float) $ingredient->proteins,
                            'fats' => (float) $ingredient->fats,
                            'carbs' => (float) $ingredient->carbs,
                        ],
                    ], $ingredient);
                })->values()->all();
            }),
            'shelf_life' => $this->shelf_life,
            'position' => $this->position,
            'stock_quantity' => $this->stock_quantity,
            'reorder_level' => $this->reorder_level,
            'is_active' => $this->is_active,
            'is_available' => $this->is_available,
            'nutrition_totals' => $this->whenLoaded('ingredients', fn () => $this->calculateNutritionTotals()),
            'created_at' => $this->created_at?->toAtomString(),
            'updated_at' => $this->updated_at?->toAtomString(),
        ]);
    }

    /**
     * Calculate aggregate nutrition totals for the product.
     *
     * @return array{calories:int, proteins:float, fats:float, carbs:float}
     */
    private function calculateNutritionTotals(): array
    {
        $totals = [
            'calories' => 0.0,
            'proteins' => 0.0,
            'fats' => 0.0,
            'carbs' => 0.0,
        ];

        foreach ($this->ingredients as $ingredient) {
            $multiplier = ((float) $ingredient->pivot->quantity) / 100;
            $totals['calories'] += $ingredient->calories * $multiplier;
            $totals['proteins'] += (float) $ingredient->proteins * $multiplier;
            $totals['fats'] += (float) $ingredient->fats * $multiplier;
            $totals['carbs'] += (float) $ingredient->carbs * $multiplier;
        }

        return [
            'calories' => (int) round($totals['calories']),
            'proteins' => round($totals['proteins'], 2),
            'fats' => round($totals['fats'], 2),
            'carbs' => round($totals['carbs'], 2),
        ];
    }
}
