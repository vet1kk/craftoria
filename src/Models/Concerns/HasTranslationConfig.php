<?php

declare(strict_types=1);

namespace App\Models\Concerns;

trait HasTranslationConfig
{
    /**
     * Fields that are translatable on the model.
     *
     * Example:
     * protected array $translatableFields = ['title', 'description'];
     *
     * @return array<int, string>
     */
    public function translatableFields(): array
    {
        return $this->translatableFields ?? [];
    }
}
