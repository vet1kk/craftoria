<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductImageUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_upload_product_featured_image(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);
        $category = Category::factory()->create();

        $image = UploadedFile::fake()->image('cake.jpg');

        $response = $this->actingAs($admin)->postJson('/api/products', [
            'category_id' => $category->id,
            'name' => 'Uploaded Cake',
            'description' => 'A delicious cake.',
            'slug' => 'uploaded-cake',
            'sku' => 'UPL-001',
            'price' => 500,
            'featured_image' => $image,
            'is_active' => true,
        ]);

        $response->assertCreated();

        $product = Product::where('slug', 'uploaded-cake')->first();
        $this->assertNotNull($product->featured_image_url);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $product->featured_image_url));
    }

    public function test_client_cannot_upload_product_featured_image(): void
    {
        $client = User::factory()->create(['role' => 'client']);
        $category = Category::factory()->create();
        $image = UploadedFile::fake()->image('cake.jpg');
        $response = $this->actingAs($client)->postJson('/api/products', [
            'category_id' => $category->id,
            'name' => 'Uploaded Cake',
            'description' => 'A delicious cake.',
            'slug' => 'uploaded-cake',
            'sku' => 'UPL-001',
            'price' => 500,
            'featured_image' => $image,
            'is_active' => true,
        ]);
        $response->assertForbidden();
    }

    public function test_admin_can_update_product_featured_image_and_cleans_up_old_file(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);
        $category = Category::factory()->create();

        $image1 = UploadedFile::fake()->image('first.png');
        $this->actingAs($admin)->postJson('/api/products', [
            'name' => 'Cake',
            'slug' => 'cake',
            'description' => 'A delicious cake.',
            'category_id' => $category->id,
            'price' => 100,
            'featured_image' => $image1,
        ])->assertCreated();

        $product = Product::where('slug', 'cake')->first();
        $oldPath = str_replace('/storage/', '', $product->featured_image_url);
        Storage::disk('public')->assertExists($oldPath);

        $image2 = UploadedFile::fake()->image('second.png');
        $response = $this->actingAs($admin)->putJson("/api/products/{$product->id}", [
            'name' => 'Cake Updated',
            'category_id' => $category->id,
            'price' => 100,
            'featured_image' => $image2,
        ]);

        $response->assertOk();
        $product->refresh();

        $newPath = str_replace('/storage/', '', $product->featured_image_url);

        Storage::disk('public')->assertExists($newPath);
        Storage::disk('public')->assertMissing($oldPath);
    }
}
