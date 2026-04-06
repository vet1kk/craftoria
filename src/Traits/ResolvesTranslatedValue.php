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
        if (!is_object($this->resource) || !method_exists($this->resource, 'translationConfig')) {
            return $payload;
        }

        $translatedPayload = $this->translatePayloadForModel($payload, $this->resource);

        if (array_key_exists('translations', $translatedPayload) || !method_exists($this->resource, 'translationsForFields')) {
            return $translatedPayload;
        }

        /** @var array<string, mixed> $config */
        $config = $this->resource->translationConfig();
        $fields = $this->resolveTranslationFields($config);

        if ($fields === []) {
            return $translatedPayload;
        }

        $translatedPayload['translations'] = $this->resource->translationsForFields($fields);

        return $translatedPayload;
    }

    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>
     */
    protected function translatePayloadForModel(array $payload, object $model): array
    {
        if (!method_exists($model, 'translationConfig')) {
            return $payload;
        }

        /** @var array<string, mixed> $config */
        $config = $model->translationConfig();
        if (!method_exists($model, 'translatedValue')) {
            return $payload;
        }

        /** @var array<string, string> $fieldMap */
        $fieldMap = is_array($config['field_map'] ?? null) ? $config['field_map'] : [];

        foreach ($config['fields'] ?? [] as $field) {
            if (!is_string($field) || !array_key_exists($field, $payload)) {
                continue;
            }

            $fallback = $this->scalarToString($payload[$field]);

            if ($fallback === null) {
                continue;
            }

            $translationField = $fieldMap[$field] ?? $field;
            $dbField = $translationField !== '' ? $translationField : $field;
            $dbValue = $model->translatedValue($dbField);

            // Keep default DB value when a locale-specific override does not exist.
            $payload[$field] = (is_string($dbValue) && $dbValue !== '') ? $dbValue : $fallback;
        }

        return $payload;
    }


    /**
     * @param mixed $value
     * @return string|null
     */
    private function scalarToString(mixed $value): ?string
    {
        if ($value === null || is_array($value) || is_object($value)) {
            return null;
        }

        if (is_bool($value)) {
            return $value ? '1' : '0';
        }

        return (string)$value;
    }

    /**
     * @param array<string, mixed> $config
     * @return array<int, string>
     */
    private function resolveTranslationFields(array $config): array
    {
        /** @var array<string, string> $fieldMap */
        $fieldMap = is_array($config['field_map'] ?? null) ? $config['field_map'] : [];
        $fields = [];

        foreach ($config['fields'] ?? [] as $field) {
            if (!is_string($field) || $field === '') {
                continue;
            }

            $mappedField = $fieldMap[$field] ?? $field;
            $fields[] = $mappedField !== '' ? $mappedField : $field;
        }

        return array_values(array_unique($fields));
    }
}
