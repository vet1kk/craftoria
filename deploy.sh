#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/home/site/wwwroot"
NGINX_CONF="/etc/nginx/sites-available/default"
APP_WEBROOT="$APP_ROOT/webroot"

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

detect_php_fpm_upstream() {
    local sockets
    sockets=(
        "/run/php/php8.3-fpm.sock"
        "/run/php/php-fpm.sock"
        "/var/run/php/php8.3-fpm.sock"
        "/var/run/php/php-fpm.sock"
    )

    for sock in "${sockets[@]}"; do
        if [ -S "$sock" ]; then
            printf 'unix:%s' "$sock"
            return 0
        fi
    done

    # Common fallback for php-fpm in containerized setups.
    printf '127.0.0.1:9000'
}

main() {
    local php_fpm_upstream
    local tmp_conf

    require_command nginx
    require_command composer
    require_path "$APP_ROOT"
    require_path "$APP_WEBROOT"

    php_fpm_upstream="${PHP_FPM_UPSTREAM:-$(detect_php_fpm_upstream)}"
    log "Using PHP-FPM upstream: $php_fpm_upstream"

    tmp_conf="$(mktemp)"
    trap 'rm -f "$tmp_conf"' EXIT

    cat >"$tmp_conf" <<EOF
server {
    listen 80;
    listen 8080;
    server_name _;
    root $APP_WEBROOT;
    index index.html index.php;
    charset utf-8;

    # Laravel API Routes
    location ~ /(api|webhook|public)(/|$) {
        try_files \$uri \$uri/ /index.php?\$query_string;
    }

    # Static Assets
    location ~* \.(?:css|js|jpg|jpeg|gif|png|ico|svg|woff|woff2)$ {
        try_files \$uri =404;
    }

    # Angular SPA Frontend
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # PHP-FPM Processing
    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME \$realpath_root\$fastcgi_script_name;
        fastcgi_pass $php_fpm_upstream;
    }
}
EOF

    if [ -f "$NGINX_CONF" ] && cmp -s "$tmp_conf" "$NGINX_CONF"; then
        log "Nginx config unchanged"
    else
        if [ -f "$NGINX_CONF" ]; then
            cp "$NGINX_CONF" "${NGINX_CONF}.bak"
            log "Backed up existing nginx config to ${NGINX_CONF}.bak"
        fi
        cp "$tmp_conf" "$NGINX_CONF"
        log "Wrote nginx config to $NGINX_CONF"
    fi

    nginx -t
    service nginx reload

    cd "$APP_ROOT"
    composer run-script deploy
    log "Deployment script finished successfully"
}

main "$@"
