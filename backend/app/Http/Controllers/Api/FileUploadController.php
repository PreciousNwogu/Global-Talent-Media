<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadController extends Controller
{
    /**
     * Upload an image file.
     */
    public function uploadImage(Request $request): JsonResponse
    {
        try {
            if (!$request->hasFile('image')) {
                return response()->json([
                    'message' => 'No image file provided',
                    'errors' => ['image' => ['Please select an image file']],
                ], 400);
            }

            $file = $request->file('image');
            
            // Get file extension
            $extension = strtolower($file->getClientOriginalExtension());
            $originalName = $file->getClientOriginalName();
            
            // Normalize extension (handle variations)
            if ($extension === 'jpe') {
                $extension = 'jpg';
            }
            
            // Check if extension is valid
            $validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
            if (!in_array($extension, $validExtensions)) {
                return response()->json([
                    'message' => 'Invalid file extension: "' . $extension . '". Allowed extensions: ' . implode(', ', $validExtensions) . '. Your file: ' . $originalName,
                    'errors' => ['image' => ['Invalid file extension: ' . $extension]],
                ], 422);
            }
            
            // Check file size (5MB = 5120 KB)
            if ($file->getSize() > 5120 * 1024) {
                return response()->json([
                    'message' => 'File is too large. Maximum size is 5MB. Your file size: ' . round($file->getSize() / 1024, 2) . ' KB',
                    'errors' => ['image' => ['File too large']],
                ], 422);
            }
            
            $filename = Str::uuid() . '.' . $extension;
            
            // Ensure the events directory exists
            if (!Storage::disk('public')->exists('events')) {
                Storage::disk('public')->makeDirectory('events');
            }
            
            $path = $file->storeAs('events', $filename, 'public');
            $url = Storage::disk('public')->url($path);

            return response()->json([
                'url' => $url,
                'path' => $path,
                'filename' => $filename,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            $errors = $e->errors();
            $firstError = collect($errors)->flatten()->first();
            return response()->json([
                'message' => $firstError ?: 'Validation failed',
                'errors' => $errors,
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error uploading image: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Upload multiple images.
     */
    public function uploadImages(Request $request): JsonResponse
    {
        $request->validate([
            'images' => 'required|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $urls = [];

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('events', $filename, 'public');
                $url = Storage::disk('public')->url($path);
                $urls[] = $url;
            }
        }

        return response()->json([
            'urls' => $urls,
        ]);
    }
}

