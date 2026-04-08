<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\ProductIngredient\ProductIngredientStoreRequest;
use App\Http\Requests\Product\ProductIngredient\ProductIngredientUpdateRequest;
use App\Http\Resources\ProductIngredientResource;
use App\Models\Product;
use App\Models\ProductIngredient;
use App\Services\ProductIngredientService;

class ProductIngredientController extends Controller
{
    public function __construct(private readonly ProductIngredientService $productIngredientService)
    {
    }

    /**
     * @param \App\Http\Requests\Product\ProductIngredient\ProductIngredientStoreRequest $request
     * @param \App\Models\Product $product
     * @return \App\Http\Resources\ProductIngredientResource
     * @throws \Throwable
     */
    public function store(ProductIngredientStoreRequest $request, Product $product): ProductIngredientResource
    {
        $this->authorize('create', ProductIngredient::class);

        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image');
        }

        $productIngredient = $this->productIngredientService->store($product, $validated);

        return new ProductIngredientResource($productIngredient);
    }

    /**
     * @param \App\Http\Requests\Product\ProductIngredient\ProductIngredientUpdateRequest $request
     * @param \App\Models\ProductIngredient $productIngredient
     * @return \App\Http\Resources\ProductIngredientResource
     * @throws \Throwable
     */
    public function update(ProductIngredientUpdateRequest $request, ProductIngredient $productIngredient): ProductIngredientResource
    {
        $this->authorize('update', $productIngredient);

        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image');
        }

        return new ProductIngredientResource($this->productIngredientService->update($productIngredient, $data));
    }

    /**
     * @param \App\Models\ProductIngredient $productIngredient
     * @return \Illuminate\Http\Response
     * @throws \Throwable
     */
    public function destroy(ProductIngredient $productIngredient): \Illuminate\Http\Response
    {
        $this->authorize('delete', $productIngredient);

        $this->productIngredientService->delete($productIngredient);

        return response()->noContent();
    }
}
