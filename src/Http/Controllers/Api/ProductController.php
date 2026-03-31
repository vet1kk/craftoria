<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\ProductStoreRequest;
use App\Http\Requests\Product\ProductUpdateRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ProductController extends Controller
{
    public function __construct(private readonly ProductService $productService)
    {
    }

    /**
     * Return the public product collection.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(): AnonymousResourceCollection
    {
        $products = $this->productService->index();

        return ProductResource::collection($products);
    }

    /**
     * Return a single public product by slug.
     *
     * @param string $slug
     * @return \App\Http\Resources\ProductResource
     */
    public function show(string $slug): ProductResource
    {
        $product = $this->productService->showBySlug($slug);

        return new ProductResource($product);
    }

    /**
     * Create a product from the validated payload.
     *
     * @param \App\Http\Requests\Product\ProductStoreRequest $request
     * @return \App\Http\Resources\ProductResource
     *
     * @throws \Throwable
     */
    public function store(ProductStoreRequest $request): ProductResource
    {
        $this->authorize('create', Product::class);

        $data = $request->validated();

        if ($request->hasFile('featured_image')) {
            $data['featured_image'] = $request->file('featured_image');
        }

        return new ProductResource($this->productService->store($data));
    }

    /**
     * Update a product from the validated payload.
     *
     * @param \App\Http\Requests\Product\ProductUpdateRequest $request
     * @param \App\Models\Product $product
     * @return \App\Http\Resources\ProductResource
     *
     * @throws \Throwable
     */
    public function update(ProductUpdateRequest $request, Product $product): ProductResource
    {
        $this->authorize('update', $product);

        $data = $request->validated();

        if ($request->hasFile('featured_image')) {
            $data['featured_image'] = $request->file('featured_image');
        }

        $updatedProduct = $this->productService->update($product, $data);

        return $this->show($updatedProduct->slug);
    }

    /**
     * Soft-delete a product.
     *
     * @param \App\Models\Product $product
     * @return \Illuminate\Http\Response
     */
    public function destroy(Product $product): Response
    {
        $this->authorize('delete', $product);

        $this->productService->delete($product);

        return response()->noContent();
    }
}
