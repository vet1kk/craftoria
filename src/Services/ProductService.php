<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

class ProductService
{
    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, \App\Models\Product>
     */
    public function index(): Collection
    {
        return Product::with(['category', 'images', 'metadata', 'ingredients'])
                      ->orderBy('position')
                      ->orderBy('name')
                      ->get();
    }

    /**
     * @param string $slug
     * @return \App\Models\Product
     */
    public function showBySlug(string $slug): Product
    {
        return Product::with(['category', 'images', 'metadata', 'ingredients'])
                      ->where('slug', $slug)
                      ->firstOrFail();
    }

    /**
     * @param array<string, mixed> $validated
     * @return \App\Models\Product
     */
    public function store(array $validated): Product
    {
        return Product::create($validated);
    }

    /**
     * @param \App\Models\Product $product
     * @param array<string, mixed> $validated
     * @return \App\Models\Product
     */
    public function update(Product $product, array $validated): Product
    {
        $product->update($validated);

        return $product->refresh();
    }

    /**
     * @param \App\Models\Product $product
     * @return void
     */
    public function delete(Product $product): void
    {
        $product->delete();
    }
}
