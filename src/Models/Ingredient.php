<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Builders\IngredientBuilder;
use App\Models\Concerns\HasTranslationConfig;
use App\Models\Concerns\HasTranslationKey;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @method static \App\Models\Builders\IngredientBuilder query()
 * @method static \App\Models\Builders\IngredientBuilder newQuery()
 * @method static \App\Models\Builders\IngredientBuilder newModelQuery()
 * @method static \App\Models\Builders\IngredientBuilder active()
 *
 * @mixin \App\Models\Builders\IngredientBuilder
 *
 * @property string $id
 * @property string $name
 * @property string $slug
 * @property string $unit
 * @property int $calories
 * @property string $proteins
 * @property string $fats
 * @property string $carbs
 * @property string $cost_amount
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ProductIngredient> $product_ingredients
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Product> $products
 * @property-read \App\Models\ProductIngredient|null $pivot
 */
class Ingredient extends Model
{
    use HasFactory;
    use HasTranslationConfig;
    use HasTranslationKey;
    use HasUuids;
    use SoftDeletes;

    protected ?string $translationPrefix = 'catalog.ingredients';

    /**
     * @var array<int, string>
     */
    protected array $translatableFields = ['name'];

    protected $fillable = [
        'name',
        'slug',
        'unit',
        'calories',
        'proteins',
        'fats',
        'carbs',
        'cost_amount',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array
     */
    protected function casts(): array
    {
        return [
            'calories' => 'integer',
            'proteins' => 'decimal:2',
            'fats' => 'decimal:2',
            'carbs' => 'decimal:2',
            'cost_amount' => 'decimal:2',
            'is_active' => 'boolean',
        ];
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
     * Get the related products.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_ingredients')
            ->withPivot(['id', 'quantity', 'position'])
            ->withTimestamps();
    }

    /**
     * Create a new Eloquent query builder for the model.
     *
     * @param \Illuminate\Database\Query\Builder $query
     * @return \App\Models\Builders\IngredientBuilder
     */
    public function newEloquentBuilder($query): IngredientBuilder
    {
        return new IngredientBuilder($query);
    }

    /**
     * Scope the query to active records.
     *
     * @param \App\Models\Builders\IngredientBuilder $query
     * @return void
     */
    public function scopeActive(IngredientBuilder $query): void
    {
        $query->where('is_active', true);
    }
}
