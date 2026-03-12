#!/bin/sh
set -e

# Render injects PORT — default to 8080 if not set
export PORT="${PORT:-8080}"

echo "==> Starting Global Talent Media Hub (port: $PORT)"

# Parse Render's DATABASE_URL into individual Laravel DB_* vars if DB_HOST is unset
# Render sets DATABASE_URL as: postgres://user:password@host:port/database
if [ -n "$DATABASE_URL" ] && [ -z "$DB_HOST" ]; then
    echo "==> Parsing DATABASE_URL into DB_* vars"
    # Strip the scheme
    _url="${DATABASE_URL#postgres://}"
    _url="${_url#postgresql://}"
    # Extract user:password
    _userinfo="${_url%%@*}"
    _rest="${_url#*@}"
    export DB_USERNAME="${_userinfo%%:*}"
    export DB_PASSWORD="${_userinfo#*:}"
    # Extract host:port/database
    _hostport="${_rest%%/*}"
    # Only split on colon if a port is actually present
    if echo "$_hostport" | grep -q ':'; then
        export DB_HOST="${_hostport%%:*}"
        export DB_PORT="${_hostport##*:}"
    else
        export DB_HOST="$_hostport"
        export DB_PORT="5432"
    fi
    export DB_DATABASE="${_rest#*/}"
    # Remove query string if any
    export DB_DATABASE="${DB_DATABASE%%\?*}"
    export DB_CONNECTION="${DB_CONNECTION:-pgsql}"
    echo "==> DB_HOST=$DB_HOST DB_PORT=$DB_PORT DB_DATABASE=$DB_DATABASE DB_CONNECTION=$DB_CONNECTION"
fi

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

# Seed database (safe — EventSeeder uses updateOrCreate, no duplicates)
php artisan db:seed --force

# Publish Filament assets
php artisan filament:assets || true

# Create storage symlink (safe if already exists)
php artisan storage:link || true

# Set permissions after copy
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

echo "==> Launching supervisor (nginx + php-fpm)"
exec /usr/bin/supervisord -c /etc/supervisord.conf
