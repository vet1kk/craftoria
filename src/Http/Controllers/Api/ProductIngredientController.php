<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Helpers\FileUpload;
use App\Http\Controllers\Controller;
use App\Http\Requests\Product\ProductIngredient\ProductIngredientStoreRequest;
use App\Http\Requests\Product\ProductIngredient\ProductIngredientUpdateRequest;
use App\Http\Resources\ProductIngredientResource;
use App\Models\ProductIngredient;

class ProductIngredientController extends Controller
{
    /**
     * @param \App\Http\Requests\Product\ProductIngredient\ProductIngredientStoreRequest $request
     * @return \App\Http\Resources\ProductIngredientResource
     */
    public function store(ProductIngredientStoreRequest $request): ProductIngredientResource
    {
        $this->authorize('create', ProductIngredient::class);

        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $validated['image_url'] = FileUpload::storePublicImage(
                $request->file('image'),
                'uploads/products/ingredients'
            );
        }
        $productIngredient = ProductIngredient::create($validated);

        return new ProductIngredientResource($productIngredient);
    }

    /**
     * @param \App\Http\Requests\Product\ProductIngredient\ProductIngredientUpdateRequest $request
     * @param \App\Models\ProductIngredient $productIngredient
     * @return \App\Http\Resources\ProductIngredientResource
     */
    public function update(ProductIngredientUpdateRequest $request, ProductIngredient $productIngredient): ProductIngredientResource
    {
        $this->authorize('update', $productIngredient);

        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image_url'] = FileUpload::storePublicImage(
                $request->file('image'),
                'uploads/products/ingredients'
            );
        }

        $productIngredient->update($data);

        return new ProductIngredientResource($productIngredient->refresh());
    }

    /**
     * @param \App\Models\ProductIngredient $productIngredient
     * @return \Illuminate\Http\Response
     */
    public function destroy(ProductIngredient $productIngredient): \Illuminate\Http\Response
    {
        $this->authorize('delete', $productIngredient);

        $productIngredient->delete();

        return response()->noContent();
    }
}