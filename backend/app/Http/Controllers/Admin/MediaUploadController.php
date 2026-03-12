<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaUploadController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,gif,webp,mp4,webm,mov|max:204800',
        ]);

        $file = $request->file('file');
        $isVideo = in_array($file->getMimeType(), ['video/mp4', 'video/webm', 'video/quicktime']);
        $directory = $isVideo ? 'events/videos' : 'events/covers';

        $path = $file->store($directory, 'public');
        $url  = Storage::disk('public')->url($path);

        return response()->json(['url' => $url]);
    }
}
