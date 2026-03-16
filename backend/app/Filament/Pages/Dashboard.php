<?php

namespace App\Filament\Pages;

use Filament\Actions\Action;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Pages\Dashboard as BaseDashboard;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class Dashboard extends BaseDashboard
{
    protected function getHeaderActions(): array
    {
        return [
            Action::make('changePassword')
                ->label('Change Password')
                ->icon('heroicon-o-key')
                ->color('gray')
                ->modalHeading('Change Password')
                ->modalDescription('Update your admin account password.')
                ->modalSubmitActionLabel('Update Password')
                ->modalWidth('md')
                ->form([
                    TextInput::make('current_password')
                        ->label('Current Password')
                        ->password()
                        ->revealable()
                        ->required()
                        ->autocomplete('current-password'),

                    TextInput::make('password')
                        ->label('New Password')
                        ->password()
                        ->revealable()
                        ->required()
                        ->minLength(8)
                        ->same('password_confirmation')
                        ->autocomplete('new-password'),

                    TextInput::make('password_confirmation')
                        ->label('Confirm New Password')
                        ->password()
                        ->revealable()
                        ->required()
                        ->autocomplete('new-password'),
                ])
                ->action(function (array $data): void {
                    $user = Auth::user();

                    if (! Hash::check($data['current_password'], $user->password)) {
                        throw ValidationException::withMessages([
                            'current_password' => 'The current password is incorrect.',
                        ]);
                    }

                    $user->update([
                        'password' => Hash::make($data['password']),
                    ]);

                    Notification::make()
                        ->title('Password updated successfully')
                        ->success()
                        ->send();
                }),
        ];
    }
}
