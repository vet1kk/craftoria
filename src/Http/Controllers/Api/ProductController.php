<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductUpsertRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ProductController extends Controller
{
    /**
     * @param  \App\Services\ProductService  $productService
     * @return void
     */
    public function __construct(
        private readonly ProductService $productService,
    ) {}

    /**
     * Return the public product collection.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $products = $this->productService->listPublic(
            $request->filled('category') ? (string) $request->string('category') : null,
            $request->filled('search') ? trim((string) $request->string('search')) : null,
        );

        return ProductResource::collection($products);
    }

    /**
     * Return a single public product by slug.
     *
     * @param  string  $slug
     * @return \App\Http\Resources\ProductResource
     */
    public function show(string $slug): ProductResource
    {
        $product = $this->productService->findPublicBySlug($slug);

        return new ProductResource($product);
    }

    /**
     * Create a product from the validated payload.
     * Optional payload sections:
     *
     * @param  \App\Http\Requests\ProductUpsertRequest  $request
     * @return \App\Http\Resources\ProductResource
     *
     * @throws \Throwable
     */
    public function store(ProductUpsertRequest $request): ProductResource
    {
        $this->authorize('create', Product::class);

        $product = $this->productService->create($request->validated());

        return new ProductResource($product);
    }

    /**
     * Update a product from the validated payload.
     * Optional payload sections:
     *
     * @param  \App\Http\Requests\ProductUpsertRequest  $request
     * @param  \App\Models\Product  $product
     * @return \App\Http\Resources\ProductResource
     *
     * @throws \Throwable
     */
    public function update(ProductUpsertRequest $request, Product $product): ProductResource
    {
        $this->authorize('update', $product);

        $product = $this->productService->update($product, $request->validated());

        return new ProductResource($product);
    }

    /**
     * Soft-delete a product.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\Response
     */
    public function destroy(Product $product): Response
    {
        $this->authorize('delete', $product);

        $this->productService->delete($product);

        return response()->noContent();
    }
}
