<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_dummy_data_for_all_domain_models(): void
    {
        $this->seed();

        $this->assertDatabaseCount('users', 13);
        $this->assertDatabaseCount('categories', 7);
        $this->assertDatabaseCount('ingredients', 24);
        $this->assertDatabaseCount('orders', 18);

        $this->assertDatabaseCount('products', 30);
        $this->assertGreaterThan(0, \App\Models\ProductMetadata::query()->count());
        $this->assertGreaterThan(0, \App\Models\ProductImage::query()->count());
        $this->assertGreaterThan(0, \App\Models\ProductIngredient::query()->count());
        $this->assertGreaterThan(0, \App\Models\OrderItem::query()->count());
        $this->assertGreaterThan(0, \App\Models\AnalyticsEvent::query()->count());
        $this->assertGreaterThan(0, \App\Models\AuditLog::query()->count());
    }
}
