<?php

declare(strict_types=1);

namespace App\Http\Requests\Product;

use App\Http\Requests\AdminRequest;
use App\Http\Requests\Concerns\GeneratesUniqueSlug;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class ProductUpdateRequest extends AdminRequest
{
    use GeneratesUniqueSlug;

    /**
     * @inheritDoc
     */
    protected function prepareForValidation(): void
    {
        if (!$this->has('name')) {
            return;
        }

        $name = trim((string)$this->input('name'));
        $productId = $this->route('product')?->getKey();

        $this->merge([
            'name' => $name,
            'slug' => $this->generateUniqueSlug('products', $name, $productId),
        ]);
    }

    /**
     * Get the validation rules for the request.
     *
     * @return array
     */
    public function rules(): array
    {
        $product = $this->route('product');

        return [
            'category_id' => [
                'sometimes',
                'uuid',
                Rule::exists('categories', 'id')->whereNull('deleted_at'),
            ],
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('products', 'slug')
                    ->whereNull('deleted_at')
                    ->ignore($product?->id),
            ],
            'sku' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('products', 'sku')
                    ->whereNull('deleted_at')
                    ->ignore($product?->id),
            ],
            'description' => ['sometimes', 'string'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'featured_image' => [
                'nullable',
                File::image()->max(10 * 1024),
            ],
            'shelf_life' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'integer', 'min:0'],
            'stock_quantity' => ['nullable', 'integer', 'min:0'],
            'reorder_level' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'is_available' => ['nullable', 'boolean'],
        ];
    }
}
