<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_registers_a_client_user(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Ihor Client',
            'email' => 'ihor@example.test',
            'phone' => '+380671112233',
            'password' => 'secret123',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.email', 'ihor@example.test')
            ->assertJsonPath('data.role', 'client');

        $this->assertDatabaseHas('users', [
            'email' => 'ihor@example.test',
            'role' => 'client',
        ]);
    }

    public function test_it_logs_in_and_out_with_session_authentication(): void
    {
        $user = User::factory()->create([
            'email' => 'ihor@example.test',
            'password' => 'secret123',
        ]);

        $this
            ->postJson('/api/login', [
                'email' => 'ihor@example.test',
                'password' => 'secret123',
            ])
            ->assertOk()
            ->assertJsonPath('data.id', $user->getKey());

        $this->getJson('/api/profile')
             ->assertOk()
             ->assertJsonPath('data.email', 'ihor@example.test');

        $this->postJson('/api/logout')
             ->assertNoContent();

        $this->getJson('/api/profile')
             ->assertUnauthorized();
    }

    public function test_it_returns_session_state_without_unauthorized_response(): void
    {
        $this->getJson('/api/session')
            ->assertOk()
            ->assertJson([
                'authenticated' => false,
                'user' => null,
            ]);

        $user = User::factory()->create([
            'email' => 'session@example.test',
            'password' => 'secret123',
        ]);

        $this->postJson('/api/login', [
            'email' => 'session@example.test',
            'password' => 'secret123',
        ])->assertOk();

        $this->getJson('/api/session')
            ->assertOk()
            ->assertJsonPath('authenticated', true)
            ->assertJsonPath('user.id', $user->getKey())
            ->assertJsonPath('user.email', 'session@example.test');
    }

    public function test_it_rejects_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'ihor@example.test',
            'password' => 'secret123',
        ]);

        $this
            ->postJson('/api/login', [
                'email' => 'ihor@example.test',
                'password' => 'wrong-password',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }
}
