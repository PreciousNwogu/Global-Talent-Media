<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Cancelled</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f5; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    .header { background: #dc2626; color: #fff; padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p  { margin: 8px 0 0; opacity: .85; }
    .body { padding: 32px 40px; }
    .ref-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px; }
    .ref-box .ref { font-size: 22px; font-weight: bold; color: #dc2626; font-family: monospace; letter-spacing: 2px; }
    table.details { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    table.details td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    table.details td:first-child { color: #6b7280; width: 40%; }
    table.details td:last-child { font-weight: 600; color: #111827; text-align: right; }
    .notice { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 14px 16px; font-size: 13px; color: #166534; margin-bottom: 24px; }
    .btn { display: block; width: fit-content; margin: 0 auto 24px; background: #2563eb; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 15px; }
    .footer { text-align: center; padding: 20px 40px; font-size: 12px; color: #9ca3af; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>Booking Cancelled</h1>
    <p>Your booking has been cancelled, {{ $booking->customer_name }}</p>
  </div>
  <div class="body">
    <div class="ref-box">
      <p style="margin:0 0 4px; font-size:13px; color:#6b7280;">Cancelled booking reference</p>
      <div class="ref">{{ $booking->booking_reference }}</div>
    </div>

    <table class="details">
      <tr>
        <td>Event</td>
        <td>{{ $booking->event->title }}</td>
      </tr>
      <tr>
        <td>Date</td>
        <td>{{ \Carbon\Carbon::parse($booking->event->starts_at)->format('D, d M Y \a\t g:ia') }}</td>
      </tr>
      <tr>
        <td>Location</td>
        <td>{{ $booking->event->location }}</td>
      </tr>
      <tr>
        <td>Tickets</td>
        <td>{{ $booking->ticket_quantity }}</td>
      </tr>
    </table>

    @if($booking->payment_status === 'paid')
    <div class="notice">
      <strong>Refund notice:</strong> Since your booking was paid, a refund will be processed within 5–10 business days.
      Please contact support if you have any questions.
    </div>
    @else
    <div class="notice">
      No payment was taken for this booking, so no refund is due.
    </div>
    @endif

    <a href="{{ env('FRONTEND_URL', 'http://localhost:5173') }}/events" class="btn">
      Browse More Events
    </a>
  </div>
  <div class="footer">
    &copy; {{ date('Y') }} Global Talent Media Hub &mdash; All rights reserved
  </div>
</div>
</body>
</html>
