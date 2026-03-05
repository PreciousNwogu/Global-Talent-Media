# ─── Stage 1: Composer dependencies ───────────────────────────────────────────
FROM composer:2.8 AS vendor

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --optimize-autoloader \
    --ignore-platform-reqs

# ─── Stage 2: Production image ────────────────────────────────────────────────
FROM php:8.3-fpm-alpine

LABEL maintainer="Global Talent Media Hub"

# ── System dependencies ────────────────────────────────────────────────────────
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    zip \
    unzip \
    git \
    bash \
    gettext \
    # MySQL / PDO
    && docker-php-ext-install pdo pdo_mysql \
    # Image processing (Filament)
    && apk add --no-cache freetype libpng libjpeg-turbo freetype-dev libpng-dev libjpeg-turbo-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd \
    # Other required extensions
    && docker-php-ext-install bcmath opcache intl zip exif pcntl \
    # Redis (optional – comment out if not using Redis)
    && apk add --no-cache $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del $PHPIZE_DEPS \
    # Cleanup
    && rm -rf /var/cache/apk/*

# ── PHP config ─────────────────────────────────────────────────────────────────
COPY docker/php.ini $PHP_INI_DIR/conf.d/custom.ini

# ── Nginx + Supervisor configs ────────────────────────────────────────────────
COPY docker/nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker/supervisord.conf    /etc/supervisord.conf

# ── Application code ──────────────────────────────────────────────────────────
WORKDIR /var/www/html

COPY --from=vendor /app/vendor ./vendor
COPY . .

# ── Permissions ───────────────────────────────────────────────────────────────
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 storage bootstrap/cache \
    && mkdir -p storage/app/public/events/covers \
               storage/app/public/events/videos \
               storage/app/public/livewire-tmp \
               storage/logs \
               storage/framework/cache \
               storage/framework/sessions \
               storage/framework/views

# ── Startup script ────────────────────────────────────────────────────────────
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

# ── Expose & health check ─────────────────────────────────────────────────────
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8080}/up || exit 1

CMD ["/start.sh"]
