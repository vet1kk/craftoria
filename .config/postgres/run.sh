#!/usr/bin/env bash
set -euo pipefail

cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if ! command -v psql >/dev/null 2>&1 || ! command -v pg_isready >/dev/null 2>&1; then
    echo "PostgreSQL client tools are required (psql, pg_isready)." >&2
    exit 1
fi

if [ ! -f .env ]; then
    cp .env.example .env
fi

set -a
# shellcheck disable=SC1091
source ./.env
set +a

action="${1:-setup}"
db_host="${DB_HOST:-127.0.0.1}"
db_port="${DB_PORT:-5432}"
db_name="${DB_DATABASE:-craftoria}"
db_user="${DB_USERNAME:-craftoria}"
db_password="${DB_PASSWORD:-craftoria}"

admin_db="${PG_SETUP_ADMIN_DB:-postgres}"
admin_user="${PG_SETUP_ADMIN_USER:-}"
admin_host="${PG_SETUP_ADMIN_HOST:-}"
admin_port="${PG_SETUP_ADMIN_PORT:-}"

admin_psql=(psql -v ON_ERROR_STOP=1 -d "$admin_db")
[ -n "$admin_user" ] && admin_psql+=(-U "$admin_user")
[ -n "$admin_host" ] && admin_psql+=(-h "$admin_host")
[ -n "$admin_port" ] && admin_psql+=(-p "$admin_port")

project_psql=(psql -v ON_ERROR_STOP=1 -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name")

check_server() {
    pg_isready -h "$db_host" -p "$db_port" >/dev/null
}

check_project_connection() {
    PGPASSWORD="$db_password" "${project_psql[@]}" -tAc \
        "select current_user || '@' || current_database();" >/dev/null
}

provision_role_and_database() {
    "${admin_psql[@]}" \
        -v app_db_user="$db_user" \
        -v app_db_password="$db_password" \
        -v app_db_name="$db_name" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'app_db_user', :'app_db_password')
WHERE NOT EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = :'app_db_user'
)\gexec

SELECT format('ALTER ROLE %I WITH LOGIN PASSWORD %L', :'app_db_user', :'app_db_password')\gexec

SELECT format('CREATE DATABASE %I OWNER %I', :'app_db_name', :'app_db_user')
WHERE NOT EXISTS (
    SELECT 1
    FROM pg_database
    WHERE datname = :'app_db_name'
)\gexec

SELECT format('ALTER DATABASE %I OWNER TO %I', :'app_db_name', :'app_db_user')\gexec
SQL
}

case "$action" in
    setup)
        check_server || {
            echo "PostgreSQL is not accepting connections on ${db_host}:${db_port}." >&2
            exit 1
        }

        provision_role_and_database
        check_project_connection || {
            echo "Provisioning completed, but the project connection still failed." >&2
            exit 1
        }

        echo "PostgreSQL is ready for ${db_user}@${db_name}."
        ;;
    check)
        check_server || {
            echo "PostgreSQL is not accepting connections on ${db_host}:${db_port}." >&2
            exit 1
        }

        check_project_connection || {
            echo "The configured PostgreSQL connection failed for ${db_user}@${db_name}." >&2
            exit 1
        }

        echo "PostgreSQL connection is healthy for ${db_user}@${db_name}."
        ;;
    *)
        echo "Usage: $0 [setup|check]" >&2
        exit 1
        ;;
esac
