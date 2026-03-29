#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/home/site/wwwroot"
NGINX_CONF="/etc/nginx/sites-available/default"
NGINX_EXTRA_CONF="/etc/nginx/conf.d/laravel_angular.conf"
STARTUP_LOG="/home/LogFiles/deploy-startup.log"

mkdir -p /home/LogFiles
exec > >(tee -a "$STARTUP_LOG") 2>&1

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Startup script begin"
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] User: $(id -u -n)"
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] PWD: $(pwd)"

echo "Starting Nginx configuration..."

# Detect PHP-FPM socket path provided by the runtime image.
PHP_FPM_SOCK="$(ls /run/php/php*-fpm.sock 2>/dev/null | head -n 1 || true)"
if [ -n "$PHP_FPM_SOCK" ]; then
  PHP_FPM_UPSTREAM="unix:$PHP_FPM_SOCK"
else
  PHP_FPM_UPSTREAM="127.0.0.1:9000"
  echo "Warning: PHP-FPM socket not found, falling back to $PHP_FPM_UPSTREAM"
fi

cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    listen [::]:80;
    listen 8080;
    listen [::]:8080;
    server_name _;

    root $APP_ROOT/webroot;
    index index.php index.html index.htm;

    charset utf-8;

    location ~ /(api|webhook|public)(/|$) {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    location / {
        try_files \$uri \$uri/ /index.html /index.php?\$query_string;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT \$realpath_root;
        fastcgi_pass ${PHP_FPM_UPSTREAM};
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
EOF

rm -f "$NGINX_EXTRA_CONF"

nginx -t
service nginx reload

touch "$APP_ROOT/.startup-ran"
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Created marker: $APP_ROOT/.startup-ran"

cd "$APP_ROOT"
echo "Running Composer deploy script..."
command -v composer >/dev/null 2>&1 || {
  echo "Composer is not available in PATH"
  exit 1
}
composer run-script deploy

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Deployment complete."
