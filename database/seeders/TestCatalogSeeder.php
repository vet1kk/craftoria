<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Product;
use App\Models\ProductIngredient;
use App\Models\ProductMetadata;
use App\Services\CatalogTranslationService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

class TestCatalogSeeder extends Seeder
{
    /**
     * @var array<int, array<string, mixed>>
     */
    private const array CATEGORIES = [
        [
            'slug' => 'artisan-breads',
            'name' => 'Artisan Breads',
            'icon' => '🥖',
            'position' => 10,
            'image_url' => null,
            'is_active' => true,
            'is_system' => false,
            'translations' => [
                'uk' => ['name' => 'Ремісничий хліб'],
            ],
        ],
        [
            'slug' => 'pastry-desserts',
            'name' => 'Pastry & Desserts',
            'icon' => '🧁',
            'position' => 20,
            'image_url' => null,
            'is_active' => true,
            'is_system' => false,
            'translations' => [
                'uk' => ['name' => 'Випічка та десерти'],
            ],
        ],
        [
            'slug' => 'seasonal-drinks',
            'name' => 'Seasonal Drinks',
            'icon' => '🥤',
            'position' => 30,
            'is_active' => true,
            'image_url' => null,
            'is_system' => false,
            'translations' => [
                'uk' => ['name' => 'Сезонні напої'],
            ],
        ],
        [
            'slug' => 'archived-menu',
            'name' => 'Archived Menu',
            'icon' => '📦',
            'position' => 40,
            'image_url' => null,
            'is_active' => true,
            'is_system' => false,
            'translations' => [
                'uk' => ['name' => 'Архівне меню'],
            ],
        ],
    ];

    /**
     * @var array<int, array<string, mixed>>
     */
    private const array INGREDIENTS = [
        [
            'slug' => 'wheat-flour',
            'name' => 'Wheat Flour',
            'unit' => 'g',
            'calories' => 3.64,
            'proteins' => 0.10,
            'fats' => 0.01,
            'carbs' => 0.76,
            'cost_amount' => 0.02,
            'is_active' => true,
            'translations' => [
                'uk' => ['name' => 'Пшеничне борошно'],
            ],
        ],
        [
            'slug' => 'butter',
            'name' => 'Butter',
            'unit' => 'g',
            'calories' => 7.17,
            'proteins' => 0.01,
            'fats' => 0.81,
            'carbs' => 0.00,
            'cost_amount' => 0.09,
            'is_active' => true,
            'translations' => [
                'uk' => ['name' => 'Вершкове масло'],
            ],
        ],
        [
            'slug' => 'almonds',
            'name' => 'Almonds',
            'unit' => 'g',
            'calories' => 5.79,
            'proteins' => 0.21,
            'fats' => 0.50,
            'carbs' => 0.22,
            'cost_amount' => 0.14,
            'is_active' => true,
            'translations' => [
                'uk' => ['name' => 'Мигдаль'],
            ],
        ],
        [
            'slug' => 'strawberries',
            'name' => 'Strawberries',
            'unit' => 'g',
            'calories' => 0.32,
            'proteins' => 0.01,
            'fats' => 0.00,
            'carbs' => 0.08,
            'cost_amount' => 0.11,
            'is_active' => true,
            'translations' => [
                'uk' => ['name' => 'Полуниця'],
            ],
        ],
        [
            'slug' => 'honey',
            'name' => 'Honey',
            'unit' => 'g',
            'calories' => 3.04,
            'proteins' => 0.00,
            'fats' => 0.00,
            'carbs' => 0.82,
            'cost_amount' => 0.13,
            'is_active' => true,
            'translations' => [
                'uk' => ['name' => 'Мед'],
            ],
        ],
        [
            'slug' => 'lemon-juice',
            'name' => 'Lemon Juice',
            'unit' => 'ml',
            'calories' => 0.22,
            'proteins' => 0.00,
            'fats' => 0.00,
            'carbs' => 0.07,
            'cost_amount' => 0.04,
            'is_active' => true,
            'translations' => [
                'uk' => ['name' => 'Лимонний сік'],
            ],
        ],
        [
            'slug' => 'black-tea',
            'name' => 'Black Tea',
            'unit' => 'ml',
            'calories' => 0.01,
            'proteins' => 0.00,
            'fats' => 0.00,
            'carbs' => 0.00,
            'cost_amount' => 0.02,
            'is_active' => true,
            'translations' => [
                'uk' => ['name' => 'Чорний чай'],
            ],
        ],
    ];

