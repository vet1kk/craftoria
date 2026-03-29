<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotalAmount = fake()->randomFloat(2, 100, 2500);
        $discountAmount = fake()->randomFloat(2, 0, min(300, $subtotalAmount));
        $deliveryFeeAmount = fake()->randomFloat(2, 0, 250);
        $totalAmount = max(0, $subtotalAmount - $discountAmount + $deliveryFeeAmount);

        return [
            'user_id' => User::factory(),
            'order_number' => fake()->unique()->numerify('ORD-########'),
            'status' => 'pending',
            'fulfillment_type' => fake()->randomElement(['delivery', 'pickup']),
            'customer_name' => fake()->name(),
            'customer_email' => fake()->safeEmail(),
            'customer_phone' => fake()->e164PhoneNumber(),
            'currency' => 'UAH',
            'subtotal_amount' => $subtotalAmount,
            'discount_amount' => $discountAmount,
            'delivery_fee_amount' => $deliveryFeeAmount,
            'total_amount' => $totalAmount,
            'customer_notes' => fake()->optional()->sentence(),
            'payment_method' => fake()->randomElement(['cash', 'card']),
            'payment_status' => fake()->randomElement(['pending', 'paid']),
            'payment_reference' => fake()->optional()->bothify('PAY-########'),
            'delivery_address_line_1' => fake()->optional()->streetAddress(),
            'delivery_address_line_2' => fake()->optional()->streetAddress(),
            'delivery_city' => fake()->optional()->city(),
            'delivery_postal_code' => fake()->optional()->postcode(),
            'delivery_country_code' => fake()->optional()->countryCode(),
            'placed_at' => now(),
            'confirmed_at' => null,
            'preparing_at' => null,
            'estimated_ready_at' => null,
            'ready_at' => null,
            'paid_at' => null,
            'delivered_at' => null,
            'cancelled_at' => null,
            'cancelled_reason' => null,
        ];
    }
}
