<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Ingredient;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductSubResourceTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_manage_product_metadata(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $product = Product::factory()->create();
        $this->actingAs($admin);

        $res = $this->postJson("/api/products/{$product->id}/metadata", [
            'type' => 'color',
            'value' => 'red',
        ])->assertStatus(201);

        $this->assertDatabaseHas('product_metadata', [
            'product_id' => $product->id,
            'type' => 'color',
            'value' => 'red',
        ]);

        $metaId = $res->json('data.id');

        $this->putJson("/api/products/{$product->id}/metadata/{$metaId}", [
            'value' => 'blue',
        ])->assertOk();

        $this->deleteJson("/api/products/{$product->id}/metadata/{$metaId}")
             ->assertNoContent();
    }

    public function test_non_admin_cannot_manage_product_metadata(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        $product = Product::factory()->create();
        $this->actingAs($client);

        $this->postJson("/api/products/{$product->id}/metadata", [
            'type' => 'color',
            'value' => 'red',
        ])->assertStatus(403);
    }

    public function test_admin_can_attach_ingredient_to_product(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $product = Product::factory()->create();
        $ingredient = Ingredient::factory()->create();

        $this->actingAs($admin)->postJson("/api/products/{$product->id}/ingredients", [
            'product_id' => $product->id,
            'ingredient_id' => $ingredient->id,
            'quantity' => 50,
        ])->assertStatus(201);

        $this->assertDatabaseHas('product_ingredients', [
            'product_id' => $product->id,
            'ingredient_id' => $ingredient->id,
            'quantity' => 50,
        ]);
    }
}
