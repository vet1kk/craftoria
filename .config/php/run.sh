#!/usr/bin/env bash
set -euo pipefail

# 1. Environment & Path Setup
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
readonly STORAGE_DIR="$ROOT_DIR/storage/framework"
readonly LOG_DIR="$ROOT_DIR/storage/logs"

cd "$ROOT_DIR"

# Ensure runtime directories exist
mkdir -p "$STORAGE_DIR"/{nginx,php-fpm/conf.d} "$LOG_DIR"

# Clear frontend logs before starting services
rm -f "$LOG_DIR/frontend.log"

# 2. Xdebug Logic
export PHP_FPM_CONF_D="$STORAGE_DIR/php-fpm/conf.d"
rm -rf "${PHP_FPM_CONF_D:?}"/*

if [ -f ".config/php/conf.d/99-xdebug.ini" ]; then
    ln -sf "$ROOT_DIR/.config/php/conf.d/99-xdebug.ini" "$PHP_FPM_CONF_D/99-xdebug.ini"
fi

export PHP_INI_SCAN_DIR=":$PHP_FPM_CONF_D"

# 3. Check Mode
if [ "${1:-serve}" = "check" ]; then
    echo "--- Checking PHP-FPM Configuration ---"
    php-fpm -t -p "$PWD" -y ".config/php/php-fpm.conf"
    echo "--- Checking Nginx Configuration ---"
    nginx -t -p . -c .config/nginx/nginx.conf
    exit 0
fi

export NG_CLI_ANALYTICS="${NG_CLI_ANALYTICS:-false}"

echo "Starting development environment..."

# Define cleanup
cleanup() {
    trap - SIGINT SIGTERM EXIT
    echo -e "\nShutting down services..."

    kill -9 -$$ 2>/dev/null || true
}

: cleanup

# Set the trap at the script level
trap cleanup SIGINT SIGTERM EXIT

# Start PHP-FPM
php-fpm -F -p "$PWD" -y ".config/php/php-fpm.conf" -c ".config/php/php.ini" > "$LOG_DIR/php-fpm.log" 2>&1 &

# Start Frontend Watcher
npm -C public start > "$LOG_DIR/frontend.log" 2>&1 &

rm -f storage/framework/nginx/nginx.pid

if ! nginx -p . -c .config/nginx/nginx.conf -s reload >/dev/null 2>&1; then
    nginx -p . -c .config/nginx/nginx.conf &
fi

sleep 2

echo "Services are running."
echo "PHP-FPM: 127.0.0.1:9000"
echo "Nginx: 127.0.0.1:8080"
echo "Frontend: 127.0.0.1:3000"

tail -f "$LOG_DIR/frontend.log"