#!/bin/sh
# Render injects PORT — sub it into nginx config then start nginx
export PORT="${PORT:-8080}"
envsubst '${PORT}' < /etc/nginx/conf.d/app.conf | tee /etc/nginx/conf.d/app.conf.tmp \
  && mv /etc/nginx/conf.d/app.conf.tmp /etc/nginx/conf.d/app.conf
exec nginx -g "daemon off;"
