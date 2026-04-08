<?php

declare(strict_types=1);

namespace App\Traits;

trait ResolvesTranslatedValue
{
    /**
     * Apply model-driven translations to a serialized resource payload.
     *
     * @param array<string, mixed> $payload
     * @return array<string, mixed>
     */
    protected function translateResource(array $payload): array
    {
        $model = $this->resource;

        if (!$this->isTranslatable($model)) {
            return $payload;
        }

        $fields = $model->translatableFields();

        if ($fields === []) {
            return $payload;
        }

        if (!isset($payload['translations']) && method_exists($model, 'translationsForFields')) {
            $filtered = array_intersect_key($payload, array_flip($fields));

            $payload['translations'] = $model->translationsForFields($filtered);
        }

        return $this->applyTranslations($payload, $model, $fields);
    }

    /**
     * Apply DB translations over payload fallback values.
     *
     * @param array<string, mixed> $payload
     * @param object $model
     * @param array<int, string> $fields
     * @return array<string, mixed>
     */
    private function applyTranslations(array $payload, object $model, array $fields): array
    {
        if (!method_exists($model, 'translatedValue')) {
            return $payload;
        }

        foreach ($fields as $field) {
            if (!array_key_exists($field, $payload)) {
                continue;
            }

            $fallback = $this->scalarToString($payload[$field]);
            if ($fallback === null) {
                continue;
            }

            $value = $model->translatedValue($field);
            $payload[$field] = $value !== null && $value !== '' ? $value : $fallback;
        }

        return $payload;
    }

    /**
     * @param mixed $model
     * @return bool
     */
    private function isTranslatable(mixed $model): bool
    {
        return is_object($model)
            && method_exists($model, 'translatableFields')
            && method_exists($model, 'translatedValue');
    }

    /**
     * @param mixed $value
     * @return string|null
     */
    private function scalarToString(mixed $value): ?string
    {
        return is_scalar($value) ? (is_bool($value) ? ($value ? '1' : '0') : (string)$value) : null;
    }
}