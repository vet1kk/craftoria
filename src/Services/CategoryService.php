<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

class CategoryService
{
    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, \App\Models\Product>
     */
    public function options(): Collection
    {
        return Product::select(['id', 'name', 'category_id'])
                      ->whereNull('deleted_at')
                      ->orderBy('name')
                      ->get();
    }

    /**
     * @param array<string, mixed> $validated
     * @return \App\Models\Category
     * @throws \Throwable
     */
    public function store(array $validated): Category
    {
        return Category::create($validated)->fresh();
    }

    /**
     * @param \App\Models\Category $category
     * @param array<string, mixed> $validated
     * @return \App\Models\Category
     * @throws \Throwable
     */
    public function update(Category $category, array $validated): Category
    {
        $category->update($validated);

        return $category->fresh();
    }

    /**
     * @param \App\Models\Category $category
     * @param array<int, string> $productIds
     * @return \App\Models\Category
     */
    public function assignProducts(Category $category, array $productIds): Category
    {
        $ids = array_values($productIds);

        if ($ids) {
            Product::whereIn('id', $ids)
                   ->update(['category_id' => $category->id]);
        }

        return $category->fresh();
    }

    /**
     * @param \App\Models\Category $category
     * @return void
     */
    public function delete(Category $category): void
    {
        $category->delete();
    }
}
