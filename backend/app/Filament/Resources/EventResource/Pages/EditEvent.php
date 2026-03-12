<?php

namespace App\Filament\Resources\EventResource\Pages;

use App\Filament\Resources\EventResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Support\Facades\Storage;

class EditEvent extends EditRecord
{
    protected static string $resource = EventResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        if (!empty($data['cover_image_file'])) {
            $data['cover_image'] = Storage::disk('public')->url($data['cover_image_file']);
        }
        unset($data['cover_image_file']);

        if (!empty($data['video_url_file'])) {
            $data['video_url'] = Storage::disk('public')->url($data['video_url_file']);
        }
        unset($data['video_url_file']);

        return $data;
    }
}
