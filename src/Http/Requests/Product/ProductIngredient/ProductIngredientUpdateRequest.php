<?php

declare(strict_types=1);

namespace App\Http\Requests\Product\ProductIngredient;

use App\Http\Requests\AdminRequest;
use Illuminate\Validation\Rules\File;

class ProductIngredientUpdateRequest extends AdminRequest
{
    /**
     * Get the validation rules for the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'product_id' => ['prohibited'],
            'ingredient_id' => ['prohibited'],

            'image' => ['nullable', File::image()->max(10 * 1024)],
            'quantity' => ['nullable', 'numeric', 'min:0'],
            'position' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
