<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Product;
use App\Models\ProductIngredient;

class ProductIngredientService
{
    /**
     * @param \App\Models\Product $product
     * @param array<string, mixed> $validated
     * @return \App\Models\ProductIngredient
     * @throws \Throwable
     */
    public function store(Product $product, array $validated): ProductIngredient
    {
        $payload = [
            'product_id' => $product->id,
            'ingredient_id' => $validated['ingredient_id'],
            'quantity' => $validated['quantity'],
            'position' => $validated['position'] ?? 0,
        ];

        if (array_key_exists('image', $validated)) {
            $payload['image'] = $validated['image'];
        }

        return ProductIngredient::create($payload);
    }

    /**
     * @param \App\Models\ProductIngredient $productIngredient
     * @param array<string, mixed> $validated
     * @return \App\Models\ProductIngredient
     */
    public function update(ProductIngredient $productIngredient, array $validated): ProductIngredient
    {
        $productIngredient->update($validated);

        return $productIngredient->refresh();
    }

    /**
     * @param \App\Models\ProductIngredient $productIngredient
     * @return void
     */
    public function delete(ProductIngredient $productIngredient): void
    {
        $productIngredient->delete();
    }
}
