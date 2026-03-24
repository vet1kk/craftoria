<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Helpers\FileUpload;
use App\Traits\ResolvesTranslatedValue;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\ProductImage */
class ProductImageResource extends JsonResource
{
    use ResolvesTranslatedValue;

    /**
     * Transform the resource into an array.
     *
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    public function toArray(Request $request): array
    {
        return $this->translateResource([
            'id' => $this->id,
            'product_id' => $this->product_id,
            'image_url' => FileUpload::publicUrl($this->image_url),
            'position' => $this->position,
            'created_at' => $this->created_at?->toAtomString(),
            'updated_at' => $this->updated_at?->toAtomString(),
        ]);
    }
}
