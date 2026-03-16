<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\MediaUploadHandler;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Throwable;

class UploadController extends Controller
{
    public function __construct(private readonly MediaUploadHandler $mediaUploadHandler)
    {
    }

    /**
     * Upload a file (image or video) and return its public URL.
     * Supports both multipart uploads and raw binary uploads.
     */
    public function store(Request $request)
    {
        try {
            $requestedType = $request->input('type') ?: $request->header('X-Upload-Type');
            $upload = $this->mediaUploadHandler->store($request, $requestedType);

            return response()->json($upload);
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $exception->errors(),
            ], 422);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Upload failed unexpectedly.',
            ], 500);
        }
    }
}
