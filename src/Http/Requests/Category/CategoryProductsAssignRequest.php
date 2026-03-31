<?php

declare(strict_types=1);

namespace App\Http\Requests\Category;

use App\Http\Requests\AdminRequest;
use Illuminate\Validation\Rule;

class CategoryProductsAssignRequest extends AdminRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'product_ids' => ['required', 'array'],
            'product_ids.*' => [
                'uuid',
                Rule::exists('products', 'id')->whereNull('deleted_at'),
            ],
        ];
    }
}
