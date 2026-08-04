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

# Set correct permissions for storage and cache
RUN chown -R application:application storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Cache config/routes at container startup, when real env vars are available
# (webdevops/php-nginx runs anything in /opt/docker/provision/entrypoint.d/ on boot)
COPY docker-entrypoint.sh /opt/docker/provision/entrypoint.d/30-laravel-cache.sh
RUN chmod +x /opt/docker/provision/entrypoint.d/30-laravel-cache.sh

EXPOSE 80
