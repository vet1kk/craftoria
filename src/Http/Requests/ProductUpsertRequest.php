<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class ProductUpsertRequest extends AdminRequest
{
    /**
     * Get the validation rules for the request.
     *
     * @return array
     */
    public function rules(): array
    {
        $productId = $this->route('product')?->getKey();

        return [
            'category_id' => [
                'required',
                'uuid',
                Rule::exists('categories', 'id')->whereNull('deleted_at'),
            ],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($productId)],
            'sku' => ['nullable', 'string', 'max:255', Rule::unique('products', 'sku')->ignore($productId)],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'featured_image_url' => ['nullable', 'url', 'max:2048'],
            'shelf_life' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'integer', 'min:0'],
            'stock_quantity' => ['nullable', 'integer', 'min:0'],
            'reorder_level' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'is_available' => ['nullable', 'boolean'],
            'metadata' => ['nullable', 'array'],
            'metadata.*.type' => ['required_with:metadata', 'string', 'max:255', 'distinct:strict'],
            'metadata.*.value' => ['nullable', 'string'],
            'images' => ['nullable', 'array'],
            'images.*.image_url' => ['required_with:images', 'url', 'max:2048', 'distinct:strict'],
            'images.*.position' => ['nullable', 'integer', 'min:0'],
            'ingredients' => ['nullable', 'array'],
            'ingredients.*.ingredient_id' => [
                'required_with:ingredients',
                'uuid',
                Rule::exists('ingredients', 'id')->whereNull('deleted_at'),
                'distinct:strict',
            ],
            'ingredients.*.quantity' => ['required_with:ingredients', 'numeric', 'min:0'],
            'ingredients.*.position' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
