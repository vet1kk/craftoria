<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Seed system categories from config.
     */
    public function run(): void
    {
        $categories = config('catalog.system_categories', []);

        foreach ($categories as $category) {
            Category::updateOrCreate([
                'slug' => $category['slug']
            ], [
                'name' => $category['name'],
                'icon' => $category['icon'] ?? null,
                'image_url' => $category['image_url'] ?? null,
                'position' => $category['position'] ?? 0,
                'is_active' => (bool)($category['is_active'] ?? true),
                'is_system' => (bool)($category['is_system'] ?? true),
            ]);
        }
    }
}
