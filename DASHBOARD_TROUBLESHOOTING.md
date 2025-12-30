# Dashboard Troubleshooting Guide

If the dashboard page is showing nothing (blank page), follow these steps:

## 1. Check Browser Console

Open your browser's Developer Tools (F12) and check the Console tab for any JavaScript errors.

Common errors to look for:
- `401 Unauthorized` - Authentication token missing or invalid
- `404 Not Found` - API endpoint doesn't exist
- `500 Internal Server Error` - Backend error
- `Network Error` - CORS or connection issue

## 2. Check Network Tab

In Developer Tools, go to the Network tab and:
1. Refresh the dashboard page
2. Look for requests to `/api/admin/dashboard/stats` and `/api/admin/dashboard/revenue`
3. Check their status codes:
   - 200 = Success
   - 401 = Authentication failed (need to login)
   - 404 = Route not found
   - 500 = Server error

## 3. Verify Authentication

Make sure you're logged in:
1. Check if `auth_token` exists in localStorage:
   - Open DevTools → Application/Storage → Local Storage
   - Look for `auth_token` key
2. If missing, go to `/admin/login` and login again

## 4. Check Backend Server

Make sure the backend is running:
```bash
cd backend
php artisan serve
```

## 5. Test API Endpoints Directly

You can test the API endpoints using curl or Postman:

```bash
# First, login to get a token
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@globaltalentmedia.com","password":"password"}'

# Use the token from the response, then test dashboard stats
curl -X GET http://localhost:8000/api/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

## 6. Common Issues and Solutions

### Issue: "401 Unauthorized"
**Solution:** 
- Make sure you're logged in
- Check that the token is being sent in the Authorization header
- Token might have expired, try logging out and back in

### Issue: "404 Not Found"
**Solution:**
- Check that the backend routes are registered
- Verify the API base URL is correct in `.env` file
- Check `backend/routes/api.php` has the admin routes

### Issue: Dashboard shows but all values are 0 or empty
**Solution:**
- This is normal if there's no data in the database
- Try creating some events and bookings to see data
- Check that database has records in `events`, `bookings`, and `payments` tables

### Issue: Blank page (nothing renders)
**Solution:**
- Check browser console for JavaScript errors
- Make sure React is loading properly
- Verify all imports are correct
- Check that the component is being rendered (add a console.log)

## 7. Debug Mode

To see what data is being returned, check the browser console. The Dashboard component now logs:
- Stats response data
- Revenue response data
- Any errors that occur

## 8. Quick Test

Add this temporary code to Dashboard.jsx to verify the component renders:

```jsx
useEffect(() => {
  console.log('Dashboard component mounted');
  console.log('Stats:', stats);
  console.log('Revenue:', revenue);
  console.log('Loading:', loading);
  console.log('Error:', error);
}, [stats, revenue, loading, error]);
```

## 9. Check Database

If the API returns 200 but with empty data, check your database:

```sql
-- Check if tables have data
SELECT COUNT(*) FROM events;
SELECT COUNT(*) FROM bookings;
SELECT COUNT(*) FROM payments;

-- Check if admin user exists
SELECT * FROM users WHERE email = 'admin@globaltalentmedia.com';
```

## 10. Still Not Working?

If none of the above works:
1. Check the browser console for detailed error messages
2. Check the Network tab for failed API calls
3. Verify the backend logs for any errors
4. Make sure all dependencies are installed (`npm install` in frontend)
5. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

