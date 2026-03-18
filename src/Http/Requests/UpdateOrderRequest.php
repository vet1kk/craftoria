<?php

declare(strict_types=1);

namespace App\Http\Requests;

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
            'status' => ['sometimes', 'string', 'max:50'],
            'fulfillment_type' => ['sometimes', 'string', 'max:50'],
            'customer_name' => ['sometimes', 'string', 'max:255'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'customer_phone' => ['sometimes', 'string', 'max:40'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'customer_notes' => ['nullable', 'string'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'payment_status' => ['sometimes', 'string', 'max:50'],
            'payment_reference' => ['nullable', 'string', 'max:255'],
            'delivery_address_line_1' => ['nullable', 'string', 'max:255'],
            'delivery_address_line_2' => ['nullable', 'string', 'max:255'],
            'delivery_city' => ['nullable', 'string', 'max:255'],
            'delivery_postal_code' => ['nullable', 'string', 'max:40'],
            'delivery_country_code' => ['nullable', 'string', 'size:2'],
            'discount_amount' => ['sometimes', 'numeric', 'min:0'],
            'delivery_fee_amount' => ['sometimes', 'numeric', 'min:0'],
            'subtotal_amount' => ['sometimes', 'numeric', 'min:0'],
            'total_amount' => ['sometimes', 'numeric', 'min:0'],
            'confirmed_at' => ['nullable', 'date'],
            'preparing_at' => ['nullable', 'date'],
            'estimated_ready_at' => ['nullable', 'date'],
            'ready_at' => ['nullable', 'date'],
            'paid_at' => ['nullable', 'date'],
            'delivered_at' => ['nullable', 'date'],
            'cancelled_at' => ['nullable', 'date'],
            'cancelled_reason' => ['nullable', 'string'],
        ];
    }
}
