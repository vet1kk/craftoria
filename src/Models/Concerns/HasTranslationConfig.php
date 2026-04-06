<?php

declare(strict_types=1);

namespace App\Models\Concerns;

trait HasTranslationConfig
{
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

    /**¬
     * Resolve the full translation config for the model resource payload.
     *
     * @return array<string, mixed>
     */
    public function translationConfig(): array
    {
        return [
            'fields' => $this->translatableFields(),
            'field_map' => $this->translationFieldMap(),
        ];
    }
}
