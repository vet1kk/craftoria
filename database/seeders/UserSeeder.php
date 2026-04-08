<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Seed system users.
     */
    public function run(): void
    {
        $this->seedSystemUsers();
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

}
