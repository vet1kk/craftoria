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
 * @property string $image_url
 * @property int $position
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Product $product
 */
class ProductImage extends Model
{
    use HasFactory;
    use HasUuids;

    protected $fillable = [
        'product_id',
        'image_url',
        'position',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array
     */
    protected function casts(): array
    {
        return [
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
     * @return void
     */
    protected static function booted(): void
    {
        static::deleting(static function (self $productImage): void {
            FileUpload::deletePublicFile($productImage->image_url);
        });
    }
}
