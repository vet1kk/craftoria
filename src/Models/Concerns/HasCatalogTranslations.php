<?php

declare(strict_types=1);

namespace App\Models\Concerns;

use App\Models\CatalogTranslation;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasCatalogTranslations
{
    /**
     * Automatically eager-load translations on base model queries.
     */
    public static function bootHasCatalogTranslations(): void
    {
        static::addGlobalScope('catalog_translations', static function (Builder $query): void {
            $query->with('translations');
        });
    }

    /**
     * Scope query with translations relation.
     */
    public function scopeWithTranslations(Builder $query): Builder
    {
        return $query->with('translations');
    }

    /**
     * Scope query without default translations eager-loading.
     */
    public function scopeWithoutTranslations(Builder $query): Builder
    {
        return $query->withoutGlobalScope('catalog_translations')->without('translations');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\MorphMany
     */
    public function translations(): MorphMany
    {
        return $this->morphMany(CatalogTranslation::class, 'translatable');
    }

    /**
     * @param string $field
     * @param string|null $locale
     * @return string|null
     */
    public function translatedValue(string $field, ?string $locale = null): ?string
    {
        $targetLocale = $locale ?? app()->getLocale();

        if ($this->relationLoaded('translations')) {
            $match = $this->translations->first(static function (CatalogTranslation $translation) use ($field, $targetLocale): bool {
                return $translation->field === $field && $translation->locale === $targetLocale;
            });

            if ($match !== null) {
                return $match->value;
            }
        }

        return $this->translations()
                    ->where('field', $field)
                    ->where('locale', $targetLocale)
                    ->value('value');
    }

    /**
     * @param array<int, string> $fields
     * @return array<string, array<string, string>>
     */
    public function translationsForFields(array $fields): array
    {
        $rows = $this->relationLoaded('translations') ? $this->translations : $this->translations()->get();

        $result = [];

        foreach ($rows as $translation) {
            if (!in_array($translation->field, $fields, true)) {
                continue;
            }

            $result[$translation->locale] ??= [];
            $result[$translation->locale][$translation->field] = $translation->value;
        }

        return $result;
    }
}
