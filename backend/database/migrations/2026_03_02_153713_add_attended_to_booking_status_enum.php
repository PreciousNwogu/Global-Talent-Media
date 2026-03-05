<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE bookings MODIFY COLUMN booking_status ENUM('pending','confirmed','cancelled','refunded','attended') NOT NULL DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Move any 'attended' rows back to 'confirmed' before narrowing the enum
        DB::statement("UPDATE bookings SET booking_status = 'confirmed' WHERE booking_status = 'attended'");
        DB::statement("ALTER TABLE bookings MODIFY COLUMN booking_status ENUM('pending','confirmed','cancelled','refunded') NOT NULL DEFAULT 'pending'");
    }
};
