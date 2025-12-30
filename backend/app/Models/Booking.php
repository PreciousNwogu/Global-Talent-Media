<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_reference',
        'event_id',
        'user_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'ticket_quantity',
        'ticket_type',
        'total_amount',
        'booking_status',
        'payment_status',
        'payment_id',
        'special_requests',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'ticket_quantity' => 'integer',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($booking) {
            if (empty($booking->booking_reference)) {
                $booking->booking_reference = static::generateBookingReference();
            }
        });
    }

    /**
     * Generate a unique booking reference.
     */
    protected static function generateBookingReference(): string
    {
        do {
            $reference = 'GTM-' . date('Y') . '-' . strtoupper(Str::random(6));
        } while (static::where('booking_reference', $reference)->exists());

        return $reference;
    }

    /**
     * Get the event that this booking belongs to.
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get the user that made this booking.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the payment associated with this booking.
     */
    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * Scope a query to only include confirmed bookings.
     */
    public function scopeConfirmed($query)
    {
        return $query->where('booking_status', 'confirmed');
    }

    /**
     * Scope a query to only include pending bookings.
     */
    public function scopePending($query)
    {
        return $query->where('booking_status', 'pending');
    }

    /**
     * Check if booking is confirmed.
     */
    public function isConfirmed(): bool
    {
        return $this->booking_status === 'confirmed';
    }

    /**
     * Check if booking is paid.
     */
    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }
}

