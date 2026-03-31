<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Product;
use App\Models\ProductMetadata;

class ProductMetadataService
{
    /**
     * @param \App\Models\Product $product
     * @param array<string, mixed> $validated
     * @return \App\Models\ProductMetadata
     */
    public function store(Product $product, array $validated): ProductMetadata
    {
        return $product->metadata()->create($validated);
    }

    /**
     * @param \App\Models\ProductMetadata $metadata
     * @param array<string, mixed> $validated
     * @return \App\Models\ProductMetadata
     */
    public function update(ProductMetadata $metadata, array $validated): ProductMetadata
    {
        $metadata->update($validated);

        return $metadata->refresh();
    }

    /**
     * @param \App\Models\ProductMetadata $productMetadata
     * @return void
     */
    public function delete(ProductMetadata $productMetadata): void
    {
        $productMetadata->delete();
    }
}
