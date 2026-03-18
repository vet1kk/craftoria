<?php

declare(strict_types=1);

namespace App\Models\Concerns;

trait HasTranslationConfig
{
    /**
     * Resolve the translation prefix used for lang-file lookups.
     */
    public function translationPrefix(): ?string
    {
        return property_exists($this, 'translationPrefix') ? $this->translationPrefix : null;
    }

    /**
     * Resolve the attribute used to derive the translation lookup key.
     */
    public function translationKeyField(): string
    {
        return property_exists($this, 'translationKeyField') ? $this->translationKeyField : 'slug';
    }

    /**
     * Resolve the translated fields for the serialized resource payload.
     *
     * @return array<int, string>
     */
    public function translatableFields(): array
    {
        return property_exists($this, 'translatableFields') ? $this->translatableFields : [];
    }

    /**
     * Resolve translation field-path overrides for serialized resource fields.
     *
     * @return array<string, string>
     */
    public function translationFieldMap(): array
    {
        return property_exists($this, 'translationFieldMap') ? $this->translationFieldMap : [];
    }

    /**
     * Resolve the full translation config for the model resource payload.
     *
     * @return array<string, mixed>
     */
    public function translationConfig(): array
    {
        return [
            'prefix' => $this->translationPrefix(),
            'key' => $this->translationKeyField(),
            'fields' => $this->translatableFields(),
            'field_map' => $this->translationFieldMap(),
            'use_model_lookup' => true,
        ];
    }
}
