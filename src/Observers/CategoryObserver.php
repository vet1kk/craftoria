<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\Category;

class CategoryObserver
{
    /**
     * @param \App\Models\Category $category
     * @return void
     */
    public function updated(Category $category): void
    {
        if (!$category->wasChanged('is_active')) {
            return;
        }

        $category->products()->update(['is_active' => $category->is_active]);
    }
}
