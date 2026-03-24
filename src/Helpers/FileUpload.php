<?php

declare(strict_types=1);

namespace App\Helpers;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUpload
{
    /**
     * @param \Illuminate\Http\UploadedFile $file
     * @param string $directory
     * @return string
     */
    public static function storePublicImage(UploadedFile $file, string $directory): string
    {
        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid()->toString() . '.' . $extension;

        return $file->storeAs($directory, $filename, 'public');
    }

    /**
     * @param string|null $path
     * @return void
     */
    public static function deletePublicFile(?string $path): void
    {
        if ($path === null || $path === '') {
            return;
        }

        Storage::disk('public')->delete($path);
    }

    /**
     * @param string|null $oldPath
     * @param \Illuminate\Http\UploadedFile $newFile
     * @param string $directory
     * @return string
     */
    public static function replacePublicImage(?string $oldPath, UploadedFile $newFile, string $directory): string
    {
        $newPath = self::storePublicImage($newFile, $directory);

        self::deletePublicFile($oldPath);

        return $newPath;
    }

    /**
     * @param string|null $path
     * @return string|null
     */
    public static function publicUrl(?string $path): ?string
    {
        if ($path === null) {
            return null;
        }

        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }
}