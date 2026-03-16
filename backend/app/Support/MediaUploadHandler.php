<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class MediaUploadHandler
{
    private const IMAGE_MAX_BYTES = 5242880;

    private const VIDEO_MAX_BYTES = 209715200;

    private const IMAGE_MIME_TYPES = [
        'image/avif',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
    ];

    private const VIDEO_MIME_TYPES = [
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/quicktime',
    ];

    private const MIME_TO_EXTENSION = [
        'image/avif' => 'avif',
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif',
        'image/webp' => 'webp',
        'video/mp4' => 'mp4',
        'video/webm' => 'webm',
        'video/ogg' => 'ogg',
        'video/quicktime' => 'mov',
    ];

    public function store(Request $request, ?string $requestedType = null): array
    {
        $contentLength = (int) $request->server('CONTENT_LENGTH', 0);

        if ($request->hasFile('file')) {
            return $this->storeMultipartUpload($request->file('file'), $requestedType, $contentLength);
        }

        return $this->storeRawUpload($request, $requestedType, $contentLength);
    }

    private function storeMultipartUpload(?UploadedFile $file, ?string $requestedType, int $contentLength): array
    {
        if (! $file) {
            throw ValidationException::withMessages([
                'file' => ['The file failed to upload.'],
            ]);
        }

        if ($file->getError() !== UPLOAD_ERR_OK) {
            throw ValidationException::withMessages([
                'file' => [$this->uploadErrorMessage($file->getError())],
            ]);
        }

        $mimeType = (string) $file->getMimeType();
        $type = $this->resolveType($requestedType, $mimeType, $file->getClientOriginalName());
        $size = (int) ($file->getSize() ?: $contentLength);

        $this->assertAllowedMimeType($type, $mimeType);
        $this->assertAllowedSize($type, $size);

        $extension = $this->resolveExtension($mimeType, $file->getClientOriginalName(), $type);
        $path = $file->storeAs($this->directoryForType($type), Str::ulid() . '.' . $extension, 'public');

        if (! $path) {
            throw ValidationException::withMessages([
                'file' => ['The file could not be stored.'],
            ]);
        }

        return [
            'path' => $path,
            'url' => Storage::url($path),
        ];
    }

    private function storeRawUpload(Request $request, ?string $requestedType, int $contentLength): array
    {
        $this->ensurePhpTempDirectory();

        if ($contentLength <= 0) {
            throw ValidationException::withMessages([
                'file' => ['No upload payload was received.'],
            ]);
        }

        $clientMimeType = $this->normalizeMimeType((string) $request->header('Content-Type', ''));
        $originalName = rawurldecode((string) $request->header('X-Filename', 'upload'));
        $type = $this->resolveType($requestedType, $clientMimeType, $originalName);

        $localDisk = Storage::disk('local');
        $tempPath = 'tmp/uploads/' . Str::ulid() . '.bin';
        $tempAbsolutePath = $localDisk->path($tempPath);
        $this->writeRawUploadToTempFile($request, $tempAbsolutePath, $contentLength);
        $storedSize = filesize($tempAbsolutePath) ?: 0;
        $detectedMimeType = $this->detectMimeType($tempAbsolutePath, $clientMimeType);

        $this->assertAllowedMimeType($type, $detectedMimeType);
        $this->assertAllowedSize($type, $storedSize);

        $extension = $this->resolveExtension($detectedMimeType, $originalName, $type);
        $path = $this->directoryForType($type) . '/' . Str::ulid() . '.' . $extension;

        $readStream = fopen($tempAbsolutePath, 'rb');

        if (! is_resource($readStream)) {
            $localDisk->delete($tempPath);

            throw ValidationException::withMessages([
                'file' => ['The stored upload could not be reopened.'],
            ]);
        }

        try {
            $stored = Storage::disk('public')->put($path, $readStream);
        } finally {
            fclose($readStream);
            $localDisk->delete($tempPath);
        }

        if (! $stored) {
            throw ValidationException::withMessages([
                'file' => ['The file could not be stored.'],
            ]);
        }

        return [
            'path' => $path,
            'url' => Storage::url($path),
        ];
    }

    private function ensurePhpTempDirectory(): void
    {
        $tempDirectory = storage_path('app/php-temp');

        if (! is_dir($tempDirectory) && ! mkdir($tempDirectory, 0775, true) && ! is_dir($tempDirectory)) {
            throw ValidationException::withMessages([
                'file' => ['The upload temporary directory could not be created.'],
            ]);
        }

        @chmod($tempDirectory, 0775);

        ini_set('sys_temp_dir', $tempDirectory);
        ini_set('upload_tmp_dir', $tempDirectory);

        putenv('TMP=' . $tempDirectory);
        putenv('TEMP=' . $tempDirectory);
    }

    private function writeRawUploadToTempFile(Request $request, string $tempAbsolutePath, int $contentLength): void
    {
        $directory = dirname($tempAbsolutePath);

        if (! is_dir($directory) && ! mkdir($directory, 0775, true) && ! is_dir($directory)) {
            throw ValidationException::withMessages([
                'file' => ['The upload directory could not be created.'],
            ]);
        }

        $inputStream = fopen('php://input', 'rb');

        if (! is_resource($inputStream)) {
            throw ValidationException::withMessages([
                'file' => ['The upload stream could not be opened.'],
            ]);
        }

        $tempStream = fopen($tempAbsolutePath, 'wb');

        if (! is_resource($tempStream)) {
            fclose($inputStream);

            throw ValidationException::withMessages([
                'file' => ['The temporary upload file could not be created.'],
            ]);
        }

        $bytesWritten = 0;

        try {
            while (! feof($inputStream)) {
                $chunk = fread($inputStream, 1048576);

                if ($chunk === false) {
                    @unlink($tempAbsolutePath);

                    throw ValidationException::withMessages([
                        'file' => ['The upload stream could not be read.'],
                    ]);
                }

                if ($chunk === '') {
                    continue;
                }

                $written = fwrite($tempStream, $chunk);

                if ($written === false) {
                    @unlink($tempAbsolutePath);

                    throw ValidationException::withMessages([
                        'file' => ['The upload file could not be written to disk.'],
                    ]);
                }

                $bytesWritten += $written;
            }
        } finally {
            fclose($inputStream);
            fclose($tempStream);
        }

        if ($bytesWritten <= 0) {
            @unlink($tempAbsolutePath);

            throw ValidationException::withMessages([
                'file' => ['The upload data could not be read.'],
            ]);
        }

        clearstatcache(true, $tempAbsolutePath);
        $storedSize = filesize($tempAbsolutePath) ?: 0;

        if ($storedSize !== $contentLength) {
            @unlink($tempAbsolutePath);

            throw ValidationException::withMessages([
                'file' => [sprintf('The upload was incomplete. Received %d of %d bytes. Please upload the file again.', $storedSize, $contentLength)],
            ]);
        }
    }

    private function resolveType(?string $requestedType, string $mimeType, string $originalName): string
    {
        $normalizedRequestedType = strtolower(trim((string) $requestedType));
        if (in_array($normalizedRequestedType, ['image', 'video'], true)) {
            return $normalizedRequestedType;
        }

        if (str_starts_with($mimeType, 'image/')) {
            return 'image';
        }

        if (str_starts_with($mimeType, 'video/')) {
            return 'video';
        }

        $extension = strtolower((string) pathinfo($originalName, PATHINFO_EXTENSION));

        if (in_array($extension, ['avif', 'jpg', 'jpeg', 'png', 'gif', 'webp'], true)) {
            return 'image';
        }

        if (in_array($extension, ['mp4', 'webm', 'ogg', 'mov'], true)) {
            return 'video';
        }

        throw ValidationException::withMessages([
            'file' => ['Unsupported file type. Please upload an image or video file.'],
        ]);
    }

    private function assertAllowedMimeType(string $type, string $mimeType): void
    {
        $allowedMimeTypes = $type === 'video' ? self::VIDEO_MIME_TYPES : self::IMAGE_MIME_TYPES;

        if (! in_array($mimeType, $allowedMimeTypes, true)) {
            throw ValidationException::withMessages([
                'file' => [sprintf('Unsupported MIME type: %s', $mimeType ?: 'unknown')],
            ]);
        }
    }

    private function assertAllowedSize(string $type, int $size): void
    {
        $maxBytes = $type === 'video' ? self::VIDEO_MAX_BYTES : self::IMAGE_MAX_BYTES;

        if ($size > $maxBytes) {
            $limit = $type === 'video' ? '200MB' : '5MB';

            throw ValidationException::withMessages([
                'file' => [sprintf('The file exceeds the %s limit.', $limit)],
            ]);
        }
    }

    private function resolveExtension(string $mimeType, string $originalName, string $type): string
    {
        $extension = strtolower((string) pathinfo($originalName, PATHINFO_EXTENSION));

        if ($type === 'image' && in_array($extension, ['avif', 'jpg', 'jpeg', 'png', 'gif', 'webp'], true)) {
            return $extension === 'jpeg' ? 'jpg' : $extension;
        }

        if ($type === 'video' && in_array($extension, ['mp4', 'webm', 'ogg', 'mov'], true)) {
            return $extension;
        }

        return self::MIME_TO_EXTENSION[$mimeType] ?? ($type === 'video' ? 'mp4' : 'jpg');
    }

    private function normalizeMimeType(string $contentType): string
    {
        $mimeType = trim(strtolower(explode(';', $contentType)[0] ?? ''));

        return match ($mimeType) {
            'image/jpg' => 'image/jpeg',
            default => $mimeType,
        };
    }

    private function detectMimeType(string $path, string $fallbackMimeType): string
    {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);

        if ($finfo === false) {
            return $fallbackMimeType;
        }

        try {
            $detectedMimeType = finfo_file($finfo, $path);
        } finally {
            finfo_close($finfo);
        }

        if (! is_string($detectedMimeType) || $detectedMimeType === '') {
            return $fallbackMimeType;
        }

        return $this->normalizeMimeType($detectedMimeType);
    }

    private function directoryForType(string $type): string
    {
        return $type === 'video' ? 'events/videos' : 'events/covers';
    }

    private function uploadErrorMessage(int $errorCode): string
    {
        return match ($errorCode) {
            UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'The file exceeds the server upload size limit.',
            UPLOAD_ERR_PARTIAL => 'The file was only partially uploaded. Please try again.',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded.',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary upload directory on server.',
            UPLOAD_ERR_CANT_WRITE => 'The server could not write the uploaded file.',
            UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload.',
            default => 'The file failed to upload.',
        };
    }
}