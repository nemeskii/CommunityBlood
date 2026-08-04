#!/bin/sh
cd /app || exit 0

# Re-assert permissions at runtime, since the base image's own
# permission step can run after our build-time chown
chown -R application:application storage bootstrap/cache 2>/dev/null || true
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

php artisan config:clear || true
echo "--- Running migrations ---"
php artisan migrate --force
echo "--- Migration exit code: $? ---"
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true
