# How to Seed Events with Images and Videos

This guide explains how to populate your database with sample events that include images and videos.

## Steps to Run the Seeders

### 1. Run Migrations (if not already done)

First, make sure all migrations are run, including the new video_url migration:

```bash
cd backend
php artisan migrate
```

### 2. Run the Seeders

You can run the seeders in two ways:

#### Option A: Run All Seeders (Recommended)
This will seed categories and events together:

```bash
php artisan db:seed
```

#### Option B: Run Individual Seeders

```bash
# Seed categories first
php artisan db:seed --class=CategorySeeder

# Then seed events
php artisan db:seed --class=EventSeeder
```

### 3. Verify Events Were Created

You can check if events were created by:

1. **Using Tinker:**
   ```bash
   php artisan tinker
   >>> App\Models\Event::count()
   >>> App\Models\Event::with('category')->get()
   ```

2. **Check the database directly** using your database client

3. **View in the frontend** - Visit `http://localhost:5173/events` to see the events

## What Gets Created

### Categories (10 categories)
- Music & Concerts
- Technology
- Comedy
- Food & Drink
- Arts & Culture
- Wellness
- Business
- Fashion
- Film & Cinema
- Sports

### Events (10 events)
Each event includes:
- ✅ **Cover Image** - High-quality Unsplash image
- ✅ **Video URL** - YouTube embed URL (videos play in a slider)
- ✅ **Gallery Images** - Multiple additional images
- ✅ **Full Event Details** - Title, description, location, dates, pricing
- ✅ **Realistic Data** - Future dates, varying capacities, prices

**Event Types Created:**
1. London Music Festival 2026 (Featured)
2. Tech Innovation Summit 2026 (Featured)
3. Comedy Night Special
4. Food & Wine Festival
5. Art & Photography Exhibition
6. Yoga & Wellness Retreat
7. Business Networking Gala (Featured)
8. Jazz & Blues Night
9. Fashion Week Showcase (Featured)
10. Film Festival Opening Night

## Features

### Image Sources
- All images use **Unsplash** (free stock photos)
- Images are optimized with specific dimensions
- Fallback placeholders are handled in the frontend

### Video Support
- Videos are embedded YouTube URLs
- Videos appear as the first slide in the event detail slider
- Users can navigate between video and images

### Frontend Display
- **Event List Page** - Shows cover images in event cards
- **Event Detail Page** - Shows video/image slider with navigation
- **Homepage** - Displays featured events with images

## Resetting and Reseeding

If you want to start fresh:

```bash
# WARNING: This will delete all data
php artisan migrate:fresh --seed

# Or just reset events and categories
php artisan tinker
>>> App\Models\Event::truncate();
>>> App\Models\Category::truncate();
>>> exit

# Then run seeders again
php artisan db:seed
```

## Customizing Events

To add your own events, edit `backend/database/seeders/EventSeeder.php`:

1. Add a new event array to the `$events` array
2. Include:
   - `cover_image` - URL to image
   - `video_url` - YouTube embed URL (optional, format: `https://www.youtube.com/embed/VIDEO_ID`)
   - `gallery_images` - Array of image URLs
   - All other required event fields

## Image URLs Format

Use Unsplash URLs with specific dimensions:
```
https://images.unsplash.com/photo-PHOTO_ID?w=1200&h=600&fit=crop
```

For gallery images:
```
https://images.unsplash.com/photo-PHOTO_ID?w=800&h=600&fit=crop
```

## Video URLs Format

Use YouTube embed URLs:
```
https://www.youtube.com/embed/VIDEO_ID
```

To get the embed URL:
1. Go to a YouTube video
2. Click "Share" → "Embed"
3. Copy the `src` URL from the iframe code
4. Use that URL in the seeder

## Troubleshooting

### Images not showing
- Check if image URLs are accessible
- Check browser console for CORS errors
- Unsplash images should work without issues

### Videos not playing
- Verify YouTube embed URL format
- Check if video allows embedding
- Some videos may have embedding disabled

### Events not appearing
- Check if migrations ran successfully
- Verify seeder ran without errors
- Check event status is 'published'
- Check database directly

---

**After seeding, visit your frontend to see all the events with images and videos!** 🎉

