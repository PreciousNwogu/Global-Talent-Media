<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Booking Received</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f5; margin: 0; padding: 0; }
    .wrapper { max-width: 640px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    .header { background: #111827; color: #fff; padding: 28px 34px; }
    .header h1 { margin: 0; font-size: 22px; }
    .header p { margin: 6px 0 0; opacity: .9; font-size: 13px; }
    .body { padding: 28px 34px; }
    .pill { display: inline-block; padding: 6px 10px; border-radius: 999px; font-size: 12px; background: #e0e7ff; color: #3730a3; font-weight: 700; }
    table.details { width: 100%; border-collapse: collapse; margin: 16px 0 22px; }
    table.details td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: top; }
    table.details td:first-child { color: #6b7280; width: 38%; }
    table.details td:last-child { color: #111827; font-weight: 600; text-align: right; }
    .btn { display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-weight: 700; }
    .footer { text-align: center; padding: 16px 34px 24px; color: #9ca3af; font-size: 12px; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>New booking received</h1>
    <p>Reference: {{ $booking->booking_reference }}</p>
  </div>

  <div class="body">
    <span class="pill">Action: Check payment status</span>

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
        <td>Customer</td>
        <td>{{ $booking->customer_name }}</td>
      </tr>
      <tr>
        <td>Email</td>
        <td>{{ $booking->customer_email }}</td>
      </tr>
      <tr>
        <td>Phone</td>
        <td>{{ $booking->customer_phone ?: 'N/A' }}</td>
      </tr>
      <tr>
        <td>Tickets</td>
        <td>{{ $booking->ticket_quantity }}</td>
      </tr>
      <tr>
        <td>Total Amount</td>
        <td>GBP {{ number_format($booking->total_amount, 2) }}</td>
      </tr>
      <tr>
        <td>Booking Status</td>
        <td>{{ ucfirst($booking->booking_status) }}</td>
      </tr>
      <tr>
        <td>Payment Status</td>
        <td>{{ ucfirst($booking->payment_status) }}</td>
      </tr>
    </table>

    <a href="{{ rtrim(env('APP_URL', 'http://localhost'), '/') }}/admin" class="btn">Open Admin Panel</a>
  </div>

  <div class="footer">
    &copy; {{ date('Y') }} Global Talent Media Hub
  </div>
</div>
</body>
</html>
