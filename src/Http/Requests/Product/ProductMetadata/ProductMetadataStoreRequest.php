<?php

declare(strict_types=1);

namespace App\Http\Requests\Product\ProductMetadata;

use App\Http\Requests\AdminRequest;
use Illuminate\Validation\Rule;

class ProductMetadataStoreRequest extends AdminRequest
{
    /**
     * Get the validation rules for the request.
     *
     * @return array
     */
    public function rules(): array
    {
        $product = $this->route('product');

        return [
            'type' => [
                'required',
                'string',
                'max:255',
                Rule::unique('product_metadata', 'type')
                    ->where('product_id', $product?->id),
            ],
            'value' => ['required', 'string'],
        ];
    }
}