    /**
     * @var array<int, array<string, mixed>>
     */
    private const array PRODUCTS = [
        [
            'slug' => 'sourdough-country-loaf',
            'name' => 'Sourdough Country Loaf',
            'sku' => 'CB-BRD-001',
            'description' => 'Slow fermented sourdough loaf with crisp crust and soft crumb.',
            'price' => 145.00,
            'shelf_life' => 48,
            'position' => 10,
            'stock_quantity' => 18,
            'featured_image_url' => null,
            'reorder_level' => 6,
            'is_active' => true,
            'is_available' => true,
            'category_slug' => 'artisan-breads',
            'translations' => [
                'uk' => [
                    'name' => 'Заквасний сільський хліб',
                    'description' => 'Хліб довгої ферментації з хрусткою скоринкою та м\'якушем.',
                ],
            ],
            'metadata' => [
                [
                    'type' => 'packaging',
                    'value' => 'Wrapped in craft paper with a vented label.',
                    'translations' => [
                        'uk' => ['value' => 'Загорнуто у крафтовий папір з вентиляційною етикеткою.'],
                    ],
                ],
                [
                    'type' => 'storage_instructions',
                    'value' => 'Store in a bread box at room temperature for up to 2 days.',
                    'translations' => [
                        'uk' => ['value' => 'Зберігати у хлібниці при кімнатній температурі до 2 днів.'],
                    ],
                ],
            ],
            'ingredients' => [
                ['slug' => 'wheat-flour', 'quantity' => 180.00],
                ['slug' => 'butter', 'quantity' => 8.00],
            ],
        ],
        [
            'slug' => 'almond-croissant',
            'name' => 'Almond Croissant',
            'sku' => 'CB-PAS-014',
            'description' => 'Buttery laminated pastry filled with almond cream.',
            'price' => 98.00,
            'shelf_life' => 24,
            'position' => 20,
            'featured_image_url' => null,
            'stock_quantity' => 22,
            'reorder_level' => 10,
            'is_active' => true,
            'is_available' => true,
            'category_slug' => 'pastry-desserts',
            'translations' => [
                'uk' => [
                    'name' => 'Мигдалевий круасан',
                    'description' => 'Листковий круасан на маслі з мигдальним кремом.',
                ],
            ],
            'metadata' => [
                [
                    'type' => 'contents',
                    'value' => 'Contains almonds, dairy and gluten.',
                    'translations' => [
                        'uk' => ['value' => 'Містить мигдаль, молочні продукти та глютен.'],
                    ],
                ],
            ],
            'ingredients' => [
                ['slug' => 'wheat-flour', 'quantity' => 70.00],
                ['slug' => 'butter', 'quantity' => 24.00],
                ['slug' => 'almonds', 'quantity' => 18.00],
            ],
        ],
        [
            'slug' => 'honey-berry-layer-cake',
            'name' => 'Honey Berry Layer Cake',
            'sku' => 'CB-DES-007',
            'description' => 'Soft sponge layers with honey cream and seasonal berries.',
            'price' => 420.00,
            'shelf_life' => 36,
            'featured_image_url' => null,
            'position' => 30,
            'stock_quantity' => 0,
            'reorder_level' => 2,
            'is_active' => true,
            'is_available' => false,
            'category_slug' => 'pastry-desserts',
            'translations' => [
                'uk' => [
                    'name' => 'Медово-ягідний торт',
                    'description' => 'Ніжні коржі з медовим кремом та сезонними ягодами.',
                ],
            ],
            'metadata' => [
                [
                    'type' => 'packaging',
                    'value' => 'Delivered in a rigid cake box with cooling insert.',
                    'translations' => [
                        'uk' => ['value' => 'Подається у щільній коробці для торта з охолоджувачем.'],
                    ],
                ],
            ],
            'ingredients' => [
                ['slug' => 'wheat-flour', 'quantity' => 90.00],
                ['slug' => 'honey', 'quantity' => 40.00],
                ['slug' => 'strawberries', 'quantity' => 65.00],
            ],
        ],
        [
            'slug' => 'lemon-ice-tea',
            'name' => 'Lemon Ice Tea',
            'sku' => 'CB-DRK-003',
            'description' => 'Cold brewed black tea with lemon juice and light sweetness.',
            'price' => 75.00,
            'shelf_life' => 12,
            'position' => 40,
            'featured_image_url' => null,
            'stock_quantity' => 6,
            'reorder_level' => 6,
            'is_active' => true,
            'is_available' => true,
            'category_slug' => 'seasonal-drinks',
            'translations' => [
                'uk' => [
                    'name' => 'Лимонний айс-ті',
                    'description' => 'Холодний чорний чай з лимонним соком та легкою солодкістю.',
                ],
            ],
            'metadata' => [
                [
                    'type' => 'storage_instructions',
                    'value' => 'Keep chilled at +2 to +6 C and consume within 12 hours.',
                    'translations' => [
                        'uk' => ['value' => 'Зберігати при +2...+6 C та спожити протягом 12 годин.'],
                    ],
                ],
            ],
            'ingredients' => [
                ['slug' => 'black-tea', 'quantity' => 220.00],
                ['slug' => 'lemon-juice', 'quantity' => 18.00],
                ['slug' => 'honey', 'quantity' => 12.00],
            ],
        ],
        [
            'slug' => 'berry-eclair',
            'name' => 'Berry Eclair',
            'sku' => 'CB-DES-001-OLD',
            'description' => 'Recipe kept for regression and admin state checks.',
            'price' => 82.00,
            'shelf_life' => 20,
            'position' => 50,
            'stock_quantity' => 0,
            'featured_image_url' => null,
            'reorder_level' => 0,
            'is_active' => false,
            'is_available' => false,
            'category_slug' => 'archived-menu',
            'translations' => [
                'uk' => [
                    'name' => 'Архівний ягідний еклер',
                    'description' => 'Архівний рецепт для перевірки станів каталогу та адмінки.',
                ],
            ],
            'metadata' => [],
            'ingredients' => [
                ['slug' => 'wheat-flour', 'quantity' => 55.00],
                ['slug' => 'strawberries', 'quantity' => 16.00],
            ],
        ],
        [
            'slug' => 'chef-special-snack-box',
            'name' => 'Chef Special Snack Box',
            'sku' => 'CB-SPC-900',
            'description' => 'Flexible snack set used to test products without category assignment.',
            'price' => 260.00,
            'shelf_life' => 18,
            'position' => 60,
            'featured_image_url' => null,
            'stock_quantity' => 5,
            'reorder_level' => 3,
            'is_active' => true,
            'is_available' => true,
            'category_slug' => null,
            'translations' => [
                'uk' => [
                    'name' => 'Шефський снек-бокс',
                    'description' => 'Гнучкий набір закусок для тестування товарів без категорії.',
                ],
            ],
            'metadata' => [
                [
                    'type' => 'contents',
                    'value' => 'Composition changes daily based on fresh kitchen prep.',
                    'translations' => [
                        'uk' => ['value' => 'Склад щодня оновлюється залежно від свіжих заготовок.'],
                    ],
                ],
            ],
            'ingredients' => [
                ['slug' => 'honey', 'quantity' => 10.00],
                ['slug' => 'almonds', 'quantity' => 14.00],
            ],
        ],
    ];

