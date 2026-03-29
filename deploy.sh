#!/usr/bin/env bash
set -euo pipefail

cp /home/site/wwwroot/.docker/conf/nginx/nginx.conf /etc/nginx/sites-available/default

log "Testing Nginx configuration..."
nginx -t || die "Nginx config test failed"

log "Fixing file ownership for www-data..."
chown -R www-data:www-data /home/site/wwwroot/webroot
chmod -R 755 /home/site/wwwroot/webroot

log "Reloading Nginx..."
nginx -s reload || die "Failed to reload Nginx"

cd "$APP_ROOT"
log "Running Composer deploy script..."
composer run-script deploy