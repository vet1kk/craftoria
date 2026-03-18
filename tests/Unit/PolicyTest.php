<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Policies\CategoryPolicy;
use App\Policies\IngredientPolicy;
use App\Policies\OrderPolicy;
use App\Policies\ProductPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_category_policy_rules(): void
    {
        $policy = new CategoryPolicy;
        $admin = User::factory()->make(['role' => 'admin']);
        $client = User::factory()->make(['role' => 'client']);
        $activeCategory = Category::factory()->make(['is_active' => true]);
        $inactiveCategory = Category::factory()->make(['is_active' => false]);

        $this->assertTrue($policy->viewAny($admin));
        $this->assertFalse($policy->viewAny($client));
        $this->assertTrue($policy->view(null, $activeCategory));
        $this->assertFalse($policy->view(null, $inactiveCategory));
        $this->assertTrue($policy->create($admin));
        $this->assertFalse($policy->create($client));
        $this->assertTrue($policy->update($admin, $activeCategory));
        $this->assertFalse($policy->delete($client, $activeCategory));
    }

    public function test_ingredient_policy_rules(): void
    {
        $policy = new IngredientPolicy;
        $admin = User::factory()->make(['role' => 'admin']);
        $client = User::factory()->make(['role' => 'client']);
        $ingredient = Ingredient::factory()->make();

        $this->assertTrue($policy->viewAny($admin));
        $this->assertFalse($policy->viewAny($client));
        $this->assertFalse($policy->view(null, $ingredient));
        $this->assertTrue($policy->view($admin, $ingredient));
        $this->assertFalse($policy->create($client));
        $this->assertTrue($policy->update($admin, $ingredient));
        $this->assertFalse($policy->delete($client, $ingredient));
    }

    public function test_product_policy_rules(): void
    {
        $policy = new ProductPolicy;
        $admin = User::factory()->make(['role' => 'admin']);
        $client = User::factory()->make(['role' => 'client']);
        $publicProduct = Product::factory()->make(['is_active' => true, 'is_available' => true]);
        $hiddenProduct = Product::factory()->make(['is_active' => false, 'is_available' => true]);

        $this->assertTrue($policy->viewAny($admin));
        $this->assertFalse($policy->viewAny($client));
        $this->assertTrue($policy->view(null, $publicProduct));
        $this->assertFalse($policy->view(null, $hiddenProduct));
        $this->assertTrue($policy->create($admin));
        $this->assertFalse($policy->create($client));
        $this->assertTrue($policy->update($admin, $publicProduct));
        $this->assertFalse($policy->delete($client, $publicProduct));
    }

    public function test_order_policy_rules(): void
    {
        $policy = new OrderPolicy;
        $admin = User::factory()->make(['role' => 'admin']);
        $client = User::factory()->make(['role' => 'client', 'id' => '11111111-1111-1111-1111-111111111111']);
        $otherClient = User::factory()->make(['role' => 'client', 'id' => '22222222-2222-2222-2222-222222222222']);
        $ownOrder = Order::factory()->make(['user_id' => $client->getKey()]);
        $otherOrder = Order::factory()->make(['user_id' => $otherClient->getKey()]);

        $this->assertTrue($policy->viewAny($admin));
        $this->assertFalse($policy->viewAny($client));
        $this->assertTrue($policy->view($admin, $ownOrder));
        $this->assertTrue($policy->view($client, $ownOrder));
        $this->assertFalse($policy->view($client, $otherOrder));
        $this->assertTrue($policy->create(null));
        $this->assertFalse($policy->update($client, $ownOrder));
        $this->assertTrue($policy->delete($admin, $ownOrder));
    }

    public function test_user_policy_rules(): void
    {
        $policy = new UserPolicy;
        $admin = User::factory()->make(['role' => 'admin']);
        $user = User::factory()->make(['id' => '11111111-1111-1111-1111-111111111111']);
        $sameUser = User::factory()->make(['id' => '11111111-1111-1111-1111-111111111111']);
        $otherUser = User::factory()->make(['id' => '22222222-2222-2222-2222-222222222222']);

        $this->assertTrue($policy->view($admin, $otherUser));
        $this->assertTrue($policy->view($user, $sameUser));
        $this->assertFalse($policy->view($user, $otherUser));
        $this->assertTrue($policy->update($admin, $otherUser));
        $this->assertTrue($policy->update($user, $sameUser));
        $this->assertFalse($policy->update($user, $otherUser));
    }
}