    /**
     * @param \App\Services\CatalogTranslationService $catalogTranslationService
     */
    public function __construct(private readonly CatalogTranslationService $catalogTranslationService)
    {
    }

    /**
     * @return void
     */
    public function run(): void
    {
        $this->call(CategorySeeder::class);

        $categoriesBySlug = $this->seedCategories();
        $ingredientsBySlug = $this->seedIngredients();

        $this->seedProducts($categoriesBySlug, $ingredientsBySlug);
    }

    /**
     * @return array<string, \App\Models\Category>
     */
    private function seedCategories(): array
    {
        $categoriesBySlug = [];

        foreach (self::CATEGORIES as $categoryData) {
            $category = Category::updateOrCreate(['slug' => (string)$categoryData['slug']], Arr::except($categoryData, [
                'slug',
                'translations'
            ]));

            $this->syncTranslations($category, $categoryData, 'categories');
            $categoriesBySlug[(string)$categoryData['slug']] = $category;
        }

        return $categoriesBySlug;
    }

    /**
     * @return array<string, \App\Models\Ingredient>
     */
    private function seedIngredients(): array
    {
        $ingredientsBySlug = [];

        foreach (self::INGREDIENTS as $ingredientData) {
            $ingredient = Ingredient::updateOrCreate(
                ['slug' => (string)$ingredientData['slug']],
                Arr::except($ingredientData, ['slug', 'translations'])
            );

            $this->syncTranslations($ingredient, $ingredientData, 'ingredients');
            $ingredientsBySlug[(string)$ingredientData['slug']] = $ingredient;
        }

        return $ingredientsBySlug;
    }

