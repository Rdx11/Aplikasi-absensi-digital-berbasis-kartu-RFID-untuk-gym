<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class ImageHelper
{
    /**
     * Compress dan simpan gambar
     * 
     * @param UploadedFile $file
     * @param string $path Folder tujuan (contoh: 'members')
     * @param int $maxWidth Max width gambar
     * @param int $quality Quality JPEG (1-100)
     * @return string Path file yang disimpan
     */
    public static function compressAndStore(
        UploadedFile $file,
        string $path = 'members',
        int $maxWidth = 800,
        int $quality = 80
    ): string {
        // Generate unique filename
        $filename = uniqid() . '_' . time() . '.jpg';
        $fullPath = $path . '/' . $filename;

        // Read dan resize gambar
        $image = Image::read($file);
        
        // Resize jika lebih besar dari maxWidth (maintain aspect ratio)
        if ($image->width() > $maxWidth) {
            $image->scale(width: $maxWidth);
        }

        // Convert ke JPEG dan compress
        $encoded = $image->toJpeg($quality);

        // Simpan ke storage
        Storage::disk('public')->put($fullPath, $encoded);

        return $fullPath;
    }
}
