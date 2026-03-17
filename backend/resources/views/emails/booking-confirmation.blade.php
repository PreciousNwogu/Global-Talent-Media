<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmed</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f5; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    .header { background: #2563eb; color: #fff; padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p  { margin: 8px 0 0; opacity: .85; }
    .body { padding: 32px 40px; }
    .ref-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px; }
    .ref-box .ref { font-size: 22px; font-weight: bold; color: #2563eb; font-family: monospace; letter-spacing: 2px; }
    table.details { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    table.details td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    table.details td:first-child { color: #6b7280; width: 40%; }
    table.details td:last-child { font-weight: 600; color: #111827; text-align: right; }
    .total td { border-bottom: none !important; font-size: 16px !important; }
    .total td:last-child { color: #2563eb !important; font-size: 18px !important; }
    .notice { background: #fefce8; border: 1px solid #fde68a; border-radius: 6px; padding: 14px 16px; font-size: 13px; color: #92400e; margin-bottom: 24px; }
    .btn { display: block; width: fit-content; margin: 0 auto 24px; background: #2563eb; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 15px; }
    .footer { text-align: center; padding: 20px 40px; font-size: 12px; color: #9ca3af; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>&#10003; Booking Confirmed!</h1>
    <p>Thank you for your booking, {{ $booking->customer_name }}</p>
  </div>
  <div class="body">
    <div class="ref-box">
      <p style="margin:0 0 4px; font-size:13px; color:#6b7280;">Your booking reference</p>
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
      <tr>
        <td>Email</td>
        <td>{{ $booking->customer_email }}</td>
      </tr>
      <tr class="total">
        <td>Total Amount</td>
        <td>£{{ number_format($booking->total_amount, 2) }}</td>
      </tr>
    </table>

    <div class="notice">
      <strong>Payment required:</strong> Please transfer <strong>£{{ number_format($booking->total_amount, 2) }}</strong> using
      reference <strong>{{ $booking->booking_reference }}</strong> to complete your booking.
      Your tickets will be confirmed once payment is received.
    </div>

    <a href="{{ config('app.frontend_url') }}/bookings/{{ $booking->booking_reference }}/confirmation" class="btn">
      View Booking &amp; Ticket
    </a>
  </div>
  <div class="footer">
    &copy; {{ date('Y') }} Global Talent Media Hub &mdash; All rights reserved
  </div>
</div>
</body>
</html>
