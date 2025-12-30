<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    /**
     * Store a newly created booking.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'event_id' => 'required|exists:events,id',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'ticket_quantity' => 'required|integer|min:1',
            'ticket_type' => 'nullable|string|max:255',
            'special_requests' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $event = Event::published()->findOrFail($request->event_id);

        // Check availability
        if ($event->available_tickets < $request->ticket_quantity) {
            return response()->json([
                'message' => 'Not enough tickets available',
                'available_tickets' => $event->available_tickets,
            ], 400);
        }

        DB::beginTransaction();
        try {
            $totalAmount = $event->price * $request->ticket_quantity;

            $booking = Booking::create([
                'event_id' => $event->id,
                'user_id' => Auth::id(),
                'customer_name' => $request->customer_name,
                'customer_email' => $request->customer_email,
                'customer_phone' => $request->customer_phone,
                'ticket_quantity' => $request->ticket_quantity,
                'ticket_type' => $request->ticket_type,
                'total_amount' => $totalAmount,
                'booking_status' => 'pending',
                'payment_status' => 'pending',
                'special_requests' => $request->special_requests,
            ]);

            // Update available tickets
            $event->decrement('available_tickets', $request->ticket_quantity);

            // Update event status if sold out
            if ($event->available_tickets <= 0) {
                $event->update(['status' => 'sold_out']);
            }

            DB::commit();

            return response()->json([
                'message' => 'Booking created successfully',
                'booking' => $booking->load('event'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create booking',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the authenticated user's bookings.
     */
    public function userBookings(): JsonResponse
    {
        $bookings = Booking::with(['event', 'payment'])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($bookings);
    }

    /**
     * Display the specified booking.
     */
    public function show(string $id): JsonResponse
    {
        $booking = Booking::with(['event', 'payment', 'user'])
            ->where('user_id', Auth::id())
            ->findOrFail($id);

        return response()->json($booking);
    }

    /**
     * Get booking by reference (public, for confirmation page).
     */
    public function getByReference(string $reference): JsonResponse
    {
        $booking = Booking::with(['event', 'payment'])
            ->where('booking_reference', $reference)
            ->firstOrFail();

        return response()->json($booking);
    }

    /**
     * Cancel a booking.
     */
    public function cancel(string $id): JsonResponse
    {
        $booking = Booking::where('user_id', Auth::id())
            ->findOrFail($id);

        if ($booking->booking_status === 'cancelled') {
            return response()->json([
                'message' => 'Booking is already cancelled',
            ], 400);
        }

        if ($booking->booking_status === 'confirmed' && $booking->isPaid()) {
            return response()->json([
                'message' => 'Cannot cancel a paid booking. Please contact support for refund.',
            ], 400);
        }

        DB::beginTransaction();
        try {
            $booking->update(['booking_status' => 'cancelled']);

            // Restore available tickets
            $event = $booking->event;
            $event->increment('available_tickets', $booking->ticket_quantity);

            // Update event status if it was sold out
            if ($event->status === 'sold_out' && $event->available_tickets > 0) {
                $event->update(['status' => 'published']);
            }

            DB::commit();

            return response()->json([
                'message' => 'Booking cancelled successfully',
                'booking' => $booking,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to cancel booking',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

