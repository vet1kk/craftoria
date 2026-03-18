<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class ProductService
{
    /**
     * @param  string|null  $category
     * @param  string|null  $search
     * @return \Illuminate\Database\Eloquent\Collection<int, \App\Models\Product>
     */
    public function listPublic(?string $category = null, ?string $search = null): Collection
    {
        return Product::query()
            ->publiclyVisible()
            ->with(['category', 'images', 'metadata', 'ingredients'])
            ->when($category !== null && $category !== '', function ($query) use ($category): void {
                $query->where(function ($categoryQuery) use ($category): void {
                    $categoryQuery
                        ->where('category_id', $category)
                        ->orWhereHas('category', static function ($relatedCategoryQuery) use ($category): void {
                            $relatedCategoryQuery->where('slug', $category);
                        });
                });
            })
            ->when($search !== null && $search !== '', function ($query) use ($search): void {
                $query->where(function ($searchQuery) use ($search): void {
                    $searchQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->orderBy('position')
            ->orderBy('name')
            ->get();
    }

    /**
     * @param  string  $slug
     * @return \App\Models\Product
     */
    public function findPublicBySlug(string $slug): Product
    {
        return Product::query()
            ->publiclyVisible()
            ->with(['category', 'images', 'metadata', 'ingredients'])
            ->where('slug', $slug)
            ->firstOrFail();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, \App\Models\Product>
     */
    public function listAll(): Collection
    {
        return Product::query()
            ->with(['category', 'images', 'metadata', 'ingredients'])
            ->orderBy('position')
            ->orderBy('name')
            ->get();
    }

    /**
     * @param  array  $validated
     * @return \App\Models\Product
     *
     * @throws \Throwable
     */
    public function create(array $validated): Product
    {
        return DB::transaction(function () use ($validated): Product {
            $product = Product::query()->create(Arr::except($validated, ['metadata', 'images', 'ingredients']));
            $this->syncRelations($product, $validated);

            return $this->loadDetails($product);
        });
    }

    /**
     * @param  \App\Models\Product  $product
     * @return \App\Models\Product
     */
    public function loadDetails(Product $product): Product
    {
        return $product->load(['category', 'images', 'metadata', 'ingredients']);
    }

    /**
     * @param  \App\Models\Product  $product
     * @param  array  $validated
     * @return \App\Models\Product
     *
     * @throws \Throwable
     */
    public function update(Product $product, array $validated): Product
    {
        return DB::transaction(function () use ($product, $validated): Product {
            $product->update(Arr::except($validated, ['metadata', 'images', 'ingredients']));
            $this->syncRelations($product, $validated);

            return $this->loadDetails($product->refresh());
        });
    }

    /**
     * @param  \App\Models\Product  $product
     * @return void
     */
    public function delete(Product $product): void
    {
        $product->delete();
    }

    /**
     * @param  \App\Models\Product  $product
     * @param  array  $validated
     * @return void
     */
    private function syncRelations(Product $product, array $validated): void
    {
        if (Arr::exists($validated, 'metadata')) {
            $product->metadata()->delete();
            $product->metadata()->createMany(
                collect($validated['metadata'] ?? [])
                    ->map(fn (array $entry): array => [
                        'type' => $entry['type'],
                        'value' => $entry['value'] ?? '',
                    ])
                    ->all()
            );
        }

        if (Arr::exists($validated, 'images')) {
            $product->images()->delete();
            $product->images()->createMany(
                collect($validated['images'] ?? [])
                    ->map(fn (array $entry, int $index): array => [
                        'image_url' => $entry['image_url'],
                        'position' => $entry['position'] ?? $index,
                    ])
                    ->all()
            );
        }

        if (Arr::exists($validated, 'ingredients')) {
            $product->productIngredients()->delete();
            $product->productIngredients()->createMany(
                collect($validated['ingredients'] ?? [])
                    ->map(fn (array $entry, int $index): array => [
                        'ingredient_id' => $entry['ingredient_id'],
                        'quantity' => $entry['quantity'],
                        'position' => $entry['position'] ?? $index,
                    ])
                    ->all()
            );
        }
    }
}
