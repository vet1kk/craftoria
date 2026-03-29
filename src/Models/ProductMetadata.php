<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasTranslationConfig;
use App\Models\Concerns\HasTranslationKey;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property string $product_id
 * @property string $type
 * @property string $value
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Product $product
 */
class ProductMetadata extends Model
{
    use HasFactory;
    use HasTranslationConfig;
    use HasTranslationKey;
    use HasUuids;

    protected string $translationKeyField = 'type';

    /**
     * @var array<int, string>
     */
    protected array $translatableFields = ['value'];

    /**
     * @var array<string, string>
     */
    protected array $translationFieldMap = ['value' => ''];

    protected $table = 'product_metadata';

    protected $fillable = [
        'product_id',
        'type',
        'value',
    ];

    /**
     * Resolve the translation prefix used for lang-file lookups.
     */
    public function translationPrefix(): ?string
    {
        $product = $this->relationLoaded('product') ? $this->product : $this->product()->first();

        if ($product === null) {
            return null;
        }

        $translationKey = $product->translationLookupKey($product->slug);

        return "catalog.products.{$translationKey}.metadata";
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
}
