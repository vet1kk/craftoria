<?php

declare(strict_types=1);

namespace App\Models\Concerns;

use App\Models\CatalogTranslation;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasCatalogTranslations
{
    /**
     * Cached translations index:
     * [locale][field] => value
     */
    private ?array $translationsIndex = null;

    /**
     * Automatically eager-load translations on base model queries.
     *
     * @return void
     */
    public static function bootHasCatalogTranslations(): void
    {
        static::addGlobalScope('catalog_translations', static function (Builder $query): void {
            $query->with('translations');
        });
    }

    /**
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithTranslations(Builder $query): Builder
    {
        return $query->with('translations');
    }

    /**
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithoutTranslations(Builder $query): Builder
    {
        return $query->withoutGlobalScope('catalog_translations')
                     ->without('translations');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphMany
     */
    public function translations(): MorphMany
    {
        return $this->morphMany(CatalogTranslation::class, 'translatable');
    }

    /**
     * @return array<string, array<string, string>>
     */
    private function getTranslationsIndex(): array
    {
        if ($this->translationsIndex !== null) {
            return $this->translationsIndex;
        }

        /** @var \Illuminate\Database\Eloquent\Collection<int, \App\Models\CatalogTranslation> $rows */
        $rows = $this->relationLoaded('translations') ? $this->translations : $this->translations()->get();

        $index = [];

        foreach ($rows as $translation) {
            $index[$translation->locale][$translation->field] = $translation->value;
        }

        return $this->translationsIndex = $index;
    }

    /**
     * @param string $field
     * @param string|null $locale
     * @return string|null
     */
    public function translatedValue(string $field, ?string $locale = null): ?string
    {
        $locale = $locale ?? app()->getLocale();

        $index = $this->getTranslationsIndex();

        return $index[$locale][$field] ?? null;
    }

    /**
     * Get translations grouped by locale for given fields.
     *
     * @param array<string, string> $fields [field => fallback value]
     * @return array<string, array<string, string>>
     */
    public function translationsForFields(array $fields): array
    {
        $index = $this->getTranslationsIndex();
        $result = [];

        foreach ($index as $locale => $translations) {
            foreach ($fields as $field => $fallback) {
                if (isset($translations[$field])) {
                    $result[$locale][$field] = $translations[$field];
                }
            }
        }

        $fallbackLocale = config('app.fallback_locale');

        foreach ($fields as $field => $fallback) {
            if (!isset($result[$fallbackLocale][$field])) {
                $result[$fallbackLocale][$field] = $fallback;
            }
        }

        return $result;
    }
}
