<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    /**
     * Get bank transfer details for a booking.
     */
    public function getBankDetails(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'booking_reference' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $booking = Booking::with('event')
            ->where('booking_reference', $request->booking_reference)
            ->firstOrFail();

        // Bank transfer details - these should be in your config/env
        $bankDetails = [
            'account_name' => config('app.bank_account_name', 'Global Talent Media Hub Ltd'),
            'account_number' => config('app.bank_account_number', '12345678'),
            'sort_code' => config('app.bank_sort_code', '12-34-56'),
            'iban' => config('app.bank_iban', 'GB82 WEST 1234 5698 7654 32'),
            'swift' => config('app.bank_swift', 'NWBKGB2L'),
            'reference' => $booking->booking_reference,
            'amount' => $booking->total_amount,
            'currency' => 'GBP',
        ];

        return response()->json([
            'booking' => $booking,
            'bank_details' => $bankDetails,
            'instructions' => 'Please transfer the amount using the booking reference: ' . $booking->booking_reference,
        ]);
    }
}

