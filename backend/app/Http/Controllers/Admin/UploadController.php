<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    /**
     * Upload a file (image or video) and return its public URL.
     * Accepts multipart/form-data with a 'file' field.
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:204800', // up to 200 MB
            'type' => 'nullable|in:image,video',
        ]);

        $type      = $request->input('type', 'image');
        $directory = $type === 'video' ? 'events/videos' : 'events/covers';

        $path = $request->file('file')->store($directory, 'public');

        return response()->json([
            'url'  => Storage::disk('public')->url($path),
            'path' => $path,
        ]);
    }
}
