<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class EventManagementController extends Controller
{
    /**
     * Display a listing of all events.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Event::with(['category', 'creator']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Search
        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $perPage = $request->get('per_page', 15);
        $events = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($events);
    }

    /**
     * Store a newly created event.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'short_description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'location' => 'required|string|max:255',
            'venue_address' => 'nullable|string',
            'starts_at' => 'required|date',
            'ends_at' => 'required|date|after:starts_at',
            'cover_image' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'capacity' => 'required|integer|min:1',
            'is_featured' => 'boolean',
            'terms_and_conditions' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        $data['slug'] = Str::slug($data['title']) . '-' . time();
        $data['available_tickets'] = $data['capacity'];
        $data['status'] = 'draft';
        $data['created_by'] = auth()->id();

        $event = Event::create($data);

        return response()->json([
            'message' => 'Event created successfully',
            'event' => $event->load(['category', 'creator']),
        ], 201);
    }

    /**
     * Display the specified event.
     */
    public function show(string $id): JsonResponse
    {
        $event = Event::with(['category', 'creator'])->findOrFail($id);

        return response()->json($event);
    }

    /**
     * Update the specified event.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $event = Event::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'short_description' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'location' => 'sometimes|required|string|max:255',
            'venue_address' => 'nullable|string',
            'starts_at' => 'sometimes|required|date',
            'ends_at' => 'sometimes|required|date|after:starts_at',
            'cover_image' => 'nullable|string|url',
            'gallery_images' => 'nullable|array',
            'video_url' => 'nullable|string|url',
            'price' => 'sometimes|required|numeric|min:0',
            'capacity' => 'sometimes|required|integer|min:1',
            'status' => 'sometimes|in:draft,published,cancelled,sold_out',
            'is_featured' => 'boolean',
            'terms_and_conditions' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        // Update slug if title changed
        if (isset($data['title']) && $data['title'] !== $event->title) {
            $data['slug'] = Str::slug($data['title']) . '-' . time();
        }

        $event->update($data);

        return response()->json([
            'message' => 'Event updated successfully',
            'event' => $event->load(['category', 'creator']),
        ]);
    }

    /**
     * Remove the specified event.
     */
    public function destroy(string $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $event->delete();

        return response()->json([
            'message' => 'Event deleted successfully',
        ]);
    }

    /**
     * Publish the specified event.
     */
    public function publish(string $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $event->update(['status' => 'published']);

        return response()->json([
            'message' => 'Event published successfully',
            'event' => $event,
        ]);
    }

    /**
     * Unpublish the specified event.
     */
    public function unpublish(string $id): JsonResponse
    {
        $event = Event::findOrFail($id);
        $event->update(['status' => 'draft']);

        return response()->json([
            'message' => 'Event unpublished successfully',
            'event' => $event,
        ]);
    }
}

