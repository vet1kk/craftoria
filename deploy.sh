#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/home/site/wwwroot"
NGINX_SOURCE="$APP_ROOT/.docker/conf/nginx/nginx.conf"
NGINX_TARGET="/etc/nginx/sites-available/default"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

die() {
  log "ERROR: $*"
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"
}

require_path() {
  [ -e "$1" ] || die "Required path not found: $1"
}

require_command nginx
require_command composer
require_command service
require_path "$APP_ROOT"
require_path "$NGINX_SOURCE"
require_path "$APP_ROOT/vendor/autoload.php"

if [ -f "$NGINX_TARGET" ]; then
  cp "$NGINX_TARGET" "${NGINX_TARGET}.bak"
fi

cp "$NGINX_SOURCE" "$NGINX_TARGET"
nginx -t
service nginx reload

cd "$APP_ROOT"
composer run-script deploy
log "Deployment finished successfully"
