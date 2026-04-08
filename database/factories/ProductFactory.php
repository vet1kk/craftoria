<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Database\Factories\Concerns\BuildsInlineImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    use BuildsInlineImage;

    /**
     * @var array<int, array{name:string, slug:string, description:string, price:float, shelfLife:int|null}>
     */
    private const array PROFILES = [
        [
            'name' => 'Classic Burger',
            'slug' => 'classic-burger',
            'description' => 'Juicy beef, cheddar, pickles, and house sauce on a brioche bun.',
            'price' => 249.00,
            'shelf_life' => 48,
        ],
        [
            'name' => 'Double Cheese Burger',
            'slug' => 'double-cheese-burger',
            'description' => 'Two beef patties with double cheddar and caramelized onions.',
            'price' => 319.00,
            'shelf_life' => 48,
        ],
        [
            'name' => 'BBQ Bacon Burger',
            'slug' => 'bbq-bacon-burger',
            'description' => 'Smoky barbecue glaze, crispy bacon, and cheddar in every bite.',
            'price' => 329.00,
            'shelf_life' => 48,
        ],
        [
            'name' => 'Mushroom Swiss Burger',
            'slug' => 'mushroom-swiss-burger',
            'description' => 'Sauteed mushrooms, creamy cheese, and garlic aioli.',
            'price' => 309.00,
            'shelf_life' => 48,
        ],
        [
            'name' => 'Crispy Chicken Burger',
            'slug' => 'crispy-chicken-burger',
            'description' => 'Crunchy chicken fillet with lettuce, tomato, and garlic sauce.',
            'price' => 279.00,
            'shelf_life' => 48,
        ],
        [
            'name' => 'Margherita Pizza',
            'slug' => 'margherita-pizza',
            'description' => 'Classic pizza with tomato sauce, mozzarella, and basil notes.',
            'price' => 289.00,
            'shelf_life' => 24,
        ],
        [
            'name' => 'Pepperoni Pizza',
            'slug' => 'pepperoni-pizza',
            'description' => 'Thin crust pizza loaded with pepperoni and mozzarella.',
            'price' => 329.00,
            'shelf_life' => 24,
        ],
        [
            'name' => 'BBQ Chicken Pizza',
            'slug' => 'bbq-chicken-pizza',
            'description' => 'Grilled chicken, barbecue sauce, red onion, and mozzarella.',
            'price' => 339.00,
            'shelf_life' => 24,
        ],
        [
            'name' => 'Quattro Formaggi Pizza',
            'slug' => 'quattro-formaggi-pizza',
            'description' => 'A rich blend of four cheeses on a crisp golden crust.',
            'price' => 349.00,
            'shelf_life' => 24,
        ],
        [
            'name' => 'Veggie Pizza',
            'slug' => 'veggie-pizza',
            'description' => 'Colorful vegetables, mushrooms, and mozzarella on tomato sauce.',
            'price' => 299.00,
            'shelf_life' => 24,
        ],
        [
            'name' => 'Caesar Salad',
            'slug' => 'caesar-salad',
            'description' => 'Romaine, chicken, parmesan, and creamy Caesar dressing.',
            'price' => 229.00,
            'shelf_life' => 24,
        ],
        [
            'name' => 'Greek Salad',
            'slug' => 'greek-salad',
            'description' => 'Tomato, cucumber, olives, and feta with olive oil.',
            'price' => 219.00,
            'shelf_life' => 24,
        ],
        [
            'name' => 'Avocado Chicken Salad',
            'slug' => 'avocado-chicken-salad',
            'description' => 'Grilled chicken, avocado, greens, and citrus dressing.',
            'price' => 259.00,
            'shelf_life' => 24,
        ],
        [
            'name' => 'Quinoa Bowl',
            'slug' => 'quinoa-bowl',
            'description' => 'Warm quinoa, spinach, vegetables, and a bright herb dressing.',
            'price' => 239.00,
            'shelf_life' => 24,
        ],
        [
            'name' => 'Salmon Spinach Salad',
            'slug' => 'salmon-spinach-salad',
            'description' => 'Smoked salmon, spinach, cucumber, and lemon yogurt sauce.',
            'price' => 289.00,
            'shelf_life' => 24,
        ],
        [
            'name' => 'Chocolate Brownie',
            'slug' => 'chocolate-brownie',
            'description' => 'Dense chocolate brownie with a glossy cocoa finish.',
            'price' => 159.00,
            'shelf_life' => 72,
        ],
        [
            'name' => 'New York Cheesecake',
            'slug' => 'new-york-cheesecake',
            'description' => 'Creamy baked cheesecake with a buttery biscuit base.',
            'price' => 179.00,
            'shelf_life' => 72,
        ],
        [
            'name' => 'Tiramisu Cup',
            'slug' => 'tiramisu-cup',
            'description' => 'Espresso-soaked layers with mascarpone cream and cocoa.',
            'price' => 169.00,
            'shelf_life' => 48,
        ],
        [
            'name' => 'Berry Panna Cotta',
            'slug' => 'berry-panna-cotta',
            'description' => 'Silky vanilla panna cotta with a bright berry topping.',
            'price' => 165.00,
            'shelf_life' => 48,
        ],
        [
            'name' => 'Cinnamon Roll',
            'slug' => 'cinnamon-roll',
            'description' => 'Soft sweet roll with cinnamon sugar and cream glaze.',
            'price' => 149.00,
            'shelf_life' => 48,
        ],
        [
            'name' => 'Flat White',
            'slug' => 'flat-white',
            'description' => 'Velvety espresso drink with finely textured milk.',
            'price' => 119.00,
            'shelf_life' => null,
        ],
        [
            'name' => 'Cappuccino',
            'slug' => 'cappuccino',
            'description' => 'Balanced espresso, steamed milk, and airy foam.',
            'price' => 119.00,
            'shelf_life' => null,
        ],
        [
            'name' => 'Iced Latte',
            'slug' => 'iced-latte',
            'description' => 'Chilled espresso and milk served over ice.',
            'price' => 129.00,
            'shelf_life' => null,
        ],
        [
            'name' => 'Fresh Orange Juice',
            'slug' => 'fresh-orange-juice',
            'description' => 'Freshly squeezed orange juice with natural sweetness.',
            'price' => 139.00,
            'shelf_life' => null,
        ],
        [
            'name' => 'Berry Lemonade',
            'slug' => 'berry-lemonade',
            'description' => 'Refreshing lemonade infused with mixed berry puree.',
            'price' => 135.00,
            'shelf_life' => null,
        ],
        [
            'name' => 'Avocado Toast',
            'slug' => 'avocado-toast',
            'description' => 'Toasted sourdough with avocado, herbs, and lemon zest.',
            'price' => 199.00,
            'shelf_life' => '24 hours',
        ],
        [
            'name' => 'Shakshuka',
            'slug' => 'shakshuka',
            'description' => 'Eggs baked in a fragrant tomato and pepper sauce.',
            'price' => 229.00,
            'shelf_life' => '24 hours',
        ],
        [
            'name' => 'Salmon Bagel',
            'slug' => 'salmon-bagel',
            'description' => 'Toasted bagel with smoked salmon, cream cheese, and cucumber.',
            'price' => 259.00,
            'shelf_life' => '24 hours',
        ],
        [
            'name' => 'Granola Yogurt Bowl',
            'slug' => 'granola-yogurt-bowl',
            'description' => 'Greek yogurt, berry compote, and crunchy granola.',
            'price' => 189.00,
            'shelf_life' => '24 hours',
        ],
        [
            'name' => 'Cheese Omelette',
            'slug' => 'cheese-omelette',
            'description' => 'Fluffy omelette folded with melted cheese and herbs.',
            'price' => 179.00,
            'shelf_life' => '24 hours',
        ],
    ];

    private static int $sequence = 0;

    protected $model = Product::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $index = self::$sequence++;
        $profile = $this->profile($index);

        return [
            'category_id' => Category::factory(),
            'name' => $profile['name'],
            'slug' => $profile['slug'],
            'sku' => 'SKU-' . str_pad((string)($index + 1), 5, '0', STR_PAD_LEFT),
            'description' => $profile['description'],
            'price' => $profile['price'],
            'featured_image_url' => $this->inlineImage($profile['name'], 900, 600),
            'shelf_life' => $profile['shelf_life'],
            'position' => fake()->numberBetween(0, 50),
            'stock_quantity' => fake()->numberBetween(0, 250),
            'reorder_level' => fake()->numberBetween(0, 50),
            'is_active' => true,
            'is_available' => true,
        ];
    }

    /**
     * @return array{name:string, slug:string, description:string, price:float, shelfLife:int|null}
     */
    private function profile(int $index): array
    {
        $profile = self::PROFILES[$index % count(self::PROFILES)];
        $cycle = intdiv($index, count(self::PROFILES));

        if ($cycle === 0) {
            return $profile;
        }

        return [
            ...$profile,
            'name' => $profile['name'] . ' ' . ($cycle + 1),
            'slug' => $profile['slug'] . '-' . $cycle,
            'description' => $profile['description'] . ' Batch ' . ($cycle + 1) . '.',
        ];
    }
}
