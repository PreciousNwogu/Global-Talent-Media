# ─── Stage 1: Build React/Vite frontend ───────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

COPY frontend/ .

# Build with production API URL (injected at deploy time or fallback to /api)
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# ─── Stage 2: Composer dependencies ───────────────────────────────────────────
FROM composer:2.8 AS vendor

WORKDIR /app
COPY backend/composer.json backend/composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --optimize-autoloader \
    --ignore-platform-reqs \
    --no-scripts

# ─── Stage 3: Production image ────────────────────────────────────────────────
FROM php:8.3-fpm-alpine

LABEL maintainer="Global Talent Media Hub"

# ── Fast pre-compiled PHP extensions ──────────────────────────────────────────
ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN chmod +x /usr/local/bin/install-php-extensions

RUN apk add --no-cache nginx supervisor curl bash gettext \
    && install-php-extensions pdo_mysql pdo_pgsql gd bcmath opcache intl zip exif pcntl \
    && rm -rf /var/cache/apk/*

# ── PHP config ─────────────────────────────────────────────────────────────────
COPY backend/docker/php.ini $PHP_INI_DIR/conf.d/custom.ini

# ── Nginx + Supervisor configs ────────────────────────────────────────────────
COPY backend/docker/nginx.conf.template /etc/nginx/nginx.conf.template
COPY backend/docker/supervisord.conf    /etc/supervisord.conf

# ── Application code ──────────────────────────────────────────────────────────
WORKDIR /var/www/html

COPY --from=vendor /app/vendor ./vendor
COPY backend/ .

# ── Copy built React app into Laravel's public directory ──────────────────────
# React's index.html and assets land alongside Laravel's index.php
# Nginx serves index.html for SPA routes, index.php for API/admin routes
COPY --from=frontend-builder /app/dist/ ./public/

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
COPY backend/docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8080}/up || exit 1

CMD ["/start.sh"]
