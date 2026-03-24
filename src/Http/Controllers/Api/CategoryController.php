<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Helpers\FileUpload;
use App\Http\Controllers\Controller;
use App\Http\Requests\Category\CategoryUpsertRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class CategoryController extends Controller
{
    /**
     * Return the public category collection.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('view', Category::class);

        $categories = Category::query()
            ->active()
            ->orderBy('position')
            ->orderBy('name')
            ->get();

        return CategoryResource::collection($categories);
    }

    /**
     * Return a single public category by slug.
     *
     * @param string $slug
     * @return \App\Http\Resources\CategoryResource
     */
    public function show(string $slug): CategoryResource
    {
        $category = Category::query()
            ->active()
            ->where('slug', $slug)
            ->firstOrFail();

        return new CategoryResource($category);
    }

    /**
     * Create a category from the validated payload.
     *
     * @param \App\Http\Requests\Category\CategoryUpsertRequest $request
     * @return \App\Http\Resources\CategoryResource
     */
    public function store(CategoryUpsertRequest $request): CategoryResource
    {
        $this->authorize('create', Category::class);

        $data = $request->validated();
        if ($request->hasFile('image')) {
            $data['image_url'] = FileUpload::storePublicImage(
                $request->file('image'),
                'uploads/categories'
            );
        }

        $category = Category::query()->create($data);

        return new CategoryResource($category);
    }

    /**
     * Update a category from the validated payload.
     *
     * @param \App\Http\Requests\Category\CategoryUpsertRequest $request
     * @param \App\Models\Category $category
     * @return \App\Http\Resources\CategoryResource
     */
    public function update(CategoryUpsertRequest $request, Category $category): CategoryResource
    {
        $this->authorize('update', $category);

        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image_url'] = FileUpload::storePublicImage(
                $request->file('image'),
                'uploads/categories'
            );
        }

        $category->update($data);

        return new CategoryResource($category->refresh());
    }

    /**
     * Soft-delete a category.
     *
     * @param \App\Models\Category $category
     * @return \Illuminate\Http\Response
     */
    public function destroy(Category $category): Response
    {
        $this->authorize('delete', $category);

        $category->delete();

        return response()->noContent();
    }
}
