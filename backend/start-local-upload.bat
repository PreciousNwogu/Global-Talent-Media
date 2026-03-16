@echo off
setlocal

set "ROOT=%~dp0"
set "PHP_TMP=%ROOT%storage\app\php-temp"

if not exist "%PHP_TMP%" mkdir "%PHP_TMP%"

set "TMP=%PHP_TMP%"
set "TEMP=%PHP_TMP%"

echo Using temp dir: %PHP_TMP%
echo Starting Laravel with upload-safe limits...

php -d upload_tmp_dir="%PHP_TMP%" -d sys_temp_dir="%PHP_TMP%" -d upload_max_filesize=200M -d post_max_size=210M -d memory_limit=512M -d display_errors=Off -d html_errors=Off artisan serve --host=127.0.0.1 --port=8000
