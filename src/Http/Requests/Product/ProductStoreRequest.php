<?php

declare(strict_types=1);

namespace App\Http\Requests\Product;

use App\Http\Requests\AdminRequest;
use App\Http\Requests\Concerns\GeneratesUniqueSlug;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class ProductStoreRequest extends AdminRequest
{
    use GeneratesUniqueSlug;

    /**
     * @inheritDoc
     */
    protected function prepareForValidation(): void
    {
        $name = trim((string)$this->input('name', ''));
        $categoryId = $this->input('category_id');

        $this->merge([
            'name' => $name,
            'slug' => $this->generateUniqueSlug('products', $name),
            'category_id' => $categoryId === '' ? null : $categoryId,
        ]);
    }

    /**
     * Get the validation rules for the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'category_id' => [
                'nullable',
                'uuid',
                Rule::exists('categories', 'id')
                    ->whereNull('deleted_at')
                    ->where('is_system', 0),
            ],
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'slug'),
            ],
            'sku' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('products', 'sku'),
            ],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'featured_image' => [
                'nullable',
                File::image()->max(10 * 1024),
            ],
            'shelf_life' => ['nullable', 'integer', 'min:0'],
            'position' => ['nullable', 'integer', 'min:0'],
            'stock_quantity' => ['nullable', 'integer', 'min:0'],
            'reorder_level' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'is_available' => ['nullable', 'boolean'],
        ];
    }
}
