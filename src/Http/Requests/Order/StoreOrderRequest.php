<?php

declare(strict_types=1);

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * @property mixed $fulfillment_type
 */
class StoreOrderRequest extends FormRequest
{
    /**
     * Determine whether the request is authorized.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules for the request.
     *
     * @return array
     */
    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:40'],
            'fulfillment_type' => ['required', Rule::in(['delivery', 'pickup'])],
            'currency' => ['sometimes', 'string', 'size:3'],
            'customer_notes' => ['nullable', 'string'],
            'delivery_address_line_1' => [
                Rule::requiredIf($this->fulfillment_type === 'delivery'),
                'string',
                'max:255',
            ],
            'delivery_city' => [Rule::requiredIf($this->fulfillment_type === 'delivery'), 'string', 'max:255'],
            'delivery_address_line_2' => ['nullable', 'string', 'max:255'],
            'delivery_postal_code' => ['nullable', 'string', 'max:40'],
            'delivery_country_code' => ['nullable', 'string', 'size:2'],
            'payment_method' => ['required', Rule::in(['cash', 'card'])],
        ];
    }
}
