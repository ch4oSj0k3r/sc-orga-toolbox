#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

COMPOSE_FILE="${PROJECT_DIR}/docker-compose.prod.yml"
ENV_FILE="${PROJECT_DIR}/.env.prod"

WEBAPP_WAS_RUNNING=false
RESTORE_SUCCEEDED=false

log() {
    printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

fail() {
    echo "Fehler: $*" >&2
    exit 1
}

usage() {
    cat <<EOF
Verwendung:

  CONFIRM_RESTORE=YES ./scripts/restore-db.sh <backup.sql.gz>

Beispiel:

  CONFIRM_RESTORE=YES \\
    ./scripts/restore-db.sh backups/sc-orga-db_2026-07-18_19-48-28.sql.gz
EOF
}

cleanup() {
    if [[ "${RESTORE_SUCCEEDED}" == "true" && "${WEBAPP_WAS_RUNNING}" == "true" ]]; then
        log "Starte Webapp wieder."

        docker compose \
            --env-file "${ENV_FILE}" \
            -f "${COMPOSE_FILE}" \
            up -d webapp
    elif [[ "${RESTORE_SUCCEEDED}" != "true" && "${WEBAPP_WAS_RUNNING}" == "true" ]]; then
        log "Restore fehlgeschlagen. Die Webapp bleibt vorsichtshalber gestoppt."
    fi
}

trap cleanup EXIT

if [[ $# -ne 1 ]]; then
    usage
    exit 1
fi

BACKUP_FILE="$1"

if [[ "${BACKUP_FILE}" != /* ]]; then
    BACKUP_FILE="${PROJECT_DIR}/${BACKUP_FILE}"
fi

[[ -f "${COMPOSE_FILE}" ]] ||
    fail "Compose-Datei nicht gefunden: ${COMPOSE_FILE}"

[[ -f "${ENV_FILE}" ]] ||
    fail "Environment-Datei nicht gefunden: ${ENV_FILE}"

[[ -f "${BACKUP_FILE}" ]] ||
    fail "Backup-Datei nicht gefunden: ${BACKUP_FILE}"

if [[ "${CONFIRM_RESTORE:-}" != "YES" ]]; then
    echo "Der Restore wurde nicht bestätigt." >&2
    echo
    echo "Achtung: Der aktuelle Inhalt der Datenbank wird überschrieben."
    echo
    usage
    exit 1
fi

log "Prüfe Backup-Datei."

gzip -t "${BACKUP_FILE}" ||
    fail "Die Backup-Datei ist kein gültiges gzip-Archiv."

if ! gzip -dc "${BACKUP_FILE}" | grep -q "_prisma_migrations"; then
    fail "Das Backup enthält keine Prisma-Migrationstabelle."
fi

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

: "${DB_USER:?DB_USER ist nicht gesetzt}"
: "${DB_PASSWORD:?DB_PASSWORD ist nicht gesetzt}"
: "${DB_NAME:?DB_NAME ist nicht gesetzt}"

cd "${PROJECT_DIR}"

log "Prüfe MariaDB-Verbindung."

docker compose \
    --env-file "${ENV_FILE}" \
    -f "${COMPOSE_FILE}" \
    exec -T \
    -e "MYSQL_PWD=${DB_PASSWORD}" \
    db \
    mariadb \
        --user="${DB_USER}" \
        "${DB_NAME}" \
        -e "SELECT 1;" >/dev/null ||
    fail "MariaDB ist nicht erreichbar."

if docker compose \
    --env-file "${ENV_FILE}" \
    -f "${COMPOSE_FILE}" \
    ps --status running --services |
    grep -qx "webapp"; then
    WEBAPP_WAS_RUNNING=true
fi

if [[ "${WEBAPP_WAS_RUNNING}" == "true" ]]; then
    log "Stoppe Webapp, um Schreibzugriffe während des Restores zu verhindern."

    docker compose \
        --env-file "${ENV_FILE}" \
        -f "${COMPOSE_FILE}" \
        stop webapp
fi

log "Spiele Backup ein: ${BACKUP_FILE}"

gzip -dc "${BACKUP_FILE}" |
    docker compose \
        --env-file "${ENV_FILE}" \
        -f "${COMPOSE_FILE}" \
        exec -T \
        -e "MYSQL_PWD=${DB_PASSWORD}" \
        db \
        mariadb \
            --user="${DB_USER}" \
            "${DB_NAME}"

log "Prüfe wiederhergestellte Datenbank."

docker compose \
    --env-file "${ENV_FILE}" \
    -f "${COMPOSE_FILE}" \
    exec -T \
    -e "MYSQL_PWD=${DB_PASSWORD}" \
    db \
    mariadb \
        --user="${DB_USER}" \
        "${DB_NAME}" \
        -e "SELECT COUNT(*) AS migration_count FROM _prisma_migrations;" \
        >/dev/null

RESTORE_SUCCEEDED=true

log "Restore erfolgreich abgeschlossen."