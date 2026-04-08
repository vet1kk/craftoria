<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property string $translatable_type
 * @property string $translatable_id
 * @property string $locale
 * @property string $field
 * @property string $value
 */
class CatalogTranslation extends Model
{
    use HasFactory;
    use HasUuids;

    protected $fillable = [
        'translatable_type',
        'translatable_id',
        'locale',
        'field',
        'value',
    ];
}
