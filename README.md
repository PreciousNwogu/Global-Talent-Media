# Global Talent Media Hub

A web application for event promotion, bookings, and payments with a simple CMS for content updates.

## Project Overview

- **Project Name**: Global Talent Media Hub Ltd – Web App
- **Goal**: A web application for event promotion, bookings, and payments with a simple CMS for content updates.
- **Location**: United Kingdom
- **Timeline**: February – March 2026

## Tech Stack

### Backend
- Laravel 12
- PHP 8.2+
- MySQL/PostgreSQL
- Laravel Sanctum (Authentication)

### Frontend
- React 19
- Vite
- React Router
- Axios
- Tailwind CSS
- date-fns

## Features

- ✅ Event listing and management
- ✅ Event detail pages with image/video galleries
- ✅ Booking system
- ✅ Bank transfer payment integration
- ✅ Category management
- ✅ Featured events
- ✅ Responsive design

## Setup

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   composer install
   ```

3. Copy environment file:
   ```bash
   cp .env.example .env
   ```

4. Generate application key:
   ```bash
   php artisan key:generate
   ```

5. Configure database in `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=global_talent_media
   DB_USERNAME=root
   DB_PASSWORD=
   ```

6. Run migrations:
   ```bash
   php artisan migrate
   ```

7. Seed database (optional):
   ```bash
   php artisan db:seed
   ```

8. Start server:
   ```bash
   php artisan serve
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Public Endpoints
- `GET /api/events` - List published events
- `GET /api/events/{id}` - Get event details
- `GET /api/categories` - List categories
- `POST /api/bookings` - Create booking
- `POST /api/payments/bank-details` - Get bank transfer details

### Admin Endpoints (Requires Authentication)
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/events` - List all events
- `POST /api/admin/events` - Create event
- `PUT /api/admin/events/{id}` - Update event
- `DELETE /api/admin/events/{id}` - Delete event

See `IMPLEMENTATION_GUIDE.md` for complete API documentation.

## Documentation

- `IMPLEMENTATION_GUIDE.md` - Complete implementation guide
- `IMPLEMENTATION_CHECKLIST.md` - Step-by-step checklist
- `SEED_EVENTS_INSTRUCTIONS.md` - How to seed sample events
- `FRONTEND_SETUP.md` - Frontend setup guide

## License

Copyright © 2025 Global Talent Media Hub Ltd

