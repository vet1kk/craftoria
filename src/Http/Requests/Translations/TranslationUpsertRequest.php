<?php

declare(strict_types=1);

namespace App\Http\Requests\Translations;

use App\Http\Requests\AdminRequest;
use Illuminate\Validation\Rule;

class TranslationUpsertRequest extends AdminRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'locale' => [
                'required',
                'string',
                Rule::in(['uk']),
            ],
            'fields' => ['required', 'array'],
        ];
    }
}

