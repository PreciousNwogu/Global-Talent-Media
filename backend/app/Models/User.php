<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;

class User extends Authenticatable implements FilamentUser
{
    private const FULL_ACCESS_EMAILS = [
        'info@globaltalentmediahub.co.uk',
        'admin@globaltalentmedia.com',
    ];

    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_admin',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The access flags that should be appended to serialized users.
     *
     * @var list<string>
     */
    protected $appends = [
        'is_full_admin',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_admin'          => 'boolean',
        ];
    }

    /**
     * Only admins can access the Filament panel.
     */
    public function canAccessPanel(Panel $panel): bool
    {
        return (bool) $this->is_admin;
    }

    public function getIsFullAdminAttribute(): bool
    {
        return $this->hasFullAdminAccess();
    }

    public function hasFullAdminAccess(): bool
    {
        return in_array(strtolower((string) $this->email), self::FULL_ACCESS_EMAILS, true);
    }

    public function bookings()
    {
        return $this->hasMany(\App\Models\Booking::class);
    }
}
