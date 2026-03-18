<?php

declare(strict_types=1);

namespace App\Models\Builders;

/**
 * @extends \Illuminate\Database\Eloquent\Builder<\App\Models\Category>
 */
class CategoryBuilder extends \Illuminate\Database\Eloquent\Builder
{
    /**
     * Limit the query to active categories.
     *
     * @return static
     */
    public function active(): static
    {
        return $this->where('is_active', true);
    }
}
