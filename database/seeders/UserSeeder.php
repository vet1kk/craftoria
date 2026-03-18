<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * @return void
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@craftoria.test',
            'phone' => '+380670000001',
            'role' => 'admin',
        ]);

        User::factory()->count(12)->create();
    }
}
