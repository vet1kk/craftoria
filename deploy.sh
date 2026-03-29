#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/home/site/wwwroot"
NGINX_CONF="/etc/nginx/sites-available/default"

echo "Starting Nginx configuration..."

if [ -f "$NGINX_CONF" ]; then
  echo "Updating Nginx root to $APP_ROOT/webroot..."
  sed -i "s|root $APP_ROOT;|root $APP_ROOT/webroot;|g" "$NGINX_CONF"

  # 2. Reload Nginx to apply the changes
  service nginx reload
else
  echo "ERROR: Nginx config not found at $NGINX_CONF"
fi

cd "$APP_ROOT"

echo "Running Composer deploy script..."
composer run-script deploy

echo "Deployment complete."