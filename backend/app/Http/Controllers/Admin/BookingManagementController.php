<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class BookingManagementController extends Controller
{
    /**
     * Display a listing of all bookings.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Booking::with(['event', 'user', 'payment']);

        // Filter by event
        if ($request->has('event_id')) {
            $query->where('event_id', $request->event_id);
        }

        // Filter by status
        if ($request->has('booking_status')) {
            $query->where('booking_status', $request->booking_status);
        }

        // Filter by payment status
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Search by booking reference or customer email
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('booking_reference', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%");
            });
        }

        $perPage = $request->get('per_page', 15);
        $bookings = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($bookings);
    }

    /**
     * Display the specified booking.
     */
    public function show(string $id): JsonResponse
    {
        $booking = Booking::with(['event', 'user', 'payment'])->findOrFail($id);

        return response()->json($booking);
    }

    /**
     * Update the specified booking.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);

        $validated = $request->validate([
            'booking_status' => 'sometimes|in:pending,confirmed,cancelled,refunded',
            'payment_status' => 'sometimes|in:pending,paid,failed,refunded',
        ]);

        $booking->update($validated);

        return response()->json([
            'message' => 'Booking updated successfully',
            'booking' => $booking->load(['event', 'user', 'payment']),
        ]);
    }

    /**
     * Export bookings to CSV (basic implementation).
     */
    public function export(Request $request): JsonResponse
    {
        // This is a basic implementation. For production, consider using a package like maatwebsite/excel
        $bookings = Booking::with(['event', 'user'])
            ->when($request->has('event_id'), fn($q) => $q->where('event_id', $request->event_id))
            ->get();

        // Return JSON for now - frontend can handle CSV conversion
        // Or implement proper CSV generation using a package
        return response()->json([
            'message' => 'Bookings export (JSON format)',
            'bookings' => $bookings,
        ]);
    }
}

