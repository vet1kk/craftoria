<?php

declare(strict_types=1);

return [
    'system_categories' => [
        [
            'slug' => 'all',
            'name' => 'All',
            'icon' => '🍽️',
            'image_url' => null,
            'position' => -1,
            'is_active' => true,
            'is_system' => true,
            'translations' => [
                'uk' => [
                    'name' => 'Усі',
                ],
            ],
        ],
    ],
    'translation_targets' => [
        'categories' => [
            'model' => App\Models\Category::class,
            'fields' => ['name'],
        ],
        'ingredients' => [
            'model' => App\Models\Ingredient::class,
            'fields' => ['name'],
        ],
        'products' => [
            'model' => App\Models\Product::class,
            'fields' => ['name', 'description'],
        ],
        'product-metadata' => [
            'model' => App\Models\ProductMetadata::class,
            'fields' => ['value'],
        ],
    ],
];
