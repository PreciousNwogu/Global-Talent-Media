<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\MediaUploadController;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

// Direct (non-Livewire) media upload — used by the admin event form
Route::post('/admin/media/upload', [MediaUploadController::class, 'upload'])
    ->middleware(['web', \Filament\Http\Middleware\Authenticate::class])
    ->name('admin.media.upload');

require __DIR__.'/auth.php';
