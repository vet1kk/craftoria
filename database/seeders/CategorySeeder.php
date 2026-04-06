<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use App\Services\CatalogTranslationService;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{

    /**
     * @param \App\Services\CatalogTranslationService $catalogTranslationService
     */
    public function __construct(private readonly CatalogTranslationService $catalogTranslationService)
    {
    }

    /**
     * Seed system categories from config.
     */
    public function run(): void
    {
        $categories = config('catalog.system_categories', []);
        $translationConfig = config('catalog.translation_targets.categories', []);

        foreach ($categories as $category) {
            if (!isset($category['slug'])) {
                continue;
            }
            $model = Category::updateOrCreate([
                'slug' => $category['slug']
            ], array_diff_key($category, array_flip(['slug', 'translations'])));

            foreach ($category['translations'] ?? [] as $locale => $fields) {
                $this->catalogTranslationService->upsertLocaleFields(
                    $model,
                    $locale,
                    $fields,
                    $translationConfig['fields'] ?? []
                );
            }
        }
    }
}
