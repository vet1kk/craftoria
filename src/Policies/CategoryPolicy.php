<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    /**
     * Determine whether the user can view the resource list.
     *
     * @param  ?\App\Models\User  $user
     * @return bool
     */
    public function viewAny(?User $user): bool
    {
        return $user?->isAdmin() ?? false;
    }

    /**
     * Determine whether the user can view the resource.
     *
     * @param  ?\App\Models\User  $user
     * @param  \App\Models\Category  $category
     * @return bool
     */
    public function view(?User $user, Category $category): bool
    {
        return ($user?->isAdmin() ?? false) || $category->is_active;
    }

    /**
     * Determine whether the user can create the resource.
     *
     * @param  \App\Models\User  $user
     * @return bool
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Handle the incoming update request.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Category  $category
     * @return bool
     */
    public function update(User $user, Category $category): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the resource.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Category  $category
     * @return bool
     */
    public function delete(User $user, Category $category): bool
    {
        return $user->isAdmin();
    }
}
