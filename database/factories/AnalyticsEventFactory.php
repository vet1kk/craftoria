<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\AnalyticsEvent;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AnalyticsEvent>
 */
class AnalyticsEventFactory extends Factory
{
    protected $model = AnalyticsEvent::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'session_id' => (string) Str::uuid(),
            'name' => fake()->randomElement(['page_view', 'product_view', 'order_started']),
            'url' => fake()->url(),
            'properties' => [
                'source' => fake()->randomElement(['web', 'mobile']),
                'campaign' => fake()->optional()->word(),
            ],
            'occurred_at' => now(),
        ];
    }
}
