FROM webdevops/php-nginx:8.2-alpine

# Laravel's public directory is the web root
ENV WEB_DOCUMENT_ROOT=/app/public
ENV APP_ENV=production

WORKDIR /app

# Copy composer files first for better build caching
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Copy the rest of the application
COPY . .

# Re-run composer scripts now that all files are present (e.g. package discovery)
RUN composer dump-autoload --optimize

# Cache Laravel config/routes for production performance
RUN php artisan config:cache || true \
    && php artisan route:cache || true \
    && php artisan view:cache || true

# Set correct permissions for storage and cache
RUN chown -R application:application storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 80
