#!/bin/sh
cd /app || exit 0

php artisan config:clear || true
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true
