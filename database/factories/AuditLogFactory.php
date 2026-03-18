<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AuditLog>
 */
class AuditLogFactory extends Factory
{
    protected $model = AuditLog::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'actor_id' => User::factory(),
            'event' => fake()->randomElement(['created', 'updated', 'deleted']),
            'auditable_type' => null,
            'auditable_id' => null,
            'old_values' => ['status' => 'draft'],
            'new_values' => ['status' => 'published'],
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
            'occurred_at' => now(),
        ];
    }
}
