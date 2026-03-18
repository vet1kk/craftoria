<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Builders\ProductBuilder;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @method static \App\Models\Builders\ProductBuilder query()
 * @method static \App\Models\Builders\ProductBuilder newQuery()
 * @method static \App\Models\Builders\ProductBuilder newModelQuery()
 * @method static \App\Models\Builders\ProductBuilder publiclyVisible()
 *
 * @mixin \App\Models\Builders\ProductBuilder
 *
 * @property string $id
 * @property string $category_id
 * @property string $name
 * @property string $slug
 * @property string|null $sku
 * @property string $description
 * @property string $price
 * @property string|null $featured_image_url
 * @property string|null $shelf_life
 * @property int $position
 * @property int $stock_quantity
 * @property int $reorder_level
 * @property bool $is_active
 * @property bool $is_available
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \App\Models\Category $category
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ProductMetadata> $metadata
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ProductImage> $images
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ProductIngredient> $productIngredients
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Ingredient> $ingredients
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\OrderItem> $orderItems
 */
class Product extends Model
{
    use HasFactory;
    use HasUuids;
    use SoftDeletes;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'sku',
        'description',
        'price',
        'featured_image_url',
        'shelf_life',
        'position',
        'stock_quantity',
        'reorder_level',
        'is_active',
        'is_available',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'position' => 'integer',
            'stock_quantity' => 'integer',
            'reorder_level' => 'integer',
            'is_active' => 'boolean',
            'is_available' => 'boolean',
        ];
    }

    /**
     * Get the owning category.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the related metadata records.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function metadata(): HasMany
    {
        return $this->hasMany(ProductMetadata::class)->orderBy('type');
    }

    /**
     * Get the related image records.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('position');
    }

    /**
     * Get the related product ingredient records.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function productIngredients(): HasMany
    {
        return $this->hasMany(ProductIngredient::class)->orderBy('position');
    }

    /**
     * Get the related ingredients.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function ingredients(): BelongsToMany
    {
        return $this->belongsToMany(Ingredient::class, 'product_ingredients')
            ->withPivot(['id', 'quantity', 'position'])
            ->withTimestamps()
            ->orderBy('product_ingredients.position');
    }

    /**
     * Get the related order item records.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Create a new Eloquent query builder for the model.
     *
     * @param  \Illuminate\Database\Query\Builder  $query
     * @return \App\Models\Builders\ProductBuilder
     */
    public function newEloquentBuilder($query): ProductBuilder
    {
        return new ProductBuilder($query);
    }

    /**
     * Scope the query to publicly visible records.
     *
     * @param  \App\Models\Builders\ProductBuilder  $query
     * @return void
     */
    public function scopePubliclyVisible(ProductBuilder $query): void
    {
        $query->where('is_active', true)->where('is_available', true);
    }
}
