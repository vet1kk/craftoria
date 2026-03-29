<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'John Doe',
            'email' => 'JOHN@example.com', // Test case insensitivity
            'phone' => '1234567890',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.email', 'john@example.com');

        $this->assertDatabaseHas('users', ['email' => 'john@example.com', 'role' => 'client']);
    }

    public function test_user_can_login_and_get_session(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $this->postJson('/api/login', [
            'email' => 'TEST@example.com',
            'password' => 'password',
        ])->assertOk();

        $this->getJson('/api/session')
            ->assertOk()
            ->assertJson(['authenticated' => true]);
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)
            ->postJson('/api/logout')
            ->assertNoContent();

        $this->getJson('/api/session')
            ->assertOk()
            ->assertJson(['authenticated' => false]);
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
