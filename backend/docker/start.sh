#!/bin/sh
set -e

# Render injects PORT — default to 8080 if not set
export PORT="${PORT:-8080}"

echo "==> Starting Global Talent Media Hub (port: $PORT)"

# Generate nginx config with correct PORT
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

cd /var/www/html

# Cache config for production speed
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Run any pending migrations
php artisan migrate --force

# Create storage symlink (safe if already exists)
php artisan storage:link || true

# Set permissions after copy
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

echo "==> Launching supervisor (nginx + php-fpm)"
exec /usr/bin/supervisord -c /etc/supervisord.conf
