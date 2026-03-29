#!/usr/bin/env bash
set -e

APP_ROOT="/home/site/wwwroot"

chown -R www-data:www-data "$APP_ROOT/storage" "$APP_ROOT/bootstrap/cache"
chmod -R 775 "$APP_ROOT/storage" "$APP_ROOT/bootstrap/cache"

cd "$APP_ROOT"
/usr/local/bin/php /usr/local/bin/composer deploy
