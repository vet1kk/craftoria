<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IngredientUpsertRequest;
use App\Http\Resources\IngredientResource;
use App\Models\Ingredient;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class IngredientController extends Controller
{
    /**
     * Return the full admin ingredient collection.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Ingredient::class);

        return IngredientResource::collection(
            Ingredient::query()
                ->get()
                ->sortBy(fn (Ingredient $ingredient): string => mb_strtolower($ingredient->name))
                ->values()
        );
    }

    /**
     * Create an ingredient from the validated admin payload.
     *
     * @param  \App\Http\Requests\IngredientUpsertRequest  $request
     * @return \App\Http\Resources\IngredientResource
     */
    public function store(IngredientUpsertRequest $request): IngredientResource
    {
        $this->authorize('create', Ingredient::class);

        $ingredient = Ingredient::query()->create($request->validated());

        return new IngredientResource($ingredient);
    }

    /**
     * Return a single ingredient for the admin area.
     *
     * @param  \App\Models\Ingredient  $ingredient
     * @return \App\Http\Resources\IngredientResource
     */
    public function show(Ingredient $ingredient): IngredientResource
    {
        $this->authorize('view', $ingredient);

        return new IngredientResource($ingredient);
    }

    /**
     * Update an ingredient from the validated admin payload.
     *
     * @param  \App\Http\Requests\IngredientUpsertRequest  $request
     * @param  \App\Models\Ingredient  $ingredient
     * @return \App\Http\Resources\IngredientResource
     */
    public function update(IngredientUpsertRequest $request, Ingredient $ingredient): IngredientResource
    {
        $this->authorize('update', $ingredient);

        $ingredient->update($request->validated());

        return new IngredientResource($ingredient->refresh());
    }

    /**
     * Soft-delete an ingredient from the admin area.
     *
     * @param  \App\Models\Ingredient  $ingredient
     * @return \Illuminate\Http\Response
     */
    public function destroy(Ingredient $ingredient): Response
    {
        $this->authorize('delete', $ingredient);

        $ingredient->delete();

        return response()->noContent();
    }
}
