<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\MediaUploadHandler;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Throwable;

class MediaUploadController extends Controller
{
    public function __construct(private readonly MediaUploadHandler $mediaUploadHandler)
    {
    }

    public function upload(Request $request)
    {
        try {
            $upload = $this->mediaUploadHandler->store($request, $request->header('X-Upload-Type'));

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
