<?php

declare(strict_types=1);

namespace App\Http\Requests\Product\ProductIngredient;

use App\Http\Requests\AdminRequest;
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
            'product_id' => [
                'required',
                'uuid',
                Rule::exists('products', 'id')->whereNull('deleted_at'),
            ],
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

            $alreadyExists = ProductIngredient::query()
                                              ->where('product_id', $this->input('product_id'))
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
