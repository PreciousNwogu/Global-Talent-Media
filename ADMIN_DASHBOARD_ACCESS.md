# Admin Dashboard Access

## Current Status

The admin dashboard **frontend is NOT built yet**. Here's what exists:

### ✅ What EXISTS:
- **Backend API Endpoints** - All admin routes are created
- **Admin Controllers** - EventManagement, BookingManagement, Dashboard
- **API Routes** - `/api/admin/*` endpoints
- **Authentication** - Routes require `auth:sanctum` middleware

### ❌ What's MISSING:
- **Admin Login Page** - Frontend login interface
- **Admin Dashboard UI** - No dashboard pages built
- **Event Management UI** - No forms/interface to manage events
- **Booking Management UI** - No interface to view/manage bookings

### Current Admin Route:
- `/admin` - Just shows "Admin Dashboard - Coming Soon" placeholder

---

## How to Access Admin (Currently)

### Option 1: Direct API Access (Testing)
You can test admin endpoints directly using tools like Postman or curl:

1. **Get auth token** (if you have login endpoint):
   ```bash
   curl -X POST http://localhost:8000/api/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@globaltalentmedia.com","password":"your_password"}'
   ```

2. **Use token to access admin endpoints**:
   ```bash
   curl http://localhost:8000/api/admin/dashboard/stats \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Option 2: Build Admin Dashboard (Recommended)

Would you like me to build the admin dashboard? It would include:

1. **Admin Login Page** (`/admin/login`)
2. **Dashboard Overview** (`/admin/dashboard`)
   - Statistics cards
   - Revenue charts
   - Recent bookings
3. **Event Management** (`/admin/events`)
   - List all events
   - Create/edit/delete events
   - Publish/unpublish events
4. **Booking Management** (`/admin/bookings`)
   - View all bookings
   - Filter bookings
   - Export bookings
   - Update booking status

---

## Available Admin API Endpoints

All require authentication (`Bearer token`):

### Dashboard:
- `GET /api/admin/dashboard/stats` - Get statistics
- `GET /api/admin/dashboard/revenue` - Get revenue analytics

### Events:
- `GET /api/admin/events` - List all events
- `POST /api/admin/events` - Create event
- `GET /api/admin/events/{id}` - Get event
- `PUT /api/admin/events/{id}` - Update event
- `DELETE /api/admin/events/{id}` - Delete event
- `POST /api/admin/events/{id}/publish` - Publish event
- `POST /api/admin/events/{id}/unpublish` - Unpublish event

### Bookings:
- `GET /api/admin/bookings` - List all bookings
- `GET /api/admin/bookings/{id}` - Get booking details
- `PUT /api/admin/bookings/{id}` - Update booking
- `POST /api/admin/bookings/export` - Export bookings

---

## Quick Access Info

**Default Admin User** (from seeder):
- Email: `admin@globaltalentmedia.com`
- Password: `password` (default, should be changed!)

**Note**: You'll need to log in through the API first to get a token, then use that token for admin endpoints.

---

Would you like me to build the admin dashboard UI? It would make managing events and bookings much easier!

