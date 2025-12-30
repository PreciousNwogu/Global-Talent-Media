# Image Upload Error Troubleshooting

## Common Issues and Solutions

### 1. Check Browser Console
Open Developer Tools (F12) → Console tab and look for:
- Network errors (401, 403, 404, 500)
- CORS errors
- Authentication errors

### 2. Check Network Tab
In Developer Tools → Network tab:
- Find the `/api/upload/image` request
- Check the status code
- Check the response body for error details

### 3. Common Errors

#### Error: "Storage link not found"
**Solution:**
```bash
cd backend
php artisan storage:link
```

#### Error: "Directory not writable"
**Solution:**
```bash
cd backend
mkdir -p storage/app/public/events
chmod -R 775 storage/app/public
```

#### Error: "401 Unauthorized"
**Solution:**
- Make sure you're logged in
- Check that the auth token is being sent
- Try logging out and back in

#### Error: "File too large"
**Solution:**
- Maximum file size is 5MB
- Compress the image or use a smaller file

#### Error: "Invalid file type"
**Solution:**
- Only these formats are allowed: JPEG, PNG, JPG, GIF, WEBP
- Convert your image to one of these formats

### 4. Verify Storage Setup

1. **Check if storage link exists:**
   ```bash
   ls -la backend/public/storage
   ```
   Should show a symlink to `../storage/app/public`

2. **Create storage link manually if needed:**
   ```bash
   cd backend
   php artisan storage:link
   ```

3. **Check directory permissions:**
   ```bash
   cd backend
   chmod -R 775 storage/app/public
   ```

### 5. Test Upload Endpoint Directly

Use curl or Postman to test:

```bash
curl -X POST http://localhost:8000/api/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/your/image.jpg"
```

### 6. Check Laravel Logs

```bash
cd backend
tail -f storage/logs/laravel.log
```

Then try uploading an image and watch for errors.

### 7. Verify .env Settings

Make sure in `backend/.env`:
```
APP_URL=http://localhost:8000
FILESYSTEM_DISK=local
```

### 8. Quick Fixes

**If nothing works, try:**
1. Clear Laravel cache:
   ```bash
   cd backend
   php artisan cache:clear
   php artisan config:clear
   ```

2. Restart the backend server

3. Hard refresh browser (Ctrl+Shift+R)

## Debug Steps

1. **Check the exact error message** in browser console
2. **Check Network tab** for the failed request
3. **Check Laravel logs** for backend errors
4. **Verify authentication** - make sure you're logged in
5. **Check file size and type** - must be < 5MB and image format

## Still Not Working?

Share:
- The exact error message from browser console
- The status code from Network tab
- Any errors from Laravel logs
- Screenshot of the error if possible

