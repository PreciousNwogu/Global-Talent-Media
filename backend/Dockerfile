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
    --ignore-platform-reqs \
    --no-scripts

# ─── Stage 2: Production image ────────────────────────────────────────────────
FROM php:8.3-fpm-alpine

LABEL maintainer="Global Talent Media Hub"

# ── Use install-php-extensions for fast pre-compiled extension installs ────────
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN chmod +x /usr/local/bin/install-php-extensions

# ── System packages + PHP extensions (pre-compiled — no source compilation) ───
RUN apk add --no-cache nginx supervisor curl bash gettext \
    && install-php-extensions pdo_mysql pdo_pgsql gd bcmath opcache intl zip exif pcntl \
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
