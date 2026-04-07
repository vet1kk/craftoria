<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Database\Eloquent\Model;

class CatalogTranslationService
{
    /**
     * @param array<string, string|null> $fields
     * @param array<int, string> $allowedFields
     */
    public function upsertLocaleFields(Model $model, string $locale, array $fields, array $allowedFields): void
    {
        if ($locale === '' || !method_exists($model, 'translations') || $locale === config('app.fallback_locale')) {
            return;
        }

        foreach ($fields as $field => $value) {
            if (!in_array($field, $allowedFields, true)) {
                continue;
            }

            $normalized = trim((string)($value ?? ''));

            if ($normalized === '') {
                $model->translations()
                      ->where('locale', $locale)
                      ->where('field', $field)
                      ->delete();

                continue;
            }

            $model->translations()->updateOrCreate(
                [
                    'locale' => $locale,
                    'field' => $field,
                ],
                [
                    'value' => $normalized,
                ]
            );
        }
    }

    /**
     * @param array<string, array<string, string|null>> $translations
     * @param array<int, string> $allowedFields
     */
    public function syncForModel(Model $model, array $translations, array $allowedFields): void
    {
        if (!method_exists($model, 'translations')) {
            return;
        }

        foreach ($translations as $locale => $fields) {
            if (!is_array($fields) || $locale === '' || $locale === config('app.fallback_locale')) {
                continue;
            }

            foreach ($fields as $field => $value) {
                $this->upsertLocaleFields($model, $locale, [$field => $value], $allowedFields);
            }
        }
    }
}
