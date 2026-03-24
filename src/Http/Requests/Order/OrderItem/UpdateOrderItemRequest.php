<?php

declare(strict_types=1);

namespace App\Http\Requests\Order\OrderItem;

use App\Http\Requests\AdminRequest;

/**
 * @property mixed $status
 */
class UpdateOrderItemRequest extends AdminRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'quantity' => 'nullable|integer|min:1|max:99',
            'notes' => 'nullable|string|max:255',
        ];
    }

    /**
     * Custom error messages for a better UX.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'quantity.min' => 'The quantity must be at least 1.',
            'quantity.max' => 'You cannot order more than 99 units of this item.',
        ];
    }
}
