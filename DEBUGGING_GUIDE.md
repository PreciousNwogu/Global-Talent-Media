# Debugging: Events Not Showing on Frontend

## Steps to Debug

### 1. Check Browser Console
Open DevTools (F12) and check the Console tab. You should see:
- `Featured events: [...]` - array of featured events
- `Upcoming events: [...]` - array of upcoming events
- `Events loaded: X [...]` - on events page

### 2. Check Network Tab
1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Look for `/api/events` request
4. Click on it and check:
   - **Status**: Should be 200
   - **Response**: Should show JSON with events
   - **Preview**: Should show the data structure

### 3. Expected API Response Structure

The API returns paginated data:
```json
{
  "data": [
    {
      "id": 1,
      "title": "Event Title",
      "cover_image": "...",
      "category": {...},
      ...
    }
  ],
  "current_page": 1,
  "per_page": 12,
  ...
}
```

The frontend extracts `response.data.data` for the events array.

### 4. Check Event Data Structure

In browser console, after events load, check:
```javascript
// In console
console.log(featuredEvents);
console.log(upcomingEvents);
```

Each event should have:
- `id`
- `title`
- `cover_image`
- `category` (object with `name`)
- `starts_at`
- `location`
- `price`
- `available_tickets`

### 5. Common Issues

#### Issue: Empty Array
**Symptom**: Console shows `Featured events: []` or `Upcoming events: []`

**Possible Causes**:
1. Events not published (check API directly: `http://localhost:8000/api/events`)
2. Events are in the past (API filters by `upcoming()`)
3. No events match the filters

**Solution**: 
- Visit `http://localhost:8000/api/debug/events` to see all events
- Check event status and dates

#### Issue: Events Array but Not Rendering
**Symptom**: Console shows events array, but UI is blank

**Possible Causes**:
1. Event data structure mismatch
2. Missing required fields
3. JavaScript errors preventing render

**Solution**: Check console for errors, verify event structure matches EventCard expectations

#### Issue: API Returns Data but Frontend Gets Empty
**Symptom**: Direct API call works, but frontend shows empty

**Possible Causes**:
1. CORS issue (check Network tab for CORS errors)
2. Response parsing issue
3. Data structure mismatch

**Solution**: Check Network tab response vs what frontend receives

### 6. Quick Fixes

**Force re-render**:
- Hard refresh: Ctrl+Shift+R
- Clear browser cache

**Check API directly**:
```bash
curl http://localhost:8000/api/events
```

**Check events count**:
```bash
cd backend
php artisan tinker
>>> App\Models\Event::published()->upcoming()->count()
```

### 7. Add More Debugging

If events still don't show, add this to Home.jsx after loadEvents:

```javascript
console.log('Full API response:', featuredResponse);
console.log('Response data:', featuredResponse.data);
console.log('Extracted events:', featuredArray);
```

This will help identify where the data is getting lost.

