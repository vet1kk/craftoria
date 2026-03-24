<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Traits\ResolvesTranslatedValue;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Ingredient */
class IngredientWithPivotResource extends JsonResource
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
            'quantity' => (float)$this->pivot?->quantity,
            'position' => $this->pivot?->position,
            'nutrition_totals' => [
                'calories' => $this->calories * (float)$this->pivot?->quantity,
                'proteins' => (float)$this->proteins * (float)$this->pivot?->quantity,
                'fats' => (float)$this->fats * (float)$this->pivot?->quantity,
                'carbs' => (float)$this->carbs * (float)$this->pivot?->quantity,
            ],
        ]);
    }
}
