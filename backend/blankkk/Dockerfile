FROM webdevops/php-nginx:8.2-alpine

ENV WEB_DOCUMENT_ROOT=/app/public
ENV APP_ENV=production

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

COPY . .

RUN composer dump-autoload --optimize

RUN chown -R application:application storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker-entrypoint.sh /opt/docker/provision/entrypoint.d/30-laravel-cache.sh
RUN chmod +x /opt/docker/provision/entrypoint.d/30-laravel-cache.sh

EXPOSE 80
