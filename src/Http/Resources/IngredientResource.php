<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Traits\ResolvesTranslatedValue;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Ingredient */
class IngredientResource extends JsonResource
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
            'name' => $this->name,
            'slug' => $this->slug,
            'unit' => $this->unit,
            'nutrition_totals' => [
                'calories' => $this->calories,
                'proteins' => (float)$this->proteins,
                'fats' => (float)$this->fats,
                'carbs' => (float)$this->carbs,
            ],
            'cost_amount' => (float)$this->cost_amount,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toAtomString(),
            'updated_at' => $this->updated_at?->toAtomString(),
        ]);
    }
}
