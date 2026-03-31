<?php

declare(strict_types=1);

namespace App\Http\Requests\Product\ProductIngredient;

use App\Http\Requests\AdminRequest;
use App\Models\Product;
use App\Models\ProductIngredient;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;
use Illuminate\Validation\Validator;

class ProductIngredientStoreRequest extends AdminRequest
{
    /**
     * Get the validation rules for the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'ingredient_id' => [
                'required',
                'uuid',
                Rule::exists('ingredients', 'id')->whereNull('deleted_at'),
            ],
            'image' => ['nullable', File::image()->max(10 * 1024)],
            'quantity' => ['required', 'numeric', 'min:0'],
            'position' => ['nullable', 'integer', 'min:0'],
        ];
    }

    /**
     * @param \Illuminate\Validation\Validator $validator
     * @return void
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->count() > 0) {
                return;
            }

            /** @var \App\Models\Product|null $product */
            $product = $this->route('product');

            if (!$product instanceof Product) {
                $validator->errors()->add('product', 'Product route binding is required.');

                return;
            }

            $alreadyExists = ProductIngredient::query()
                ->where('product_id', $product->id)
                                              ->where('ingredient_id', $this->input('ingredient_id'))
                                              ->whereNull('deleted_at')
                                              ->exists();

            if ($alreadyExists) {
                $validator->errors()->add(
                    'ingredient_id',
                    'This ingredient is already added to this product.'
                );
            }
        });
    }
}
