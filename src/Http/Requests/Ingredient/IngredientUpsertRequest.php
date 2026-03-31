<?php

declare(strict_types=1);

namespace App\Http\Requests\Ingredient;

use App\Http\Requests\AdminRequest;
use Illuminate\Validation\Rule;

class IngredientUpsertRequest extends AdminRequest
{
    /**
     * Get the validation rules for the request.
     *
     * @return array
     */
    public function rules(): array
    {
        $ingredientId = $this->route('ingredient')?->getKey();

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('ingredients', 'slug')->ignore($ingredientId)->whereNull('deleted_at')
            ],
            'unit' => ['required', 'string', Rule::in(['g', 'ml'])],
            'calories' => ['nullable', 'integer', 'min:0'],
            'proteins' => ['nullable', 'numeric', 'min:0'],
            'fats' => ['nullable', 'numeric', 'min:0'],
            'carbs' => ['nullable', 'numeric', 'min:0'],
            'cost_amount' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
