<?php

namespace App\Filament\Resources;

use App\Filament\Resources\EventResource\Pages;
use App\Models\Category;
use App\Models\Event;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EventResource extends Resource
{
    protected static ?string $model = Event::class;

    protected static ?string $navigationIcon = 'heroicon-o-calendar';

    protected static ?string $navigationLabel = 'Events';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Event Details')
                    ->columns(2)
                    ->schema([
                        Forms\Components\TextInput::make('title')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn ($state, callable $set) =>
                                $set('slug', Str::slug($state))
                            )
                            ->columnSpanFull(),

                        Forms\Components\TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(Event::class, 'slug', ignoreRecord: true),

                        Forms\Components\Select::make('category_id')
                            ->label('Category')
                            ->options(Category::pluck('name', 'id'))
                            ->searchable()
                            ->preload(),

                        Forms\Components\Select::make('status')
                            ->options([
                                'draft'     => 'Draft',
                                'published' => 'Published',
                                'cancelled' => 'Cancelled',
                            ])
                            ->required()
                            ->default('draft'),

                        Forms\Components\Toggle::make('is_featured')
                            ->label('Featured Event')
                            ->inline(false),

                        Forms\Components\Textarea::make('description')
                            ->required()
                            ->rows(4)
                            ->columnSpanFull(),

                        Forms\Components\Textarea::make('short_description')
                            ->rows(2)
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Date & Venue')
                    ->columns(2)
                    ->schema([
                        Forms\Components\DateTimePicker::make('starts_at')
                            ->required()
                            ->label('Start Date & Time'),

                        Forms\Components\DateTimePicker::make('ends_at')
                            ->label('End Date & Time'),

                        Forms\Components\TextInput::make('location')
                            ->required()
                            ->maxLength(255),

                        Forms\Components\Textarea::make('venue_address')
                            ->rows(2)
                            ->columnSpanFull(),
                    ]),

                Forms\Components\Section::make('Tickets & Pricing')
                    ->columns(3)
                    ->schema([
                        Forms\Components\TextInput::make('price')
                            ->label('Ticket Price ($)')
                            ->required()
                            ->numeric()
                            ->prefix('$'),

                        Forms\Components\TextInput::make('capacity')
                            ->required()
                            ->numeric()
                            ->minValue(1),

                        Forms\Components\TextInput::make('available_tickets')
                            ->required()
                            ->numeric()
                            ->minValue(0),
                    ]),

                Forms\Components\Section::make('Media')
                    ->columns(2)
                    ->schema([
                        // Cover Image
                        Forms\Components\TextInput::make('cover_image')
                            ->label('Cover Image URL')
                            ->helperText('Paste an online image URL — or upload a local file below to fill this automatically.')
                            ->columnSpanFull()
                            ->live(),

                        Forms\Components\FileUpload::make('cover_image_file')
                            ->label('Upload Cover Image (optional — saves on form submit)')
                            ->image()
                            ->disk('public')
                            ->directory('events/covers')
                            ->maxSize(10240)
                            ->imagePreviewHeight('160')
                            ->columnSpanFull(),


                        // Video
                        Forms\Components\TextInput::make('video_url')
                            ->label('Video URL')
                            ->helperText('Paste a YouTube / Vimeo / direct video URL — or upload a local file below.'),

                        Forms\Components\FileUpload::make('video_url_file')
                            ->label('Upload Video File (optional — saves on form submit)')
                            ->acceptedFileTypes(['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/*'])
                            ->disk('public')
                            ->directory('events/videos')
                            ->maxSize(204800),

                    ]),

                Forms\Components\Section::make('Terms & Conditions')
                    ->schema([
                        Forms\Components\Textarea::make('terms_and_conditions')
                            ->rows(3)
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('cover_image')
                    ->label('')
                    ->circular(),

                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->sortable()
                    ->weight('semibold'),

                Tables\Columns\TextColumn::make('category.name')
                    ->label('Category')
                    ->badge()
                    ->sortable(),

                Tables\Columns\TextColumn::make('starts_at')
                    ->label('Date')
                    ->dateTime('M j, Y g:i A')
                    ->sortable(),

                Tables\Columns\TextColumn::make('price')
                    ->money('USD')
                    ->sortable(),

                Tables\Columns\TextColumn::make('available_tickets')
                    ->label('Tickets Left')
                    ->numeric()
                    ->sortable(),

                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'warning' => 'draft',
                        'success' => 'published',
                        'danger'  => 'cancelled',
                    ]),

                Tables\Columns\IconColumn::make('is_featured')
                    ->label('Featured')
                    ->boolean(),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('starts_at', 'asc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'draft'     => 'Draft',
                        'published' => 'Published',
                        'cancelled' => 'Cancelled',
                    ]),
                Tables\Filters\SelectFilter::make('category')
                    ->relationship('category', 'name'),
            ])
            ->actions([
                Tables\Actions\Action::make('publish')
                    ->label('Publish')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn (Event $record) => $record->status !== 'published')
                    ->action(fn (Event $record) => $record->update(['status' => 'published'])),

                Tables\Actions\Action::make('unpublish')
                    ->label('Unpublish')
                    ->icon('heroicon-o-x-circle')
                    ->color('warning')
                    ->visible(fn (Event $record) => $record->status === 'published')
                    ->action(fn (Event $record) => $record->update(['status' => 'draft'])),

                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListEvents::route('/'),
            'create' => Pages\CreateEvent::route('/create'),
            'edit'   => Pages\EditEvent::route('/{record}/edit'),
        ];
    }
}
