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
            ->assertJsonPath('data.user.email', 'john@example.com')
            ->assertJsonStructure([
                'data' => ['access_token', 'token_type', 'expires_in', 'user'],
            ]);

        $this->assertDatabaseHas('users', ['email' => 'john@example.com', 'role' => 'client']);
    }

    public function test_user_can_login_and_get_session(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        $loginResponse = $this->postJson('/api/login', [
            'email' => 'TEST@example.com',
            'password' => 'password',
        ])->assertOk();

        $token = $loginResponse->json('data.access_token');

        $this->withHeaders(['Authorization' => "Bearer {$token}"])
             ->getJson('/api/session')
            ->assertOk()
             ->assertJsonPath('data.authenticated', true);
    }

    public function test_user_can_logout(): void
    {
        $user = User::factory()->create([
            'email' => 'logout@example.test',
            'password' => bcrypt('secret123'),
        ]);

        $loginResponse = $this->postJson('/api/login', [
            'email' => 'logout@example.test',
            'password' => 'secret123',
        ])->assertOk();

        $token = $loginResponse->json('data.access_token');

        $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->postJson('/api/logout')
            ->assertNoContent();

        $this->withHeaders(['Authorization' => "Bearer {$token}"])
             ->getJson('/api/session')
            ->assertOk()
             ->assertJsonPath('data.authenticated', false);
    }

    public function test_it_returns_session_state_without_unauthorized_response(): void
    {
        $this->getJson('/api/session')
            ->assertOk()
            ->assertJsonPath('data.authenticated', false)
            ->assertJsonPath('data.user', null);

        $user = User::factory()->create([
            'email' => 'session@example.test',
            'password' => 'secret123',
        ]);

        $loginResponse = $this->postJson('/api/login', [
            'email' => 'session@example.test',
            'password' => 'secret123',
        ])->assertOk();

        $token = $loginResponse->json('data.access_token');

        $this->withHeaders(['Authorization' => "Bearer {$token}"])
             ->getJson('/api/session')
            ->assertOk()
             ->assertJsonPath('data.authenticated', true)
             ->assertJsonPath('data.user.id', $user->getKey())
             ->assertJsonPath('data.user.email', 'session@example.test');
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
