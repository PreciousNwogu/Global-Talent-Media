<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class EventController extends Controller
{
    /**
     * Display a listing of published events.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Event::with('category')
            ->published()
            ->orderBy('starts_at', 'asc');
        
        // Only filter by upcoming if not explicitly disabled
        if (!$request->has('include_past') || $request->include_past !== 'true') {
            $query->upcoming();
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by featured
        if ($request->has('featured') && $request->featured === 'true') {
            $query->featured();
        }

        // Search by title
        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Pagination
        $perPage = $request->get('per_page', 12);
        $events = $query->paginate($perPage);

        return response()->json($events);
    }

    /**
     * Display the specified event.
     */
    public function show(string $id): JsonResponse
    {
        $event = Event::with(['category', 'creator'])
            ->published()
            ->findOrFail($id);

        return response()->json($event);
    }

    /**
     * Check ticket availability for an event.
     */
    public function checkAvailability(string $id): JsonResponse
    {
        $event = Event::published()->findOrFail($id);

        return response()->json([
            'event_id' => $event->id,
            'available_tickets' => $event->available_tickets,
            'capacity' => $event->capacity,
            'is_available' => $event->available_tickets > 0,
            'status' => $event->status,
        ]);
    }
}

