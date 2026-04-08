<?php

declare(strict_types=1);

namespace App\Models;

use App\Helpers\FileUpload;
use App\Models\Builders\CategoryBuilder;
use App\Models\Concerns\HasCatalogTranslations;
use App\Models\Concerns\HasTranslationConfig;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Http\UploadedFile;

/**
 * @method static \App\Models\Builders\CategoryBuilder query()
 * @method static \App\Models\Builders\CategoryBuilder newQuery()
 * @method static \App\Models\Builders\CategoryBuilder newModelQuery()
 * @method static \App\Models\Builders\CategoryBuilder active()
 *
 * @mixin \App\Models\Builders\CategoryBuilder
 *
 * @property string $id
 * @property string $name
 * @property string $slug
 * @property string|null $icon
 * @property string|null $image_url
 * @property int $position
 * @property bool $is_active
 * @property bool $is_system
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Product> $products
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CatalogTranslation> $translations
 */
class Category extends Model
{
    use HasCatalogTranslations;
    use HasFactory;
    use HasTranslationConfig;
    use HasUuids;
    use SoftDeletes;

    /**
     * @var array<int, string>
     */
    protected array $translatableFields = ['name'];

    protected $fillable = [
        'name',
        'slug',
        'icon',
        'image',
        'image_url',
        'position',
        'is_active',
        'is_system',
    ];

    /**
     * @param \Illuminate\Http\UploadedFile|string|null $file
     * @return void
     */
    public function setImageAttribute(UploadedFile|string|null $file): void
    {
        if (!$file instanceof UploadedFile) {
            return;
        }

        $this->attributes['image_url'] = FileUpload::storePublicImage(
            $file,
            'uploads/categories'
        );
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array
     */
    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'is_active' => 'boolean',
            'is_system' => 'boolean',
        ];
    }

    /**
     * Get the related products.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class)->orderBy('position');
    }

    /**
     * Create a new Eloquent query builder for the model.
     *
     * @param \Illuminate\Database\Query\Builder $query
     * @return \App\Models\Builders\CategoryBuilder
     */
    public function newEloquentBuilder($query): CategoryBuilder
    {
        return new CategoryBuilder($query);
    }

    /**
     * Scope the query to active records.
     *
     * @param \App\Models\Builders\CategoryBuilder $query
     * @return void
     */
    public function scopeActive(CategoryBuilder $query): void
    {
        $query->where('is_active', true);
    }

    /**
     * @return void
     */
    protected static function booted(): void
    {
        static::updated(static function (self $category): void {
            if (!$category->wasChanged('image_url')) {
                return;
            }

            FileUpload::deletePublicFile($category->getOriginal('image_url'));
        });

        static::deleting(static function (self $category): void {
            FileUpload::deletePublicFile($category->image_url);
        });
    }
}
