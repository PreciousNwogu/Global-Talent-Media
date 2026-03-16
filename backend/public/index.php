<?php

// Prevent PHP warnings/notices from being injected into AJAX/JSON responses.
// Errors are still logged via Laravel; Ignition handles debug pages.
ini_set('display_errors', '0');
ini_set('log_errors', '1');

$projectTempDir = __DIR__ . '/../storage/app/php-temp';

if (! is_dir($projectTempDir)) {
    @mkdir($projectTempDir, 0775, true);
}

if (is_dir($projectTempDir)) {
    putenv('TMP=' . $projectTempDir);
    putenv('TEMP=' . $projectTempDir);
    putenv('TMPDIR=' . $projectTempDir);
    $_ENV['TMP'] = $projectTempDir;
    $_ENV['TEMP'] = $projectTempDir;
    $_ENV['TMPDIR'] = $projectTempDir;
    $_SERVER['TMP'] = $projectTempDir;
    $_SERVER['TEMP'] = $projectTempDir;
    $_SERVER['TMPDIR'] = $projectTempDir;
}

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
