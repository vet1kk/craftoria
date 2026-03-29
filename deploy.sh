#!/usr/bin/env bash
set -uo pipefail

APP_ROOT="/home/site/wwwroot"
log() { printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }

log "Updating Nginx configuration..."
rm -rf /etc/nginx/sites-enabled/*
cp "$APP_ROOT/.docker/conf/nginx/nginx.conf" /etc/nginx/sites-available/default
ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

log "Fixing permissions for www-data..."
chown -R www-data:www-data "$APP_ROOT/storage" "$APP_ROOT/bootstrap/cache"
chmod -R 775 "$APP_ROOT/storage" "$APP_ROOT/bootstrap/cache"

log "Restarting Nginx..."
pkill -9 nginx || true
/usr/sbin/nginx -g "daemon on;" || log "Nginx started with warnings"

set -e
cd "$APP_ROOT"
log "Executing Laravel Deploy Script..."

/usr/local/bin/php /usr/local/bin/composer run-script deploy

log "DEPLOYMENT COMPLETE"