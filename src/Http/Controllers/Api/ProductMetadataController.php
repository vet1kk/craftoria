<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\ProductMetadata\ProductMetadataStoreRequest;
use App\Http\Requests\Product\ProductMetadata\ProductMetadataUpdateRequest;
use App\Http\Resources\ProductMetadataResource;
use App\Models\Product;
use App\Models\ProductMetadata;
use App\Services\ProductMetadataService;

class ProductMetadataController extends Controller
{
    public function __construct(
        private readonly ProductMetadataService $productMetadataService,
    )
    {
    }

    /**
     * @param \App\Http\Requests\Product\ProductMetadata\ProductMetadataStoreRequest $request
     * @param \App\Models\Product $product
     * @return \App\Http\Resources\ProductMetadataResource
     */
    public function store(ProductMetadataStoreRequest $request, Product $product): ProductMetadataResource
    {
        $this->authorize('create', $product);

        $metadata = $this->productMetadataService->store($product, $request->validated());

        return new ProductMetadataResource($metadata);
    }

    /**
     * @param \App\Http\Requests\Product\ProductMetadata\ProductMetadataUpdateRequest $request
     * @param \App\Models\Product $product
     * @param \App\Models\ProductMetadata $metadata
     * @return \App\Http\Resources\ProductMetadataResource
     */
    public function update(ProductMetadataUpdateRequest $request, Product $product, ProductMetadata $metadata): ProductMetadataResource
    {
        $this->authorize('update', $product);

        return new ProductMetadataResource($this->productMetadataService->update($metadata, $request->validated()));
    }

    /**
     * @param \App\Models\Product $product
     * @param \App\Models\ProductMetadata $productMetadata
     * @return \Illuminate\Http\Response
     */
    public function destroy(Product $product, ProductMetadata $productMetadata): \Illuminate\Http\Response
    {
        $this->authorize('delete', $productMetadata);

        $this->productMetadataService->delete($productMetadata);

        return response()->noContent();
    }
}
