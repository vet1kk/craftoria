<?php

declare(strict_types=1);

namespace App\Http\Requests\Order;

use App\Http\Requests\AdminRequest;
use Illuminate\Validation\Rule;

/**
 * @property mixed $status
 */
class UpdateOrderRequest extends AdminRequest
{
    /**
     * Get the validation rules for the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'status' => [
                'sometimes',
                Rule::in(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'])
            ],
            'payment_status' => ['sometimes', Rule::in(['pending', 'paid', 'failed', 'refunded'])],
            'delivery_fee_amount' => ['sometimes', 'numeric', 'min:0'],
            'discount_amount' => ['sometimes', 'numeric', 'min:0'],
            'cancelled_reason' => [Rule::requiredIf($this->status === 'cancelled'), 'string'],
            'customer_name' => ['sometimes', 'string', 'max:255'],
            'customer_phone' => ['sometimes', 'string', 'max:40'],
            'payment_method' => ['sometimes', Rule::in(['cash', 'card'])],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'delivery_city' => ['nullable', 'string', 'max:255'],
        ];
    }
}
