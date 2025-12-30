<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Admin\EventManagementController;
use App\Http\Controllers\Admin\BookingManagementController;
use App\Http\Controllers\Admin\DashboardController;
use App\Models\Event;

// Public routes (no authentication required)
Route::prefix('events')->group(function () {
    Route::get('/', [EventController::class, 'index']);
    Route::get('/{id}', [EventController::class, 'show']);
    Route::get('/{id}/availability', [EventController::class, 'checkAvailability']);
});

Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::get('/{id}', [CategoryController::class, 'show']);
});

// Booking routes (public for guest checkout)
Route::post('/bookings', [BookingController::class, 'store']);
Route::get('/bookings/reference/{reference}', [BookingController::class, 'getByReference']);

// Payment routes (public)
Route::post('/payments/bank-details', [PaymentController::class, 'getBankDetails']);

// Authenticated user routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // User bookings
    Route::prefix('user')->group(function () {
        Route::get('/bookings', [BookingController::class, 'userBookings']);
        Route::get('/bookings/{id}', [BookingController::class, 'show']);
        Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
    });
});

// Admin routes (require authentication and admin role)
// TODO: Add admin middleware when role-based access is implemented
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/revenue', [DashboardController::class, 'revenue']);

    // Event management
    Route::prefix('events')->group(function () {
        Route::get('/', [EventManagementController::class, 'index']);
        Route::post('/', [EventManagementController::class, 'store']);
        Route::get('/{id}', [EventManagementController::class, 'show']);
        Route::put('/{id}', [EventManagementController::class, 'update']);
        Route::delete('/{id}', [EventManagementController::class, 'destroy']);
        Route::post('/{id}/publish', [EventManagementController::class, 'publish']);
        Route::post('/{id}/unpublish', [EventManagementController::class, 'unpublish']);
    });

    // Booking management
    Route::prefix('bookings')->group(function () {
        Route::get('/', [BookingManagementController::class, 'index']);
        Route::get('/{id}', [BookingManagementController::class, 'show']);
        Route::put('/{id}', [BookingManagementController::class, 'update']);
        Route::post('/export', [BookingManagementController::class, 'export']);
    });

    // Category management (if needed)
    // Route::prefix('categories')->group(function () {
    //     Route::get('/', [CategoryManagementController::class, 'index']);
    //     Route::post('/', [CategoryManagementController::class, 'store']);
    //     Route::put('/{id}', [CategoryManagementController::class, 'update']);
    //     Route::delete('/{id}', [CategoryManagementController::class, 'destroy']);
    // });
});

// Debug route to check events (remove in production)
Route::get('/debug/events', function () {
    return response()->json([
        'total' => Event::count(),
        'published' => Event::where('status', 'published')->count(),
        'upcoming' => Event::where('starts_at', '>', now())->count(),
        'published_and_upcoming' => Event::where('status', 'published')
            ->where('starts_at', '>', now())
            ->count(),
        'all_events' => Event::with('category')->get()->map(function ($event) {
            return [
                'id' => $event->id,
                'title' => $event->title,
                'status' => $event->status,
                'starts_at' => $event->starts_at,
                'is_upcoming' => $event->starts_at > now(),
            ];
        }),
    ]);
});
