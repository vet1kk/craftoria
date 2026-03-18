<?php

declare(strict_types=1);

namespace App\Models\Concerns;

trait HasTranslationKey
{
    protected ?string $translationKey = null;

    /**
     * Resolve the model-level translation key override.
     */
    public function translationKey(): ?string
    {
        return $this->translationKey;
    }

    /**
     * Resolve the translation key used for lang-file lookups.
     */
    public function translationLookupKey(string $fallback): string
    {
        return $this->translationKey() ?: $fallback;
    }
}
