# File Upload Setup Guide

## What's Been Implemented

Both URL and file upload options are now available for event images!

### Features Added:
1. **File Upload API** - Backend endpoints to handle image uploads
2. **Image Upload UI** - Frontend component with file picker
3. **Image Preview** - Preview uploaded images before saving
4. **Dual Options** - Choose between uploading files or using URLs

## How to Use

### Option 1: Upload from Computer
1. Click "Choose File" or "Upload from Computer"
2. Select an image file (JPEG, PNG, JPG, GIF, WEBP - max 5MB)
3. Image will upload automatically
4. Preview will appear once uploaded
5. The URL is automatically filled in

### Option 2: Use Image URL
1. Paste an image URL in the "Or Paste Image URL" field
2. Preview will appear automatically
3. Works with any publicly accessible image URL

## Setup Required

### 1. Create Storage Link (Important!)

Run this command to create a symbolic link for file storage:

```bash
cd backend
php artisan storage:link
```

This creates a link from `public/storage` to `storage/app/public`, allowing uploaded files to be accessible via HTTP.

### 2. Verify Storage Configuration

The files are stored in: `backend/storage/app/public/events/`

Make sure the `storage/app/public` directory exists and is writable:

```bash
cd backend
mkdir -p storage/app/public/events
chmod -R 775 storage/app/public
```

### 3. Environment Check

The upload functionality uses Laravel's default filesystem driver (`local`). For production, you may want to use:
- AWS S3
- Cloudinary
- DigitalOcean Spaces
- Or any other cloud storage service

## File Storage Location

- **Local Storage**: `backend/storage/app/public/events/`
- **Public URL**: `http://your-domain/storage/events/filename.jpg`
- **Database**: Stores the full URL path

## API Endpoints

### Upload Single Image
- **POST** `/api/upload/image`
- **Auth**: Required (Bearer token)
- **Body**: Form-data with `image` field
- **Response**: 
  ```json
  {
    "url": "http://localhost/storage/events/uuid.jpg",
    "path": "public/events/uuid.jpg",
    "filename": "events/uuid.jpg"
  }
  ```

### Upload Multiple Images
- **POST** `/api/upload/images`
- **Auth**: Required (Bearer token)
- **Body**: Form-data with `images[]` array
- **Response**: 
  ```json
  {
    "urls": [
      "http://localhost/storage/events/uuid1.jpg",
      "http://localhost/storage/events/uuid2.jpg"
    ]
  }
  ```

## Security Features

- ✅ **Authentication Required** - Only logged-in admins can upload
- ✅ **File Type Validation** - Only images allowed (JPEG, PNG, JPG, GIF, WEBP)
- ✅ **File Size Limit** - Maximum 5MB per file
- ✅ **Unique Filenames** - UUIDs prevent filename conflicts
- ✅ **Secure Storage** - Files stored outside public directory initially

## Troubleshooting

### Files Not Showing After Upload

1. **Check Storage Link**:
   ```bash
   cd backend
   php artisan storage:link
   ```

2. **Check Permissions**:
   ```bash
   chmod -R 775 storage/app/public
   chmod -R 775 storage/logs
   ```

3. **Verify URL in Response**: Check the `url` field in the API response matches your domain

4. **Check .env**: Make sure `APP_URL` is set correctly

### Upload Fails

- Check file size (max 5MB)
- Check file type (images only)
- Check authentication token
- Check server disk space
- Check Laravel logs: `backend/storage/logs/laravel.log`

## Next Steps (Optional Enhancements)

1. **Video Upload** - Add video file upload support
2. **Image Optimization** - Compress/resize images on upload
3. **Cloud Storage** - Integrate AWS S3 or Cloudinary
4. **Image Gallery** - Upload multiple images for gallery
5. **Image Cropping** - Add image cropping/editing before upload
6. **Progress Bar** - Show upload progress for large files

## Notes

- Videos still use URLs only (YouTube, Vimeo embeds work best)
- Gallery images can be added via the `gallery_images` field (array of URLs)
- Uploaded files persist even if event is deleted (consider cleanup job)
- For production, move to cloud storage (S3, Cloudinary) for better performance

