<?php

declare(strict_types=1);

namespace App\Traits;

use Illuminate\Support\Facades\Lang;

trait ResolvesTranslatedValue
{
    /**
     * Resolve a lang-file value and fall back to the stored attribute when absent.
     */
    protected function translated(?string $key, ?string $fallback = null): ?string
    {
        if ($key === null || $key === '') {
            return $fallback;
        }

        if (!Lang::has($key) && !Lang::has($key, config('app.fallback_locale'))) {
            return $fallback;
        }

        return (string)__($key);
    }

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

        return $this->translatePayloadForModel($payload, $this->resource);
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
        $translationKey = $this->resolveTranslationKey($payload, $config, $model);
        $prefix = $this->resolveTranslationPrefix($config);

        if ($translationKey !== null && $prefix !== null) {
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
                $translationKeyPath = "{$prefix}.{$translationKey}";

                if ($translationField !== '') {
                    $translationKeyPath .= ".{$translationField}";
                }

                $payload[$field] = $this->translated($translationKeyPath, $fallback);
            }
        }

        return $payload;
    }

    /**
     * @param array<string, mixed> $payload
     * @param array<string, mixed> $config
     */
    private function resolveTranslationKey(array $payload, array $config, ?object $model): ?string
    {
        $keyField = $config['key'] ?? null;

        if (!is_string($keyField) || $keyField === '') {
            return null;
        }

        $fallback = $this->resolvePayloadValue($payload, $keyField)
            ?? $this->resolveModelValue($model, $keyField)
            ?? null;

        if ($fallback === null || $fallback === '') {
            return null;
        }

        if (($config['use_model_lookup'] ?? false) === true && $model !== null && method_exists($model, 'translationLookupKey')) {
            return $model->translationLookupKey($fallback);
        }

        return $fallback;
    }

    /**
     * @param array<string, mixed> $config
     */
    private function resolveTranslationPrefix(array $config): ?string
    {
        $prefix = $config['prefix'] ?? null;

        if (!is_string($prefix) || $prefix === '') {
            return null;
        }

        return $prefix;
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function resolvePayloadValue(array $payload, string $key): ?string
    {
        if (!array_key_exists($key, $payload)) {
            return null;
        }

        return $this->scalarToString($payload[$key]);
    }

    /**
     * @param object|null $model
     * @param string $key
     * @return string|null
     */
    private function resolveModelValue(?object $model, string $key): ?string
    {
        if ($model === null) {
            return null;
        }

        if (method_exists($model, 'getAttribute')) {
            return $this->scalarToString($model->getAttribute($key));
        }

        if (isset($model->{$key})) {
            return $this->scalarToString($model->{$key});
        }

        return null;
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
}
