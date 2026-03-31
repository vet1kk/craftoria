<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\CategoryProductsAssignRequest;
use App\Http\Requests\Category\CategoryUpsertRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class CategoryController extends Controller
{
    public function __construct(private readonly CategoryService $categoryService)
    {
    }

    /**
     * Return product options for category admin forms.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function options(): JsonResponse
    {
        $this->authorize('viewAny', Category::class);

        $options = $this->categoryService->options();

        return response()->json(['data' => $options]);
    }

    /**
     * Return the public category collection.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(): AnonymousResourceCollection
    {
        $categories = Category::active()
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
        $category = Category::active()
                            ->where('slug', $slug)
                            ->firstOrFail();

        return new CategoryResource($category);
    }

    /**
     * Create a category from the validated payload.
     *
     * @param \App\Http\Requests\Category\CategoryUpsertRequest $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \Throwable
     */
    public function store(CategoryUpsertRequest $request): JsonResponse
    {
        $this->authorize('create', Category::class);

        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image');
        }

        $category = $this->categoryService->store($data);

        return (new CategoryResource($category))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Assign products to category in a dedicated request.
     *
     * @param \App\Http\Requests\Category\CategoryProductsAssignRequest $request
     * @param \App\Models\Category $category
     * @return \App\Http\Resources\CategoryResource
     * @throws \Throwable
     */
    public function assignProducts(CategoryProductsAssignRequest $request, Category $category): CategoryResource
    {
        $this->authorize('update', $category);

        $updatedCategory = $this->categoryService->assignProducts(
            $category,
            $request->validated('product_ids', [])
        );

        return new CategoryResource($updatedCategory);
    }

    /**
     * Update a category from the validated payload.
     *
     * @param \App\Http\Requests\Category\CategoryUpsertRequest $request
     * @param \App\Models\Category $category
     * @return \App\Http\Resources\CategoryResource
     * @throws \Throwable
     */
    public function update(CategoryUpsertRequest $request, Category $category): CategoryResource
    {
        $this->authorize('update', $category);

        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image');
        }

        $updatedCategory = $this->categoryService->update($category, $data);

        return new CategoryResource($updatedCategory);
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

        $this->categoryService->delete($category);

        return response()->noContent();
    }
}