    /**
     * @param array<string, \App\Models\Category> $categoriesBySlug
     * @param array<string, \App\Models\Ingredient> $ingredientsBySlug
     */
    private function seedProducts(array $categoriesBySlug, array $ingredientsBySlug): void
    {
        foreach (self::PRODUCTS as $productData) {
            $categoryId = null;

            if (is_string($productData['category_slug']) && isset($categoriesBySlug[$productData['category_slug']])) {
                $categoryId = $categoriesBySlug[$productData['category_slug']]->id;
            }

            $product = Product::updateOrCreate([
                'slug' => (string)$productData['slug']
            ], array_merge(
                    Arr::except($productData, [
                        'slug',
                        'translations',
                        'metadata',
                        'ingredients',
                        'category_slug'
                    ]),
                    ['category_id' => $categoryId]
                )
            );

            $this->syncTranslations($product, $productData, 'products');
            $this->seedProductMetadata($product, (array)($productData['metadata'] ?? []));
            $this->seedProductIngredients($product, (array)($productData['ingredients'] ?? []), $ingredientsBySlug);
        }
    }

    /**
     * @param array<int, array<string, mixed>> $metadataRows
     */
    private function seedProductMetadata(Product $product, array $metadataRows): void
    {
        $types = [];

        foreach ($metadataRows as $metadataData) {
            $type = (string)($metadataData['type'] ?? '');

            if ($type === '') {
                continue;
            }

            $metadata = ProductMetadata::updateOrCreate(
                [
                    'product_id' => $product->id,
                    'type' => $type,
                ],
                [
                    'value' => (string)($metadataData['value'] ?? ''),
                ]
            );

            $this->syncTranslations($metadata, $metadataData, 'product-metadata');
            $types[] = $type;
        }

        if ($types === []) {
            $product->metadata()->delete();

            return;
        }

        $product->metadata()->whereNotIn('type', $types)->delete();
    }

    /**
     * @param array<int, array<string, mixed>> $ingredientRows
     * @param array<string, \App\Models\Ingredient> $ingredientsBySlug
     */
    private function seedProductIngredients(Product $product, array $ingredientRows, array $ingredientsBySlug): void
    {
        $ingredientIds = [];

        foreach ($ingredientRows as $position => $ingredientData) {
            $slug = (string)($ingredientData['slug'] ?? '');

            if ($slug === '' || !isset($ingredientsBySlug[$slug])) {
                continue;
            }

            $ingredient = $ingredientsBySlug[$slug];

            ProductIngredient::updateOrCreate(
                [
                    'product_id' => $product->id,
                    'ingredient_id' => $ingredient->id,
                ],
                [
                    'quantity' => (float)($ingredientData['quantity'] ?? 0),
                    'position' => $position,
                ]
            );

            $ingredientIds[] = $ingredient->id;
        }

        if ($ingredientIds === []) {
            $product->productIngredients()->delete();

            return;
        }

        $product->productIngredients()->whereNotIn('ingredient_id', $ingredientIds)->delete();
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function syncTranslations(Model $model, array $payload, string $target): void
    {
        $allowedFields = (array)config("catalog.translation_targets.{$target}.fields", []);

        $this->catalogTranslationService->syncForModel($model, (array)($payload['translations'] ?? []), $allowedFields);
    }
}
