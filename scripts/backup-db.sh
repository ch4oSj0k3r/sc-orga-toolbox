#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

COMPOSE_FILE="${PROJECT_DIR}/docker-compose.prod.yml"
ENV_FILE="${PROJECT_DIR}/.env.prod"
BACKUP_DIR="${PROJECT_DIR}/backups"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

TIMESTAMP="$(date '+%Y-%m-%d_%H-%M-%S')"
BACKUP_FILE="${BACKUP_DIR}/sc-orga-db_${TIMESTAMP}.sql.gz"
TEMP_FILE="${BACKUP_FILE}.tmp"

log() {
    printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

cleanup() {
    rm -f "${TEMP_FILE}"
}

fail() {
    echo "Fehler: $*" >&2
    exit 1
}

trap cleanup EXIT

[[ -f "${COMPOSE_FILE}" ]] ||
    fail "Compose-Datei nicht gefunden: ${COMPOSE_FILE}"

[[ -f "${ENV_FILE}" ]] ||
    fail "Environment-Datei nicht gefunden: ${ENV_FILE}"

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

: "${DB_USER:?DB_USER ist nicht gesetzt}"
: "${DB_PASSWORD:?DB_PASSWORD ist nicht gesetzt}"
: "${DB_NAME:?DB_NAME ist nicht gesetzt}"

mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"

cd "${PROJECT_DIR}"

log "Prüfe MariaDB-Verbindung."

docker compose \
    --env-file "${ENV_FILE}" \
    -f "${COMPOSE_FILE}" \
    exec -T db \
    mariadb-admin ping --silent >/dev/null ||
    fail "MariaDB ist nicht erreichbar."

log "Erstelle Datenbank-Backup."

docker compose \
    --env-file "${ENV_FILE}" \
    -f "${COMPOSE_FILE}" \
    exec -T \
    -e "MYSQL_PWD=${DB_PASSWORD}" \
    db \
    mariadb-dump \
        --user="${DB_USER}" \
        --single-transaction \
        --quick \
        --routines \
        --triggers \
        --events \
        "${DB_NAME}" |
    gzip -9 >"${TEMP_FILE}"

[[ -s "${TEMP_FILE}" ]] ||
    fail "Das erzeugte Backup ist leer."

gzip -t "${TEMP_FILE}" ||
    fail "Das erzeugte Backup ist beschädigt."

if ! gzip -dc "${BACKUP_FILE}" | grep -q "_prisma_migrations"; then
    fail "Backup scheint kein gültiger Prisma-Dump zu sein."
fi

mv "${TEMP_FILE}" "${BACKUP_FILE}"
chmod 600 "${BACKUP_FILE}"

log "Backup erfolgreich erstellt:"
log "${BACKUP_FILE}"

log "Lösche Backups, die älter als ${RETENTION_DAYS} Tage sind."

find "${BACKUP_DIR}" \
    -type f \
    -name 'sc-orga-db_*.sql.gz' \
    -mtime "+${RETENTION_DAYS}" \
    -delete

log "Backup abgeschlossen."