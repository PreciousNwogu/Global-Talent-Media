#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PHP_TMP="$ROOT_DIR/storage/app/php-temp"

PHP_CMD="php"
if ! command -v "$PHP_CMD" >/dev/null 2>&1; then
  if [[ -x "/c/Users/nwogu/.config/herd/bin/php83/php.exe" ]]; then
    PHP_CMD="/c/Users/nwogu/.config/herd/bin/php83/php.exe"
  else
    echo "PHP executable not found. Add php to PATH or set PHP_CMD in this script."
    exit 1
  fi
fi

mkdir -p "$PHP_TMP"
export TMPDIR="$PHP_TMP"
export TMP="$PHP_TMP"
export TEMP="$PHP_TMP"

echo "Using temp dir: $PHP_TMP"
echo "Starting Laravel with upload-safe limits..."

"$PHP_CMD" \
  -d upload_tmp_dir="$PHP_TMP" \
  -d sys_temp_dir="$PHP_TMP" \
  -d upload_max_filesize=200M \
  -d post_max_size=210M \
  -d memory_limit=512M \
  -d display_errors=Off \
  -d html_errors=Off \
  artisan serve --host=127.0.0.1 --port=8000
