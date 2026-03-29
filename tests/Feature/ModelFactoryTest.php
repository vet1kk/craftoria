<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\AnalyticsEvent;
use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductIngredient;
use App\Models\ProductMetadata;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModelFactoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_ingredient_factory_uses_per_unit_nutrition_and_cost_values(): void
    {
        $ingredient = Ingredient::factory()->create();

        $this->assertGreaterThanOrEqual(0, $ingredient->calories);
        $this->assertLessThanOrEqual(10, $ingredient->calories);
        $this->assertGreaterThanOrEqual(0.0, (float)$ingredient->proteins);
        $this->assertLessThanOrEqual(1.0, (float)$ingredient->proteins);
        $this->assertGreaterThanOrEqual(0.0, (float)$ingredient->fats);
        $this->assertLessThanOrEqual(1.0, (float)$ingredient->fats);
        $this->assertGreaterThanOrEqual(0.0, (float)$ingredient->carbs);
        $this->assertLessThanOrEqual(1.0, (float)$ingredient->carbs);
        $this->assertGreaterThanOrEqual(0.0, (float)$ingredient->cost_amount);
        $this->assertLessThanOrEqual(1.0, (float)$ingredient->cost_amount);
    }

    public function test_it_creates_all_domain_models_with_factories(): void
    {
        $category = Category::factory()->create();
        $ingredient = Ingredient::factory()->create();
        $product = Product::factory()->for($category)->create();
        $metadata = ProductMetadata::factory()->for($product)->create();
        $image = ProductImage::factory()->for($product)->create();
        $productIngredient = ProductIngredient::factory()
            ->for($product)
            ->for($ingredient)
            ->create();
        $order = Order::factory()->create();
        $orderItem = OrderItem::factory()->for($order)->for($product)->create();
        $auditLog = AuditLog::factory()->create();
        $analyticsEvent = AnalyticsEvent::factory()->create();

        $this->assertModelExists($category);
        $this->assertModelExists($ingredient);
        $this->assertModelExists($product);
        $this->assertModelExists($metadata);
        $this->assertModelExists($image);
        $this->assertModelExists($productIngredient);
        $this->assertModelExists($order);
        $this->assertModelExists($orderItem);
        $this->assertModelExists($auditLog);
        $this->assertModelExists($analyticsEvent);
    }
}
