# Global Talent Media Hub Ltd - Implementation Guide
## Making Your Website Most Functional

This guide provides detailed recommendations for implementing a fully functional event booking web application based on your WBS document.

---

## Table of Contents
1. [Core Functionality Requirements](#core-functionality-requirements)
2. [Architecture Recommendations](#architecture-recommendations)
3. [Database Schema Design](#database-schema-design)
4. [API Endpoints Design](#api-endpoints-design)
5. [Frontend Structure](#frontend-structure)
6. [Payment Integration Strategy](#payment-integration-strategy)
7. [CMS/Admin Dashboard Features](#cmsadmin-dashboard-features)
8. [Security Best Practices](#security-best-practices)
9. [Performance Optimization](#performance-optimization)
10. [Implementation Priority](#implementation-priority)

---

## Core Functionality Requirements

### 1. Event Management
**Critical Features:**
- ✅ **Event CRUD Operations** (Create, Read, Update, Delete)
- ✅ **Event Categories/Tags** for organization
- ✅ **Event Search & Filtering** (by date, category, location, price)
- ✅ **Event Details Page** with:
  - Title, description, date/time, location
  - Price, capacity, available tickets
  - Cover image, gallery
  - Terms & conditions
- ✅ **Featured Events** section on homepage
- ✅ **Upcoming Events** listing
- ✅ **Past Events** archive (optional)

**Enhanced Features:**
- Event status (draft, published, cancelled, sold-out)
- Multiple ticket types per event (VIP, Standard, Early Bird)
- Event waitlist for sold-out events
- Event sharing (social media integration)
- Event recommendations based on user preferences

### 2. Booking System
**Critical Features:**
- ✅ **Ticket Selection** (quantity, ticket type)
- ✅ **Customer Information Collection** (name, email, phone)
- ✅ **Booking Confirmation** (email + on-screen)
- ✅ **Booking Management** (view, cancel bookings)
- ✅ **Ticket Availability Checking** (real-time)
- ✅ **Booking Status Tracking** (pending, confirmed, cancelled)

**Enhanced Features:**
- Guest checkout option (no account required)
- User accounts for returning customers
- Booking history in user profile
- Booking modifications (upgrade/downgrade tickets)
- Group booking discounts
- Promo code/voucher system

### 3. Payment Integration
**Critical Features:**
- ✅ **Stripe Integration** (as per WBS)
- ✅ **Secure Payment Processing**
- ✅ **Payment Status Tracking**
- ✅ **Refund Handling**
- ✅ **Receipt Generation** (PDF/Email)

**Enhanced Features:**
- Multiple payment methods (Card, PayPal, Bank Transfer)
- Payment plans/installments for high-value events
- Payment gateway webhook handling
- Automatic refund processing for cancelled events
- Payment receipts in user account

### 4. CMS/Admin Dashboard
**Critical Features:**
- ✅ **Admin Authentication** (secure login)
- ✅ **Event Management Interface**
  - Create/edit/delete events
  - Upload images
  - Set pricing and capacity
  - Publish/unpublish events
- ✅ **Booking Management**
  - View all bookings
  - Filter/search bookings
  - Export bookings (CSV/Excel)
  - Mark attendance
- ✅ **Content Management**
  - Edit homepage content
  - Manage categories
  - Update site settings

**Enhanced Features:**
- Dashboard analytics (revenue, bookings, popular events)
- Email notifications management
- User management (roles: admin, staff, customer)
- Bulk operations (bulk email, bulk status update)
- Activity logs/audit trail
- Content versioning

---

## Architecture Recommendations

### Backend (Laravel) Structure
```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── EventController.php
│   │   │   │   ├── BookingController.php
│   │   │   │   ├── PaymentController.php
│   │   │   │   └── CategoryController.php
│   │   │   └── Admin/
│   │   │       ├── DashboardController.php
│   │   │       ├── EventManagementController.php
│   │   │       └── BookingManagementController.php
│   │   ├── Models/
│   │   │   ├── Event.php
│   │   │   ├── Category.php
│   │   │   ├── Booking.php
│   │   │   ├── Ticket.php
│   │   │   ├── Payment.php
│   │   │   └── User.php
│   │   └── Services/
│   │       ├── PaymentService.php
│   │       ├── EmailService.php
│   │       └── BookingService.php
│   └── Jobs/
│       ├── SendBookingConfirmation.php
│       └── ProcessRefund.php
├── database/
│   └── migrations/
│       ├── create_categories_table.php
│       ├── create_events_table.php
│       ├── create_bookings_table.php
│       ├── create_tickets_table.php
│       └── create_payments_table.php
└── routes/
    └── api.php
```

### Frontend (React) Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Loading.jsx
│   │   ├── events/
│   │   │   ├── EventCard.jsx
│   │   │   ├── EventList.jsx
│   │   │   ├── EventDetail.jsx
│   │   │   └── EventFilters.jsx
│   │   ├── booking/
│   │   │   ├── BookingForm.jsx
│   │   │   ├── TicketSelector.jsx
│   │   │   └── BookingSummary.jsx
│   │   └── admin/
│   │       ├── Dashboard.jsx
│   │       ├── EventManager.jsx
│   │       └── BookingManager.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Events.jsx
│   │   ├── EventDetail.jsx
│   │   ├── Booking.jsx
│   │   ├── BookingConfirmation.jsx
│   │   └── Admin/
│   │       ├── Dashboard.jsx
│   │       ├── Events.jsx
│   │       └── Bookings.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── stripe.js
│   ├── context/
│   │   └── AuthContext.jsx
│   └── utils/
│       ├── dateFormatter.js
│       └── currencyFormatter.js
```

---

## Database Schema Design

### Categories Table
```sql
- id (primary key)
- name (string, unique)
- slug (string, unique, indexed)
- description (text, nullable)
- created_at, updated_at
```

### Events Table
```sql
- id (primary key)
- title (string)
- slug (string, unique, indexed)
- description (text)
- short_description (text)
- category_id (foreign key -> categories)
- location (string)
- venue_address (text, nullable)
- starts_at (datetime, indexed)
- ends_at (datetime, indexed)
- cover_image (string, nullable)
- gallery_images (json, nullable)
- price (decimal 10,2)
- capacity (integer)
- available_tickets (integer, computed)
- status (enum: draft, published, cancelled, sold_out)
- is_featured (boolean, default false)
- terms_and_conditions (text, nullable)
- created_by (foreign key -> users)
- created_at, updated_at
```

### Bookings Table
```sql
- id (primary key)
- booking_reference (string, unique, indexed) - e.g., "GTM-2026-001234"
- event_id (foreign key -> events)
- user_id (foreign key -> users, nullable) - for guest bookings
- customer_name (string)
- customer_email (string, indexed)
- customer_phone (string, nullable)
- ticket_quantity (integer)
- ticket_type (string, nullable) - if multiple types
- total_amount (decimal 10,2)
- booking_status (enum: pending, confirmed, cancelled, refunded)
- payment_status (enum: pending, paid, failed, refunded)
- payment_id (foreign key -> payments, nullable)
- special_requests (text, nullable)
- created_at, updated_at
```

### Payments Table
```sql
- id (primary key)
- booking_id (foreign key -> bookings)
- stripe_payment_intent_id (string, unique, nullable)
- stripe_charge_id (string, nullable)
- amount (decimal 10,2)
- currency (string, default 'GBP')
- status (enum: pending, succeeded, failed, refunded)
- payment_method (string) - card, etc.
- refunded_amount (decimal 10,2, default 0)
- receipt_url (string, nullable)
- metadata (json, nullable)
- created_at, updated_at
```

### Additional Recommended Tables

**TicketTypes Table** (if multiple ticket types per event)
```sql
- id
- event_id (foreign key)
- name (string) - e.g., "VIP", "Standard"
- price (decimal)
- quantity_available (integer)
- description (text, nullable)
```

**PromoCodes Table** (optional enhancement)
```sql
- id
- code (string, unique)
- discount_type (enum: percentage, fixed)
- discount_value (decimal)
- min_purchase (decimal, nullable)
- max_discount (decimal, nullable)
- valid_from, valid_until
- usage_limit (integer, nullable)
- times_used (integer, default 0)
- is_active (boolean)
```

---

## API Endpoints Design

### Public Endpoints (No Authentication)
```
GET    /api/events              - List all published events (with filters)
GET    /api/events/{id}         - Get event details
GET    /api/events/{id}/bookings/availability - Check ticket availability
GET    /api/categories          - List all categories
POST   /api/bookings            - Create booking (guest checkout)
POST   /api/payments/intent     - Create payment intent (Stripe)
POST   /api/payments/confirm    - Confirm payment
```

### Authenticated User Endpoints
```
GET    /api/user/bookings       - Get user's bookings
GET    /api/user/bookings/{id}  - Get booking details
POST   /api/user/bookings/{id}/cancel - Cancel booking
GET    /api/user/profile        - Get user profile
PUT    /api/user/profile        - Update user profile
```

### Admin Endpoints (Admin Middleware)
```
# Events
GET    /api/admin/events        - List all events
POST   /api/admin/events        - Create event
GET    /api/admin/events/{id}   - Get event
PUT    /api/admin/events/{id}   - Update event
DELETE /api/admin/events/{id}   - Delete event
POST   /api/admin/events/{id}/publish - Publish event
POST   /api/admin/events/{id}/unpublish - Unpublish event

# Bookings
GET    /api/admin/bookings      - List all bookings (with filters)
GET    /api/admin/bookings/{id} - Get booking details
PUT    /api/admin/bookings/{id} - Update booking
POST   /api/admin/bookings/export - Export bookings (CSV)

# Dashboard
GET    /api/admin/dashboard/stats - Get dashboard statistics
GET    /api/admin/dashboard/revenue - Get revenue analytics

# Categories
GET    /api/admin/categories    - List all categories
POST   /api/admin/categories    - Create category
PUT    /api/admin/categories/{id} - Update category
DELETE /api/admin/categories/{id} - Delete category
```

---

## Frontend Structure

### Key Pages & Components

#### 1. Homepage (`/`)
**Components:**
- Hero section with featured event
- Featured events carousel
- Upcoming events grid
- Categories showcase
- Call-to-action sections

**Features:**
- Search bar (quick event search)
- Filter by date/category
- Responsive design (mobile-first)

#### 2. Events Listing Page (`/events`)
**Components:**
- Event filters sidebar (category, date range, price range)
- Event grid/list view toggle
- Pagination or infinite scroll
- Sort options (date, price, popularity)

**Features:**
- URL-based filtering (shareable filtered views)
- Loading states
- Empty states

#### 3. Event Detail Page (`/events/{slug}`)
**Components:**
- Event hero image
- Event information card
- Ticket selector
- Event description
- Location map (Google Maps/Mapbox)
- Related events

**Features:**
- Add to calendar (Google Calendar, iCal)
- Social sharing buttons
- Book now CTA

#### 4. Booking Page (`/bookings/new`)
**Components:**
- Event summary
- Ticket quantity selector
- Customer information form
- Payment form (Stripe Elements)
- Booking summary sidebar
- Terms & conditions checkbox

**Features:**
- Real-time availability check
- Form validation
- Loading states
- Error handling

#### 5. Booking Confirmation (`/bookings/{id}/confirmation`)
**Components:**
- Confirmation message
- Booking details
- Download ticket button
- Add to calendar
- Share booking

#### 6. Admin Dashboard (`/admin`)
**Sections:**
- Dashboard overview (stats, charts)
- Events management
- Bookings management
- Settings
- Profile

---

## Payment Integration Strategy

### Stripe Integration Flow

1. **Create Payment Intent**
   - User selects tickets → Frontend calls `/api/payments/intent`
   - Backend creates Stripe PaymentIntent
   - Returns `client_secret` to frontend

2. **Confirm Payment**
   - Frontend uses Stripe Elements to collect card details
   - Confirm payment with `client_secret`
   - On success → Frontend calls `/api/payments/confirm`
   - Backend updates booking status and sends confirmation email

3. **Webhook Handling**
   - Set up Stripe webhooks for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
   - Handle async payment status updates

### Implementation Checklist
- [ ] Install Laravel Cashier or Stripe PHP SDK
- [ ] Configure Stripe keys (publishable & secret)
- [ ] Create PaymentService class
- [ ] Implement payment intent creation
- [ ] Set up webhook endpoint
- [ ] Test with Stripe test cards
- [ ] Handle payment failures gracefully
- [ ] Implement refund functionality
- [ ] Generate receipts/invoices

---

## CMS/Admin Dashboard Features

### Dashboard Overview
- **Key Metrics Cards:**
  - Total revenue (today, week, month)
  - Total bookings
  - Active events
  - Upcoming events count

- **Charts:**
  - Revenue trend (line chart)
  - Bookings by event (bar chart)
  - Popular categories (pie chart)

### Event Management Interface
- **Event List View:**
  - Table with columns: Title, Date, Status, Bookings, Revenue, Actions
  - Quick filters (status, date range)
  - Search functionality
  - Bulk actions (publish, unpublish, delete)

- **Event Form:**
  - Rich text editor for description
  - Image upload (drag & drop)
  - Date/time picker
  - Price input with currency
  - Capacity settings
  - SEO fields (meta title, description)
  - Preview button

### Booking Management Interface
- **Bookings List:**
  - Table with: Reference, Event, Customer, Quantity, Amount, Status, Date
  - Filters (event, status, date range)
  - Export to CSV/Excel
  - Individual booking actions

- **Booking Detail View:**
  - Full customer information
  - Payment details
  - Ability to mark attendance
  - Send confirmation email
  - Cancel/refund options

---

## Security Best Practices

### Authentication & Authorization
- ✅ Use Laravel Sanctum for API authentication
- ✅ Implement role-based access control (RBAC)
- ✅ Use middleware to protect admin routes
- ✅ Enforce strong password policies
- ✅ Implement rate limiting on auth endpoints
- ✅ Use HTTPS in production

### Data Protection
- ✅ Sanitize all user inputs
- ✅ Use prepared statements (Laravel Eloquent handles this)
- ✅ Validate all API requests
- ✅ Encrypt sensitive data (payment info, PII)
- ✅ Implement CSRF protection
- ✅ Store payment data securely (use Stripe, don't store card details)

### API Security
- ✅ Implement API rate limiting
- ✅ Use API versioning (`/api/v1/...`)
- ✅ Validate request payloads
- ✅ Return appropriate HTTP status codes
- ✅ Don't expose sensitive error messages in production

---

## Performance Optimization

### Backend
- ✅ Implement database indexes (on frequently queried columns)
- ✅ Use eager loading (avoid N+1 queries)
- ✅ Implement caching (Redis/Memcached)
  - Cache event listings
  - Cache categories
- ✅ Optimize images (compress, use CDN)
- ✅ Use pagination for large datasets
- ✅ Implement query optimization

### Frontend
- ✅ Code splitting (React lazy loading)
- ✅ Image optimization (WebP format, lazy loading)
- ✅ Implement caching strategies
- ✅ Minimize bundle size
- ✅ Use a CDN for static assets
- ✅ Implement skeleton loaders (better UX than spinners)

### Database
- ✅ Add indexes on foreign keys
- ✅ Add indexes on frequently filtered columns (status, dates)
- ✅ Use database migrations properly
- ✅ Regular database optimization

---

## Implementation Priority

### Phase 1: Core MVP (Weeks 1-8)
**Must-have for launch:**
1. ✅ Database migrations (Events, Categories, Bookings, Payments)
2. ✅ Basic API endpoints (CRUD for events, create booking)
3. ✅ Frontend: Homepage, Events list, Event detail
4. ✅ Booking flow (without payment initially, or basic Stripe)
5. ✅ Admin: Event CRUD interface
6. ✅ Basic authentication

### Phase 2: Payment & Polish (Weeks 9-12)
**Essential for production:**
1. ✅ Full Stripe integration
2. ✅ Payment webhooks
3. ✅ Email notifications (booking confirmation, receipts)
4. ✅ Admin: Booking management
5. ✅ Frontend: Booking confirmation page
6. ✅ Error handling & validation

### Phase 3: Enhancement (Weeks 13-16)
**Nice-to-have:**
1. ✅ Admin dashboard with analytics
2. ✅ Advanced filtering/search
3. ✅ User accounts & booking history
4. ✅ Multiple ticket types
5. ✅ Promo codes
6. ✅ Image uploads & galleries
7. ✅ SEO optimization

---

## Recommended Tools & Libraries

### Backend (Laravel)
- **Stripe**: `stripe/stripe-php` or Laravel Cashier
- **Image Processing**: `intervention/image`
- **Excel Export**: `maatwebsite/excel`
- **Email**: Laravel Mail (with queue)
- **API Documentation**: Laravel API Resources

### Frontend (React)
- **Routing**: React Router v6
- **State Management**: Context API or Zustand (lightweight)
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **UI Components**: 
  - Tailwind CSS (styling)
  - Headless UI or Radix UI (components)
  - React Query (data fetching/caching)
- **Stripe**: `@stripe/stripe-js` & `@stripe/react-stripe-js`
- **Date Handling**: date-fns or dayjs
- **Charts**: Recharts or Chart.js

### Deployment
- **Backend**: Render.com (as per WBS)
- **Frontend**: Vercel (as per WBS)
- **Database**: PostgreSQL (production) or MySQL
- **File Storage**: AWS S3 or Cloudinary (for images)
- **Email**: SendGrid, Mailgun, or AWS SES

---

## Testing Strategy

### Backend Testing
- ✅ Unit tests for models and services
- ✅ Feature tests for API endpoints
- ✅ Test payment flows (use Stripe test mode)
- ✅ Test booking availability logic

### Frontend Testing
- ✅ Component tests (React Testing Library)
- ✅ Integration tests for booking flow
- ✅ E2E tests (Playwright or Cypress)

---

## Additional Feature Recommendations

### For Better User Experience
1. **Email Notifications:**
   - Booking confirmation
   - Event reminders (24h before)
   - Booking cancellation confirmation
   - Payment receipts

2. **Mobile App Considerations:**
   - Ensure responsive design
   - Consider PWA (Progressive Web App) features
   - Push notifications (future enhancement)

3. **Accessibility:**
   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader support
   - Alt text for images

4. **SEO:**
   - Meta tags for events
   - Structured data (JSON-LD) for events
   - Sitemap generation
   - SEO-friendly URLs (slugs)

5. **Analytics:**
   - Google Analytics integration
   - Track booking conversions
   - Monitor popular events
   - User behavior tracking

---

## Next Steps

1. **Review this guide** with your team
2. **Prioritize features** based on business needs
3. **Set up development environment**
4. **Create database migrations**
5. **Build API endpoints** (start with events)
6. **Develop frontend pages** (start with homepage)
7. **Integrate Stripe** payment
8. **Build admin dashboard**
9. **Test thoroughly**
10. **Deploy to staging**, then production

---

## Support & Resources

- Laravel Documentation: https://laravel.com/docs
- React Documentation: https://react.dev
- Stripe Documentation: https://stripe.com/docs
- Tailwind CSS: https://tailwindcss.com

---

**Prepared by:** Development Team  
**Last Updated:** 2025  
**Version:** 1.0

