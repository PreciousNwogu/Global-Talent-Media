# Troubleshooting: Events Not Showing

## Quick Checks

### 1. Check if Events Exist in Database
Visit: `http://localhost:8000/api/debug/events`

This will show:
- Total event count
- Published events count
- Upcoming events count
- All events with their status

### 2. Check Browser Console
Open browser DevTools (F12) and check the Console tab for errors:
- CORS errors
- Network errors
- API errors

### 3. Check API Response
Visit directly in browser: `http://localhost:8000/api/events`

Should return JSON with events array.

## Common Issues

### Issue 1: Events Not Published
**Symptom**: Events exist but status is 'draft'

**Solution**: Check events table:
```sql
SELECT id, title, status, starts_at FROM events;
```

Update events to published:
```sql
UPDATE events SET status = 'published' WHERE status = 'draft';
```

Or run seeder again (it should update existing events).

### Issue 2: Events Are in the Past
**Symptom**: Events exist but `starts_at` date is before today

**Solution**: The API filters out past events by default. Either:
1. Check event dates in database
2. Include past events by calling: `/api/events?include_past=true`

### Issue 3: CORS Error
**Symptom**: Console shows CORS error

**Solution**: Check `backend/config/cors.php`:
```php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:5173'], // Your frontend URL
```

### Issue 4: API Base URL Wrong
**Symptom**: Network request fails

**Solution**: Check `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Issue 5: Backend Not Running
**Symptom**: Connection refused error

**Solution**: Start Laravel server:
```bash
cd backend
php artisan serve
```

Should be running on `http://localhost:8000`

## Debug Steps

1. **Check database directly:**
   ```bash
   php artisan tinker
   >>> App\Models\Event::count()
   >>> App\Models\Event::where('status', 'published')->count()
   >>> App\Models\Event::published()->upcoming()->count()
   ```

2. **Test API endpoint directly:**
   ```bash
   curl http://localhost:8000/api/events
   ```
   Or visit in browser: `http://localhost:8000/api/events`

3. **Check frontend API calls:**
   - Open browser DevTools → Network tab
   - Refresh the page
   - Look for `/api/events` request
   - Check response status and data

4. **Check Laravel logs:**
   ```bash
   tail -f backend/storage/logs/laravel.log
   ```

## Quick Fix

If events exist but aren't showing, try this SQL:
```sql
-- Check current events
SELECT id, title, status, starts_at, ends_at FROM events;

-- Update all to published (if needed)
UPDATE events SET status = 'published' WHERE status = 'draft';

-- Make sure dates are in future (if needed)
-- This updates events to start 2 months from now
UPDATE events SET starts_at = DATE_ADD(NOW(), INTERVAL 2 MONTH) WHERE starts_at < NOW();
```

## Testing

After fixing, test by:
1. Visit: `http://localhost:5173` (frontend)
2. Visit: `http://localhost:8000/api/debug/events` (check events)
3. Visit: `http://localhost:8000/api/events` (check API response)

