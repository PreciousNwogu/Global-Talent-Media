# Frontend Environment Setup

## Issue
The frontend `.env` file is empty, so the API base URL is not configured.

## Solution

### Step 1: Create `.env` file in frontend directory

Create a file named `.env` in the `frontend/` directory with the following content:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Step 2: Restart the Frontend Dev Server

After creating the `.env` file, you need to restart the Vite dev server:

1. Stop the current dev server (Ctrl+C)
2. Start it again:
   ```bash
   cd frontend
   npm run dev
   ```

**Important**: Vite only reads `.env` files when the server starts, so you must restart it after creating/changing the `.env` file.

## Verify Setup

1. Check that `.env` file exists: `frontend/.env`
2. Check the content includes: `VITE_API_BASE_URL=http://localhost:8000/api`
3. Restart the dev server
4. Check browser console - API calls should now work

## Troubleshooting

If events still don't show after setting up `.env`:

1. **Make sure backend is running:**
   ```bash
   cd backend
   php artisan serve
   ```

2. **Test API directly:**
   Visit: `http://localhost:8000/api/events`

3. **Check CORS:**
   The CORS config has been updated to allow `http://localhost:5173`

4. **Clear browser cache:**
   Hard refresh (Ctrl+Shift+R) or clear cache

