<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Translations\ModelTranslationUpsertRequest;
use App\Services\CatalogTranslationService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;

class TranslationController extends Controller
{
    /**
     * @param \App\Services\CatalogTranslationService $catalogTranslationService
     */
    public function __construct(private readonly CatalogTranslationService $catalogTranslationService)
    {
    }

    /**
     * Save translations for any configured translatable model.
     *
     * @param \App\Http\Requests\Translations\ModelTranslationUpsertRequest $request
     * @param string $type
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function upsert(ModelTranslationUpsertRequest $request, string $type, string $id): JsonResponse
    {
        $targetConfig = (array)config("catalog.translation_targets.$type", []);
        $modelClass = (string)($targetConfig['model'] ?? '');
        $allowedFields = (array)($targetConfig['fields'] ?? []);

        if (!class_exists($modelClass) || !is_a($modelClass, Model::class, true)) {
            throw new HttpResponseException(response()->json(['message' => 'Unsupported translation target.'], 422));
        }

        /** @var \Illuminate\Database\Eloquent\Model $model */
        $model = $modelClass::query()->findOrFail($id);

        $this->authorize('update', $model);

        $this->catalogTranslationService->upsertLocaleFields(
            $model,
            (string)$request->validated('locale'),
            (array)$request->validated('fields', []),
            $allowedFields
        );

        return response()->json([
            'data' => [
                'type' => $type,
                'id' => $model->getKey(),
            ],
        ]);
    }
}
