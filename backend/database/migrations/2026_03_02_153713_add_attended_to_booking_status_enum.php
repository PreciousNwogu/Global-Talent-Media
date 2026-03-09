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
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE bookings MODIFY COLUMN booking_status ENUM('pending','confirmed','cancelled','refunded','attended') NOT NULL DEFAULT 'pending'");
        } elseif ($driver === 'pgsql') {
            DB::statement('ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_booking_status_check');
            DB::statement("ALTER TABLE bookings ADD CONSTRAINT bookings_booking_status_check CHECK ((booking_status)::text = ANY (ARRAY['pending'::text, 'confirmed'::text, 'cancelled'::text, 'refunded'::text, 'attended'::text]))");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement("UPDATE bookings SET booking_status = 'confirmed' WHERE booking_status = 'attended'");
            DB::statement("ALTER TABLE bookings MODIFY COLUMN booking_status ENUM('pending','confirmed','cancelled','refunded') NOT NULL DEFAULT 'pending'");
        } elseif ($driver === 'pgsql') {
            DB::statement("UPDATE bookings SET booking_status = 'confirmed' WHERE booking_status = 'attended'");
            DB::statement('ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_booking_status_check');
            DB::statement("ALTER TABLE bookings ADD CONSTRAINT bookings_booking_status_check CHECK ((booking_status)::text = ANY (ARRAY['pending'::text, 'confirmed'::text, 'cancelled'::text, 'refunded'::text]))");
        }
    }
};
