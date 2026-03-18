<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'fulfillment_type' => ['nullable', 'string', Rule::in(['delivery', 'pickup'])],
            'currency' => ['nullable', 'string', 'size:3'],
            'customer_notes' => ['nullable', 'string'],
            'payment_method' => ['nullable', 'string', Rule::in(['cash', 'card'])],
            'payment_reference' => ['nullable', 'string', 'max:255'],
            'delivery_address_line_1' => ['nullable', 'string', 'max:255'],
            'delivery_address_line_2' => ['nullable', 'string', 'max:255'],
            'delivery_city' => ['nullable', 'string', 'max:255'],
            'delivery_postal_code' => ['nullable', 'string', 'max:40'],
            'delivery_country_code' => ['nullable', 'string', 'size:2'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => [
                'required',
                'uuid',
                Rule::exists('products', 'id')
                    ->where('is_active', true)
                    ->where('is_available', true)
                    ->whereNull('deleted_at'),
            ],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.notes' => ['nullable', 'string'],
        ];
    }
}
