<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Helpers\FileUpload;
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
     * @param \Illuminate\Http\Request $request
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
            'price' => (float)$this->price,
            'featured_image_url' => FileUpload::publicUrl($this->featured_image_url),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'metadata' => ProductMetadataResource::collection($this->whenLoaded('metadata')),
            'ingredients' => IngredientWithPivotResource::collection($this->whenLoaded('ingredients')),
            'shelf_life' => $this->shelf_life,
            'position' => $this->position,
            'stock_quantity' => $this->stock_quantity,
            'reorder_level' => $this->reorder_level,
            'is_active' => $this->is_active,
            'is_available' => $this->is_available,
            'nutrition_totals' => $this->whenLoaded('ingredients', fn() => $this->calculateNutritionTotals()),
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
            $multiplier = ((float)$ingredient->pivot->quantity);
            $totals['calories'] += $ingredient->calories * $multiplier;
            $totals['proteins'] += (float)$ingredient->proteins * $multiplier;
            $totals['fats'] += (float)$ingredient->fats * $multiplier;
            $totals['carbs'] += (float)$ingredient->carbs * $multiplier;
        }

        return [
            'calories' => (int)round($totals['calories']),
            'proteins' => round($totals['proteins'], 2),
            'fats' => round($totals['fats'], 2),
            'carbs' => round($totals['carbs'], 2),
        ];
    }
}
