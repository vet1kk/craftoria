<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileAnalyticsHealthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_endpoint_returns_expected_payload(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertJsonStructure([
                'name',
                'environment',
                'debug',
                'framework',
                'php',
                'api',
                'database' => ['connection', 'host', 'port', 'database'],
                'timestamp',
            ])
            ->assertJsonPath('api', 'ready');
    }

    public function test_analytics_endpoint_accepts_guest_and_authenticated_events(): void
    {
        $this->postJson('/api/analytics/events', [
            'session_id' => 'guest-session',
            'name' => 'page_view',
            'url' => 'https://example.com',
            'properties' => ['screen' => 'home'],
        ])->assertAccepted();

        $user = User::factory()->create();
        $this->actingAs($user, 'api');

        $this->postJson('/api/analytics/events', [
            'session_id' => 'auth-session',
            'name' => 'order_started',
            'url' => 'https://example.com/checkout',
        ])->assertAccepted();

        $this->assertDatabaseCount('analytics_events', 2);
        $this->assertDatabaseHas('analytics_events', [
            'session_id' => 'auth-session',
            'user_id' => $user->getKey(),
        ]);
    }

    public function test_profile_routes_require_authentication_and_allow_self_update(): void
    {
        $user = User::factory()->create([
            'email' => 'self@example.test',
            'phone' => '+380671112233',
        ]);
        $otherUser = User::factory()->create([
            'email' => 'other@example.test',
            'phone' => '+380671112244',
        ]);

        $this->getJson('/api/profile')->assertUnauthorized();

        $this->actingAs($user, 'api');

        $this->getJson('/api/profile')
            ->assertOk()
            ->assertJsonPath('data.email', 'self@example.test')
            ->assertJsonMissingPath('data.orders');

        Order::factory()->create([
            'user_id' => $user->getKey(),
            'customer_name' => 'Self Customer',
            'customer_phone' => '+380671112255',
        ]);
        Order::factory()->create([
            'user_id' => $otherUser->getKey(),
            'customer_name' => 'Other Customer',
            'customer_phone' => '+380671112244',
        ]);

        $this->getJson('/api/profile/orders')
             ->assertOk()
             ->assertJsonCount(1, 'data')
             ->assertJsonPath('data.0.user_id', $user->getKey());

        $this->putJson('/api/profile', [
            'name' => 'Updated Self',
            'email' => 'self@example.test',
            'phone' => '+380671112255',
        ])
            ->assertOk()
            ->assertJsonPath('data.phone', '+380671112255');

        $this->putJson('/api/profile', [
            'email' => $otherUser->email,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }
}
