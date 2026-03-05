<?php

namespace App\Filament\Widgets;

use App\Models\Booking;
use App\Models\Event;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $totalRevenue = Booking::where('payment_status', 'paid')->sum('total_amount');
        $confirmedBookings = Booking::where('booking_status', 'confirmed')->count();
        $publishedEvents = Event::where('status', 'published')->count();

        return [
            Stat::make('Published Events', $publishedEvents)
                ->description('Total: ' . Event::count())
                ->descriptionIcon('heroicon-m-calendar')
                ->color('success'),

            Stat::make('Confirmed Bookings', $confirmedBookings)
                ->description('Total: ' . Booking::count())
                ->descriptionIcon('heroicon-m-ticket')
                ->color('info'),

            Stat::make('Total Revenue', '$' . number_format($totalRevenue, 2))
                ->description('From paid bookings')
                ->descriptionIcon('heroicon-m-currency-dollar')
                ->color('warning'),

            Stat::make('Registered Users', User::count())
                ->description('Admins: ' . User::where('is_admin', true)->count())
                ->descriptionIcon('heroicon-m-users')
                ->color('primary'),
        ];
    }
}
