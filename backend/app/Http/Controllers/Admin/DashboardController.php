<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics.
     */
    public function stats(): JsonResponse
    {
        $today = now()->startOfDay();
        $thisWeek = now()->startOfWeek();
        $thisMonth = now()->startOfMonth();

        $stats = [
            'revenue' => [
                'today' => Payment::where('status', 'succeeded')
                    ->whereDate('created_at', $today)
                    ->sum('amount'),
                'this_week' => Payment::where('status', 'succeeded')
                    ->where('created_at', '>=', $thisWeek)
                    ->sum('amount'),
                'this_month' => Payment::where('status', 'succeeded')
                    ->where('created_at', '>=', $thisMonth)
                    ->sum('amount'),
                'total' => Payment::where('status', 'succeeded')->sum('amount'),
            ],
            'bookings' => [
                'today' => Booking::whereDate('created_at', $today)->count(),
                'this_week' => Booking::where('created_at', '>=', $thisWeek)->count(),
                'this_month' => Booking::where('created_at', '>=', $thisMonth)->count(),
                'total' => Booking::count(),
            ],
            'events' => [
                'published' => Event::published()->count(),
                'draft' => Event::where('status', 'draft')->count(),
                'upcoming' => Event::published()->upcoming()->count(),
                'total' => Event::count(),
            ],
            'active_bookings' => Booking::where('booking_status', 'confirmed')->count(),
            'pending_bookings' => Booking::where('booking_status', 'pending')->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Get revenue analytics.
     */
    public function revenue(): JsonResponse
    {
        // Revenue by month for the last 12 months
        $revenueByMonth = Payment::where('status', 'succeeded')
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('SUM(amount) as total')
            )
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get();

        // Revenue by event (top 10)
        $revenueByEvent = Payment::where('payments.status', 'succeeded')
            ->join('bookings', 'payments.booking_id', '=', 'bookings.id')
            ->join('events', 'bookings.event_id', '=', 'events.id')
            ->select(
                'events.id',
                'events.title',
                DB::raw('SUM(payments.amount) as total_revenue'),
                DB::raw('COUNT(bookings.id) as booking_count')
            )
            ->groupBy('events.id', 'events.title')
            ->orderBy('total_revenue', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'by_month' => $revenueByMonth,
            'by_event' => $revenueByEvent,
        ]);
    }
}

