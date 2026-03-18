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
     * @param string|null $category
     * @param string|null $search
     * @return \Illuminate\Database\Eloquent\Collection<int, \App\Models\Product>
     */
    public function listPublic(?string $category = null, ?string $search = null): Collection
    {
        $products = Product::query()
                           ->publiclyVisible()
                           ->with(['category', 'images', 'metadata', 'ingredients'])
                           ->when($category !== null && $category !== '' && strtolower($category) !== 'all', function ($query) use ($category): void {
                               $query->whereHas('category', static function ($categoryQuery) use ($category): void {
                                   $categoryQuery->where('slug', $category);
                               });
                           })
                           ->orderBy('position')
                           ->get();

        if ($search !== null && $search !== '') {
            $products = $products
                ->filter(fn(Product $product): bool => $this->matchesTranslatedSearch($product, $search))
                ->values();
        }

        return $this->sortByPositionAndName($products);
    }

    /**
     * @param string $slug
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
        return $this->sortByPositionAndName(
            Product::query()
                   ->with(['category', 'images', 'metadata', 'ingredients'])
                   ->orderBy('position')
                   ->get()
        );
    }

    /**
     * @param array $validated
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
     * @param \App\Models\Product $product
     * @return \App\Models\Product
     */
    public function loadDetails(Product $product): Product
    {
        return $product->load(['category', 'images', 'metadata', 'ingredients']);
    }

    /**
     * @param \App\Models\Product $product
     * @param array $validated
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
     * @param \App\Models\Product $product
     * @return void
     */
    public function delete(Product $product): void
    {
        $product->delete();
    }

    /**
     * @param \App\Models\Product $product
     * @param array $validated
     * @return void
     */
    private function syncRelations(Product $product, array $validated): void
    {
        if (Arr::exists($validated, 'metadata')) {
            $product->metadata()->delete();
            $product->metadata()->createMany(
                collect($validated['metadata'] ?? [])
                    ->map(fn(array $entry): array => [
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
                    ->map(fn(array $entry, int $index): array => [
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
                    ->map(fn(array $entry, int $index): array => [
                        'ingredient_id' => $entry['ingredient_id'],
                        'quantity' => $entry['quantity'],
                        'position' => $entry['position'] ?? $index,
                    ])
                    ->all()
            );
        }
    }

    /**
     * Check whether a translated product field matches the search term.
     */
    private function matchesTranslatedSearch(Product $product, string $search): bool
    {
        $needle = mb_strtolower(trim($search));

        if ($needle === '') {
            return true;
        }

        return str_contains(mb_strtolower($product->name), $needle)
            || str_contains(mb_strtolower((string)$product->description), $needle)
            || str_contains(mb_strtolower($product->slug), $needle)
            || str_contains(mb_strtolower((string)$product->sku), $needle)
            || str_contains(mb_strtolower((string)optional($product->category)->name), $needle);
    }

    /**
     * Sort products by position first and localized name second.
     *
     * @param \Illuminate\Database\Eloquent\Collection<int, \App\Models\Product> $products
     * @return \Illuminate\Database\Eloquent\Collection<int, \App\Models\Product>
     */
    private function sortByPositionAndName(Collection $products): Collection
    {
        $sorted = $products->sortBy(
            fn(Product $p): string => sprintf('%05d-%s', $p->position, mb_strtolower($p->name))
        );

        return new \Illuminate\Database\Eloquent\Collection($sorted->values());
    }
}
