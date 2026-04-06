<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_only_system_user_and_system_categories(): void
    {
        $this->seed();

        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseHas('users', [
            'email' => 'admin@craftoria',
            'role' => 'admin',
            'is_system' => true,
        ]);

        $this->assertDatabaseHas('categories', [
            'slug' => 'all',
            'name' => 'All',
            'is_system' => true,
            'is_active' => true,
        ]);
    }
}
