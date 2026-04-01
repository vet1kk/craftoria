<?php

declare(strict_types=1);

namespace App\Http\Requests\Concerns;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

trait GeneratesUniqueSlug
{
    /**
     * @param string $table
     * @param string $name
     * @param string|null $ignoreId
     * @return string
     */
    protected function generateUniqueSlug(string $table, string $name, ?string $ignoreId = null): string
    {
        $baseSlug = Str::slug(Str::lower(trim($name)));

        if ($baseSlug === '') {
            return '';
        }

        $slug = $baseSlug;
        $suffix = 1;

        while ($this->slugExists($table, $slug, $ignoreId)) {
            $slug = sprintf('%s-%d', $baseSlug, $suffix);
            $suffix++;
        }

        return $slug;
    }

    /**
     * @param string $table
     * @param string $slug
     * @param string|null $ignoreId
     * @return bool
     */
    private function slugExists(string $table, string $slug, ?string $ignoreId = null): bool
    {
        $query = DB::table($table)
                   ->where('slug', $slug)
                   ->whereNull('deleted_at');

        if ($ignoreId !== null) {
            $query->where('id', '!=', $ignoreId);
        }

        return $query->exists();
    }
}
