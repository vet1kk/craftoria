<?php

declare(strict_types=1);

namespace App\Http\Requests\Category;

use App\Http\Requests\AdminRequest;
use App\Http\Requests\Concerns\GeneratesUniqueSlug;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class CategoryUpsertRequest extends AdminRequest
{
    use GeneratesUniqueSlug;

    /**
     * Get the validation rules for the request.
     *
     * @return array
     */
    public function rules(): array
    {
        $categoryId = $this->route('category')?->getKey();

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'slug')->ignore($categoryId)->whereNull('deleted_at')
            ],
            'icon' => ['nullable', 'string', 'max:255'],
            'image' => [
                'nullable',
                File::image()->max(10 * 1024),
            ],
            'position' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    /**
     * @inheritDoc
     */
    protected function prepareForValidation(): void
    {
        $name = trim((string)$this->input('name', ''));
        $categoryId = $this->route('category')?->getKey();

        $this->merge([
            'name' => $name,
            'slug' => $this->generateUniqueSlug('categories', $name, $categoryId),
            'is_active' => $this->boolean('is_active'),
            'position' => $this->integer('position'),
        ]);
    }
}
