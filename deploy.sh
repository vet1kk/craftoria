#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/home/site/wwwroot"
NGINX_DEFAULT_SRC="$APP_ROOT/default"
NGINX_DEFAULT_DST="/etc/nginx/sites-available/default"

echo "Starting Nginx configuration..."
if [ -f "$NGINX_DEFAULT_SRC" ]; then
  cp "$NGINX_DEFAULT_SRC" "$NGINX_DEFAULT_DST"
  sed -i 's|root /home/site/wwwroot;|root /home/site/wwwroot/webroot;|g' "$NGINX_DEFAULT_DST"
  service nginx reload
fi

cd "$APP_ROOT"

echo "Running Composer deploy script..."
composer run-script deploy

echo "Deployment complete."