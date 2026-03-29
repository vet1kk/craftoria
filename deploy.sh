#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/home/site/wwwroot"
NGINX_CONF="/etc/nginx/sites-available/default"

echo "Starting Nginx configuration..."

# 1. Update the root directory to webroot
sed -i "s|root $APP_ROOT;|root $APP_ROOT/webroot;|g" "$NGINX_CONF"

cat > /etc/nginx/conf.d/laravel_angular.conf <<EOF
location ~ /(api|webhook|public) {
    try_files \$uri \$uri/ /index.php?\$query_string;
}

location / {
    try_files \$uri \$uri/ /index.html /index.php?\$query_string;
}
EOF

# 3. Reload Nginx
service nginx reload

cd "$APP_ROOT"
echo "Running Composer deploy script..."
composer run-script deploy

echo "Deployment complete."