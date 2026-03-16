<?php

namespace App\Filament\Forms\Components;

use Filament\Forms\Components\Field;

class MediaUploader extends Field
{
    protected string $view = 'filament.forms.components.media-uploader';

    protected string $targetField = '';
    protected string $accept      = 'image/*';

    public function targetField(string $field): static
    {
        $this->targetField = $field;
        return $this;
    }

    public function getTargetField(): string
    {
        return $this->targetField;
    }

    public function accept(string $accept): static
    {
        $this->accept = $accept;
        return $this;
    }

    public function getAccept(): string
    {
        return $this->accept;
    }
}
