<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Seed system users (idempotent) and optionally fake users.
     *
     * @return void
     */
    public function run(): void
    {
        $this->seedSystemUsers();

        if ($this->shouldSeedFakeData()) {
            User::factory()->count(12)->create();
        }
    }

    /**
     * Create system users if they don't exist.
     *
     * @return void
     */
    private function seedSystemUsers(): void
    {
        User::query()->firstOrCreate(
            ['email' => 'admin@craftoria'],
            [
                'name' => 'Admin User',
                'phone' => '+380670000001',
                'role' => 'admin',
                'password' => bcrypt('password'),
                'is_system' => true,
            ]
        );
    }

    /**
     * Only seed fake data if no non-system users exist.
     *
     * @return bool
     */
    private function shouldSeedFakeData(): bool
    {
        return User::query()->where('is_system', false)->doesntExist();
    }
}
