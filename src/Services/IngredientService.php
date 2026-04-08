<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Ingredient;
use Illuminate\Database\Eloquent\Collection;

class IngredientService
{
    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, \App\Models\Ingredient>
     */
    public function index(): Collection
    {
        return Ingredient::orderBy('name')
                         ->get();
    }

    /**
     * @param array<string, mixed> $validated
     * @return \App\Models\Ingredient
     */
    public function store(array $validated): Ingredient
    {
        return Ingredient::create($validated);
    }

    /**
     * @param \App\Models\Ingredient $ingredient
     * @param array<string, mixed> $validated
     * @return \App\Models\Ingredient
     */
    public function update(Ingredient $ingredient, array $validated): Ingredient
    {
        $ingredient->update($validated);

        return $ingredient->refresh();
    }

    /**
     * @param \App\Models\Ingredient $ingredient
     * @return void
     */
    public function delete(Ingredient $ingredient): void
    {
        $ingredient->delete();
    }
}
