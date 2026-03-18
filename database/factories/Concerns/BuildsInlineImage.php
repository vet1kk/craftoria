<?php

declare(strict_types=1);

namespace Database\Factories\Concerns;

trait BuildsInlineImage
{
    /**
     * @param  string  $label
     * @param  int  $width
     * @param  int  $height
     * @return string
     */
    protected function inlineImage(string $label, int $width = 640, int $height = 480): string
    {
        return sprintf(
            'https://placehold.co/%1$dx%2$d/png?text=%3$s',
            $width,
            $height,
            rawurlencode($label),
        );
    }
}
