#!/usr/bin/env bash
set -euo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
mkdir -p storage/framework/{nginx,php-fpm/conf.d} storage/logs
find storage/framework/php-fpm/conf.d -mindepth 1 -maxdepth 1 -exec rm -rf {} +
scan="$(php --ini | awk -F': ' '/Scan for additional \.ini files in:/ {print $2}')"
[ -n "${scan:-}" ] && [ "$scan" != "(none)" ] && for f in "$scan"/*.ini; do [ -e "$f" ] || continue; [[ "$(basename "$f")" == *xdebug* ]] && continue; ln -sf "$f" storage/framework/php-fpm/conf.d/; done
xdebug="$(php-config --extension-dir)/xdebug.so"; [ -f "$xdebug" ] && printf 'zend_extension="%s"\n' "$xdebug" > storage/framework/php-fpm/conf.d/00-xdebug.ini
ln -sf "$PWD/.config/php/conf.d/99-xdebug.ini" storage/framework/php-fpm/conf.d/99-xdebug.ini
export PHP_INI_SCAN_DIR="$PWD/storage/framework/php-fpm/conf.d"
[ "${1:-serve}" = check ] && exec php-fpm -p "$PWD" -y "$PWD/.config/php/php-fpm.conf" -c "$PWD/.config/php/php.ini" -t
nginx_pid_file="$PWD/storage/framework/nginx/nginx.pid"
if [ -f "$nginx_pid_file" ]; then
    nginx_pid="$(cat "$nginx_pid_file")"
    if [ -n "${nginx_pid:-}" ] && kill -0 "$nginx_pid" 2>/dev/null; then
        nginx -p . -c .config/nginx/nginx.conf -s reload >/dev/null 2>&1 || true
        echo "Project nginx is already running on port 80 (pid $nginx_pid)." >&2
        echo "Reused the running server instead of starting a second instance." >&2
        exit 0
    fi
fi
php-fpm -p "$PWD" -y "$PWD/.config/php/php-fpm.conf" -c "$PWD/.config/php/php.ini" -F -O > storage/logs/php-fpm.stdout.log 2>&1 & p=$!
trap 'kill ${n:-} $p 2>/dev/null || true; wait ${n:-} $p 2>/dev/null || true' EXIT INT TERM
for _ in {1..20}; do if lsof -nP -iTCP:9000 -sTCP:LISTEN >/dev/null 2>&1; then break; fi; sleep 1; done
lsof -nP -iTCP:9000 -sTCP:LISTEN >/dev/null 2>&1 || { echo 'php-fpm did not start on 127.0.0.1:9000.' >&2; exit 1; }
nginx -p . -c .config/nginx/nginx.conf & n=$!
wait "$n"
