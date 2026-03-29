#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/home/site/wwwroot"
NGINX_CONF="$APP_ROOT/.docker/conf/nginx/nginx.conf"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

log "Seizing control of Nginx configuration..."
rm -rf /etc/nginx/sites-enabled/*
rm -rf /etc/nginx/sites-available/*

cp "$NGINX_CONF" /etc/nginx/sites-available/default
ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

log "Setting file ownership..."
chown -R www-data:www-data "$APP_ROOT"
chmod -R 755 "$APP_ROOT"

log "Restarting Nginx binary..."
pkill -9 nginx || true
sleep 2
/usr/sbin/nginx -g "daemon on;" || nginx

cd "$APP_ROOT"
log "Running Composer deploy script..."
composer run-script deploy

log "Deployment finished successfully!"