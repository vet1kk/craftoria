<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Traits\ResolvesTranslatedValue;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Order */
class OrderResource extends JsonResource
{
    use ResolvesTranslatedValue;

    /**
     * Transform the resource into an array.
     *
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    public function toArray(Request $request): array
    {
        return $this->translateResource([
            'id' => $this->id,
            'order_number' => $this->order_number,
            'user_id' => $this->user_id,
            'status' => $this->status,
            'fulfillment_type' => $this->fulfillment_type,
            'customer_name' => $this->customer_name,
            'customer_email' => $this->customer_email,
            'customer_phone' => $this->customer_phone,
            'currency' => $this->currency,
            'subtotal_amount' => (float)$this->subtotal_amount,
            'discount_amount' => (float)$this->discount_amount,
            'delivery_fee_amount' => (float)$this->delivery_fee_amount,
            'total_amount' => (float)$this->total_amount,
            'customer_notes' => $this->customer_notes,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'payment_reference' => $this->payment_reference,
            'delivery_address' => [
                'line_1' => $this->delivery_address_line_1,
                'line_2' => $this->delivery_address_line_2,
                'city' => $this->delivery_city,
                'postal_code' => $this->delivery_postal_code,
                'country_code' => $this->delivery_country_code,
            ],
            'placed_at' => $this->placed_at?->toAtomString(),
            'confirmed_at' => $this->confirmed_at?->toAtomString(),
            'preparing_at' => $this->preparing_at?->toAtomString(),
            'estimated_ready_at' => $this->estimated_ready_at?->toAtomString(),
            'ready_at' => $this->ready_at?->toAtomString(),
            'paid_at' => $this->paid_at?->toAtomString(),
            'delivered_at' => $this->delivered_at?->toAtomString(),
            'cancelled_at' => $this->cancelled_at?->toAtomString(),
            'cancelled_reason' => $this->cancelled_reason,
            'items' => OrderItemResource::collection($this->whenLoaded('orderItems')),
            'created_at' => $this->created_at?->toAtomString(),
            'updated_at' => $this->updated_at?->toAtomString(),
        ]);
    }
}
