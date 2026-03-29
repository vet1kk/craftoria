<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property string $id
 * @property string|null $user_id
 * @property string $order_number
 * @property string $status
 * @property string $fulfillment_type
 * @property string $customer_name
 * @property string|null $customer_email
 * @property string $customer_phone
 * @property string $currency
 * @property string $subtotal_amount
 * @property string $discount_amount
 * @property string $delivery_fee_amount
 * @property string $total_amount
 * @property string|null $customer_notes
 * @property string|null $payment_method
 * @property string $payment_status
 * @property string|null $payment_reference
 * @property string|null $delivery_address_line_1
 * @property string|null $delivery_address_line_2
 * @property string|null $delivery_city
 * @property string|null $delivery_postal_code
 * @property string|null $delivery_country_code
 * @property \Illuminate\Support\Carbon|null $placed_at
 * @property \Illuminate\Support\Carbon|null $confirmed_at
 * @property \Illuminate\Support\Carbon|null $preparing_at
 * @property \Illuminate\Support\Carbon|null $estimated_ready_at
 * @property \Illuminate\Support\Carbon|null $ready_at
 * @property \Illuminate\Support\Carbon|null $paid_at
 * @property \Illuminate\Support\Carbon|null $delivered_at
 * @property \Illuminate\Support\Carbon|null $cancelled_at
 * @property string|null $cancelled_reason
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \App\Models\User|null $user
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\OrderItem> $order_items
 */
class Order extends Model
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'order_number',
        'status',
        'fulfillment_type',
        'customer_name',
        'customer_email',
        'customer_phone',
        'currency',
        'subtotal_amount',
        'discount_amount',
        'delivery_fee_amount',
        'total_amount',
        'customer_notes',
        'payment_method',
        'payment_status',
        'payment_reference',
        'delivery_address_line_1',
        'delivery_address_line_2',
        'delivery_city',
        'delivery_postal_code',
        'delivery_country_code',
        'placed_at',
        'confirmed_at',
        'preparing_at',
        'estimated_ready_at',
        'ready_at',
        'paid_at',
        'delivered_at',
        'cancelled_at',
        'cancelled_reason',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array
     */
    protected function casts(): array
    {
        return [
            'subtotal_amount' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'delivery_fee_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'placed_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'preparing_at' => 'datetime',
            'estimated_ready_at' => 'datetime',
            'ready_at' => 'datetime',
            'paid_at' => 'datetime',
            'delivered_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    /**
     * Get the related user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the related order item records.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<\App\Models\OrderItem>
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * @return \App\Models\Order
     */
    public function loadDetails(): self
    {
        return $this->load(['orderItems', 'user']);
    }
}
