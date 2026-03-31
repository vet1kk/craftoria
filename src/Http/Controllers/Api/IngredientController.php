<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ingredient\IngredientUpsertRequest;
use App\Http\Resources\IngredientResource;
use App\Models\Ingredient;
use App\Services\IngredientService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class IngredientController extends Controller
{
    public function __construct(private readonly IngredientService $ingredientService)
    {
    }

    /**
     * Return the full admin ingredient collection.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Ingredient::class);

        $ingredients = $this->ingredientService->index();

        return IngredientResource::collection($ingredients);
    }

    /**
     * Create an ingredient from the validated admin payload.
     *
     * @param \App\Http\Requests\Ingredient\IngredientUpsertRequest $request
     * @return \App\Http\Resources\IngredientResource
     */
    public function store(IngredientUpsertRequest $request): IngredientResource
    {
        $this->authorize('create', Ingredient::class);

        $ingredient = $this->ingredientService->store($request->validated());

        return new IngredientResource($ingredient);
    }

    /**
     * @param \App\Models\Ingredient $ingredient
     * @return \App\Http\Resources\IngredientResource
     */
    public function show(Ingredient $ingredient): IngredientResource
    {
        $this->authorize('view', $ingredient);

        return new IngredientResource($ingredient);
    }

    /**
     * @param \App\Http\Requests\Ingredient\IngredientUpsertRequest $request
     * @param \App\Models\Ingredient $ingredient
     * @return \App\Http\Resources\IngredientResource
     */
    public function update(IngredientUpsertRequest $request, Ingredient $ingredient): IngredientResource
    {
        $this->authorize('update', $ingredient);

        return new IngredientResource($this->ingredientService->update($ingredient, $request->validated()));
    }

    /**
     * Soft-delete an ingredient from the admin area.
     *
     * @param \App\Models\Ingredient $ingredient
     * @return \Illuminate\Http\Response
     */
    public function destroy(Ingredient $ingredient): Response
    {
        $this->authorize('delete', $ingredient);

        $this->ingredientService->delete($ingredient);

        return response()->noContent();
    }
}
