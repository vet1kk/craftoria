<?php

declare(strict_types=1);

namespace App\Models\Builders;

/**
 * @extends \Illuminate\Database\Eloquent\Builder<\App\Models\Product>
 */
class ProductBuilder extends \Illuminate\Database\Eloquent\Builder
{
    /**
     * Limit the query to publicly visible products.
     *
     * @return static
     */
    public function publiclyVisible(): static
    {
        return $this->where('is_active', true)->where('is_available', true);
    }
}
