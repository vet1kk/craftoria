<?php

declare(strict_types=1);

namespace App\Http\Requests\Translations;

use App\Http\Requests\AdminRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\Rule;

class ModelTranslationUpsertRequest extends AdminRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $types = array_keys((array)config('catalog.translation_targets', []));

        return [
            'locale' => [
                'required',
                'string',
                Rule::in(['uk']),
            ],
            'fields' => ['required', 'array'],
            'fields.*' => ['nullable', 'string'],
            'type' => ['required', 'string', Rule::in($types)],
        ];
    }

    /**
     * Merge route params into validation payload.
     */
    protected function validationData(): array
    {
        return array_merge($this->all(), [
            'type' => (string)$this->route('type'),
        ]);
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $type = (string)$this->route('type');
            $allowedFields = (array)data_get(config('catalog.translation_targets'), "$type.fields", []);
            $fields = array_keys((array)$this->input('fields', []));
            $unknownFields = array_values(array_diff($fields, $allowedFields));

            if ($unknownFields !== []) {
                $validator->errors()->add('fields', 'Unsupported fields: ' . implode(', ', $unknownFields));
            }
        });
    }
}



