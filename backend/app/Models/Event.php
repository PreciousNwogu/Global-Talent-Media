<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'short_description',
        'category_id',
        'location',
        'venue_address',
        'starts_at',
        'ends_at',
        'cover_image',
        'video_url',
        'gallery_images',
        'price',
        'capacity',
        'available_tickets',
        'status',
        'is_featured',
        'terms_and_conditions',
        'created_by',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'is_featured' => 'boolean',
        'gallery_images' => 'array',
        'price' => 'decimal:2',
        'capacity' => 'integer',
        'available_tickets' => 'integer',
    ];

    /**
     * Get the category that owns the event.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the bookings for the event.
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Get the user that created the event.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope a query to only include published events.
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope a query to only include featured events.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope a query to only include upcoming events.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('starts_at', '>', now());
    }

    protected function coverImage(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => self::normalizeMediaValue($value),
            set: fn (?string $value) => self::normalizeMediaValue($value),
        );
    }

    protected function videoUrl(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value) => self::normalizeMediaValue($value),
            set: fn (?string $value) => self::normalizeMediaValue($value),
        );
    }

    private static function normalizeMediaValue(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $normalized = trim($value);

        if ($normalized === '') {
            return null;
        }

        if (preg_match('#^https?://[^/]+(/storage/.*)$#i', $normalized, $matches) === 1) {
            return $matches[1];
        }

        if (str_starts_with($normalized, 'storage/')) {
            return '/' . $normalized;
        }

        if (str_starts_with($normalized, 'events/')) {
            return '/storage/' . $normalized;
        }

        return $normalized;
    }
}
