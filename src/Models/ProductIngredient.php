<?php

declare(strict_types=1);

namespace App\Models;

use App\Helpers\FileUpload;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property string $product_id
 * @property string $ingredient_id
 * @property string $quantity
 * @property int $position
 * @property string|null $image_url
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Product $product
 * @property-read \App\Models\Ingredient $ingredient
 */
class ProductIngredient extends Model
{
    use HasFactory;
    use HasUuids;

    protected $fillable = [
        'product_id',
        'ingredient_id',
        'quantity',
        'position',
        'image_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'position' => 'integer',
        ];
    }

    /**
     * Get the owning product.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the owning ingredient.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class);
    }

    /**
     * @return void
     */
    protected static function booted(): void
    {
        static::updated(static function (self $productIngredient): void {
            if (!$productIngredient->wasChanged('image_url')) {
                return;
            }

            FileUpload::deletePublicFile($productIngredient->getOriginal('image_url'));
        });

        static::deleting(static function (self $productIngredient): void {
            FileUpload::deletePublicFile($productIngredient->image_url);
        });
    }
}
