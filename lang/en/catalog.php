<?php

declare(strict_types=1);

return [
    'categories' => [
        'all' => [
            'name' => 'All',
        ],
        'burgers' => [
            'name' => 'Burgers',
        ],
        'pizzas' => [
            'name' => 'Pizzas',
        ],
        'salads' => [
            'name' => 'Salads',
        ],
        'desserts' => [
            'name' => 'Desserts',
        ],
        'drinks' => [
            'name' => 'Drinks',
        ],
        'breakfasts' => [
            'name' => 'Breakfasts',
        ],
    ],
    'ingredients' => [
        'beef' => ['name' => 'Beef'],
        'beef-patty' => ['name' => 'Beef Patty'],
        'chicken-fillet' => ['name' => 'Chicken Fillet'],
        'brioche-bun' => ['name' => 'Brioche Bun'],
        'cheddar' => ['name' => 'Cheddar'],
        'mozzarella' => ['name' => 'Mozzarella'],
        'romaine-lettuce' => ['name' => 'Romaine Lettuce'],
        'tomato' => ['name' => 'Tomato'],
        'cucumber' => ['name' => 'Cucumber'],
        'bacon' => ['name' => 'Bacon'],
        'egg' => ['name' => 'Egg'],
        'avocado' => ['name' => 'Avocado'],
        'mushroom' => ['name' => 'Mushroom'],
        'caramelized-onion' => ['name' => 'Caramelized Onion'],
        'pickled-cucumber' => ['name' => 'Pickled Cucumber'],
        'fries' => ['name' => 'Fries'],
        'garlic-sauce' => ['name' => 'Garlic Sauce'],
        'caesar-dressing' => ['name' => 'Caesar Dressing'],
        'brownie-crumb' => ['name' => 'Brownie Crumb'],
        'vanilla-cream' => ['name' => 'Vanilla Cream'],
        'espresso-shot' => ['name' => 'Espresso Shot'],
        'oat-milk' => ['name' => 'Oat Milk'],
        'orange-juice' => ['name' => 'Orange Juice'],
        'spinach' => ['name' => 'Spinach'],
        'smoked-salmon' => ['name' => 'Smoked Salmon'],
    ],
    'products' => [
        'classic-burger' => [
            'name' => 'Classic Burger',
            'description' => 'A solid burger.',
            'metadata' => [
                'serving_details' => 'Served warm.',
                'storage_instructions' => 'Keep refrigerated and consume within 24 hours after opening.',
                'allergen_note' => 'Contains gluten and dairy.',
                'preparation_tip' => 'Warm briefly before serving for the best texture.',
            ],
        ],
        'double-cheese-burger' => [
            'name' => 'Double Cheese Burger',
            'description' => 'Two beef patties with double cheddar and caramelized onions.',
            'metadata' => [
                'serving_details' => 'Best served warm.',
                'storage_instructions' => 'Keep refrigerated and consume within 24 hours after opening.',
                'allergen_note' => 'Contains gluten, dairy, and egg.',
                'preparation_tip' => 'Warm briefly before serving for the best texture.',
            ],
        ],
        'bbq-bacon-burger' => [
            'name' => 'BBQ Bacon Burger',
            'description' => 'Smoky barbecue glaze, crispy bacon, and cheddar in every bite.',
            'metadata' => [
                'serving_details' => 'Best served warm.',
                'storage_instructions' => 'Keep refrigerated and consume within 24 hours after opening.',
                'allergen_note' => 'Contains gluten, dairy, and egg.',
                'preparation_tip' => 'Warm briefly before serving for the best texture.',
            ],
        ],
        'mushroom-swiss-burger' => [
            'name' => 'Mushroom Swiss Burger',
            'description' => 'Sauteed mushrooms, creamy cheese, and garlic aioli.',
            'metadata' => [
                'serving_details' => 'Best served warm.',
                'storage_instructions' => 'Keep refrigerated and consume within 24 hours after opening.',
                'allergen_note' => 'Contains gluten, dairy, and egg.',
                'preparation_tip' => 'Warm briefly before serving for the best texture.',
            ],
        ],
        'crispy-chicken-burger' => [
            'name' => 'Crispy Chicken Burger',
            'description' => 'Crunchy chicken fillet with lettuce, tomato, and garlic sauce.',
            'metadata' => [
                'serving_details' => 'Best served warm.',
                'storage_instructions' => 'Keep refrigerated and consume within 24 hours after opening.',
                'allergen_note' => 'Contains gluten, dairy, and egg.',
                'preparation_tip' => 'Warm briefly before serving for the best texture.',
            ],
        ],
        'margherita-pizza' => [
            'name' => 'Margherita Pizza',
            'description' => 'Classic pizza with tomato sauce, mozzarella, and basil notes.',
            'metadata' => [
                'serving_details' => 'Serve hot from the oven.',
                'storage_instructions' => 'Keep refrigerated and reheat once.',
                'allergen_note' => 'Contains gluten and dairy.',
                'preparation_tip' => 'Reheat on a dry pan to keep the crust crisp.',
            ],
        ],
        'pepperoni-pizza' => [
            'name' => 'Pepperoni Pizza',
            'description' => 'Thin crust pizza loaded with pepperoni and mozzarella.',
            'metadata' => [
                'serving_details' => 'Serve hot from the oven.',
                'storage_instructions' => 'Keep refrigerated and reheat once.',
                'allergen_note' => 'Contains gluten and dairy.',
                'preparation_tip' => 'Reheat on a dry pan to keep the crust crisp.',
            ],
        ],
        'bbq-chicken-pizza' => [
            'name' => 'BBQ Chicken Pizza',
            'description' => 'Grilled chicken, barbecue sauce, red onion, and mozzarella.',
            'metadata' => [
                'serving_details' => 'Serve hot from the oven.',
                'storage_instructions' => 'Keep refrigerated and reheat once.',
                'allergen_note' => 'Contains gluten and dairy.',
                'preparation_tip' => 'Reheat on a dry pan to keep the crust crisp.',
            ],
        ],
        'quattro-formaggi-pizza' => [
            'name' => 'Quattro Formaggi Pizza',
            'description' => 'A rich blend of four cheeses on a crisp golden crust.',
            'metadata' => [
                'serving_details' => 'Serve hot from the oven.',
                'storage_instructions' => 'Keep refrigerated and reheat once.',
                'allergen_note' => 'Contains gluten and dairy.',
                'preparation_tip' => 'Reheat on a dry pan to keep the crust crisp.',
            ],
        ],
        'veggie-pizza' => [
            'name' => 'Veggie Pizza',
            'description' => 'Colorful vegetables, mushrooms, and mozzarella on tomato sauce.',
            'metadata' => [
                'serving_details' => 'Serve hot from the oven.',
                'storage_instructions' => 'Keep refrigerated and reheat once.',
                'allergen_note' => 'Contains gluten and dairy.',
                'preparation_tip' => 'Reheat on a dry pan to keep the crust crisp.',
            ],
        ],
        'caesar-salad' => [
            'name' => 'Caesar Salad',
            'description' => 'Romaine, chicken, parmesan, and creamy Caesar dressing.',
            'metadata' => [
                'serving_details' => 'Serve chilled.',
                'storage_instructions' => 'Keep refrigerated and consume the same day.',
                'allergen_note' => 'Contains dairy, egg, and fish.',
                'preparation_tip' => 'Add dressing right before serving.',
            ],
        ],
        'greek-salad' => [
            'name' => 'Greek Salad',
            'description' => 'Tomato, cucumber, olives, and feta with olive oil.',
            'metadata' => [
                'serving_details' => 'Serve chilled.',
                'storage_instructions' => 'Keep refrigerated and consume the same day.',
                'allergen_note' => 'Contains dairy.',
                'preparation_tip' => 'Add dressing right before serving.',
            ],
        ],
        'avocado-chicken-salad' => [
            'name' => 'Avocado Chicken Salad',
            'description' => 'Grilled chicken, avocado, greens, and citrus dressing.',
            'metadata' => [
                'serving_details' => 'Serve chilled.',
                'storage_instructions' => 'Keep refrigerated and consume the same day.',
                'allergen_note' => 'Contains dairy.',
                'preparation_tip' => 'Add dressing right before serving.',
            ],
        ],
        'quinoa-bowl' => [
            'name' => 'Quinoa Bowl',
            'description' => 'Warm quinoa, spinach, vegetables, and a bright herb dressing.',
            'metadata' => [
                'serving_details' => 'Serve slightly warm.',
                'storage_instructions' => 'Keep refrigerated and consume the same day.',
                'allergen_note' => 'May contain sesame.',
                'preparation_tip' => 'Stir before serving for balanced flavor.',
            ],
        ],
        'salmon-spinach-salad' => [
            'name' => 'Salmon Spinach Salad',
            'description' => 'Smoked salmon, spinach, cucumber, and lemon yogurt sauce.',
            'metadata' => [
                'serving_details' => 'Serve chilled.',
                'storage_instructions' => 'Keep refrigerated and consume the same day.',
                'allergen_note' => 'Contains fish and dairy.',
                'preparation_tip' => 'Add dressing right before serving.',
            ],
        ],
        'chocolate-brownie' => [
            'name' => 'Chocolate Brownie',
            'description' => 'Dense chocolate brownie with a glossy cocoa finish.',
            'metadata' => [
                'serving_details' => 'Serve at room temperature.',
                'storage_instructions' => 'Store in a cool place.',
                'allergen_note' => 'Contains gluten, dairy, and egg.',
                'preparation_tip' => 'Pair with vanilla cream for extra richness.',
            ],
        ],
        'new-york-cheesecake' => [
            'name' => 'New York Cheesecake',
            'description' => 'Creamy baked cheesecake with a buttery biscuit base.',
            'metadata' => [
                'serving_details' => 'Serve chilled.',
                'storage_instructions' => 'Keep refrigerated.',
                'allergen_note' => 'Contains gluten, dairy, and egg.',
                'preparation_tip' => 'Let it rest for a few minutes before serving.',
            ],
        ],
        'tiramisu-cup' => [
            'name' => 'Tiramisu Cup',
            'description' => 'Espresso-soaked layers with mascarpone cream and cocoa.',
            'metadata' => [
                'serving_details' => 'Serve chilled.',
                'storage_instructions' => 'Keep refrigerated.',
                'allergen_note' => 'Contains dairy, egg, and gluten.',
                'preparation_tip' => 'Dust with cocoa just before serving.',
            ],
        ],
        'berry-panna-cotta' => [
            'name' => 'Berry Panna Cotta',
            'description' => 'Silky vanilla panna cotta with a bright berry topping.',
            'metadata' => [
                'serving_details' => 'Serve chilled.',
                'storage_instructions' => 'Keep refrigerated.',
                'allergen_note' => 'Contains dairy.',
                'preparation_tip' => 'Serve straight from the fridge.',
            ],
        ],
        'cinnamon-roll' => [
            'name' => 'Cinnamon Roll',
            'description' => 'Soft sweet roll with cinnamon sugar and cream glaze.',
            'metadata' => [
                'serving_details' => 'Serve slightly warm.',
                'storage_instructions' => 'Store in a cool dry place.',
                'allergen_note' => 'Contains gluten, dairy, and egg.',
                'preparation_tip' => 'Warm for 15 seconds before serving.',
            ],
        ],
        'flat-white' => [
            'name' => 'Flat White',
            'description' => 'Velvety espresso drink with finely textured milk.',
            'metadata' => [
                'serving_details' => 'Serve hot.',
                'storage_instructions' => 'Consume immediately.',
                'allergen_note' => 'Contains dairy.',
                'preparation_tip' => 'Enjoy without stirring to keep the texture silky.',
            ],
        ],
        'cappuccino' => [
            'name' => 'Cappuccino',
            'description' => 'Balanced espresso, steamed milk, and airy foam.',
            'metadata' => [
                'serving_details' => 'Serve hot.',
                'storage_instructions' => 'Consume immediately.',
                'allergen_note' => 'Contains dairy.',
                'preparation_tip' => 'Sprinkle cocoa on top before serving.',
            ],
        ],
        'iced-latte' => [
            'name' => 'Iced Latte',
            'description' => 'Chilled espresso and milk served over ice.',
            'metadata' => [
                'serving_details' => 'Serve cold.',
                'storage_instructions' => 'Consume immediately.',
                'allergen_note' => 'Contains dairy.',
                'preparation_tip' => 'Stir before drinking for even flavor.',
            ],
        ],
        'fresh-orange-juice' => [
            'name' => 'Fresh Orange Juice',
            'description' => 'Freshly squeezed orange juice with natural sweetness.',
            'metadata' => [
                'serving_details' => 'Serve chilled.',
                'storage_instructions' => 'Keep refrigerated and consume the same day.',
                'allergen_note' => 'Prepared in a kitchen that handles celery.',
                'preparation_tip' => 'Shake gently before serving.',
            ],
        ],
        'berry-lemonade' => [
            'name' => 'Berry Lemonade',
            'description' => 'Refreshing lemonade infused with mixed berry puree.',
            'metadata' => [
                'serving_details' => 'Serve cold.',
                'storage_instructions' => 'Keep refrigerated and consume the same day.',
                'allergen_note' => 'Prepared in a kitchen that handles berries.',
                'preparation_tip' => 'Stir before serving to blend the puree.',
            ],
        ],
        'avocado-toast' => [
            'name' => 'Avocado Toast',
            'description' => 'Toasted sourdough with avocado, herbs, and lemon zest.',
            'metadata' => [
                'serving_details' => 'Serve immediately after plating.',
                'storage_instructions' => 'Keep refrigerated and consume the same day.',
                'allergen_note' => 'Contains gluten.',
                'preparation_tip' => 'Add a soft egg for a richer breakfast.',
            ],
        ],
        'shakshuka' => [
            'name' => 'Shakshuka',
            'description' => 'Eggs baked in a fragrant tomato and pepper sauce.',
            'metadata' => [
                'serving_details' => 'Serve hot.',
                'storage_instructions' => 'Keep refrigerated and reheat once.',
                'allergen_note' => 'Contains egg.',
                'preparation_tip' => 'Serve with toasted bread on the side.',
            ],
        ],
        'salmon-bagel' => [
            'name' => 'Salmon Bagel',
            'description' => 'Toasted bagel with smoked salmon, cream cheese, and cucumber.',
            'metadata' => [
                'serving_details' => 'Serve chilled or lightly warmed.',
                'storage_instructions' => 'Keep refrigerated and consume the same day.',
                'allergen_note' => 'Contains gluten, dairy, and fish.',
                'preparation_tip' => 'Slice just before serving for best texture.',
            ],
        ],
        'granola-yogurt-bowl' => [
            'name' => 'Granola Yogurt Bowl',
            'description' => 'Greek yogurt, berry compote, and crunchy granola.',
            'metadata' => [
                'serving_details' => 'Serve chilled.',
                'storage_instructions' => 'Keep refrigerated.',
                'allergen_note' => 'Contains dairy and gluten.',
                'preparation_tip' => 'Top with extra berries right before serving.',
            ],
        ],
        'cheese-omelette' => [
            'name' => 'Cheese Omelette',
            'description' => 'Fluffy omelette folded with melted cheese and herbs.',
            'metadata' => [
                'serving_details' => 'Serve hot.',
                'storage_instructions' => 'Keep refrigerated and reheat once.',
                'allergen_note' => 'Contains dairy and egg.',
                'preparation_tip' => 'Finish with herbs just before serving.',
            ],
        ],
    ],
];
