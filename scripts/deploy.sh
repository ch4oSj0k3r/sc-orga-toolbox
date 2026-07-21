#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

COMPOSE_FILE="${PROJECT_DIR}/docker-compose.prod.yml"
ENV_FILE="${PROJECT_DIR}/.env.prod"

HEALTHCHECK_URL="${HEALTHCHECK_URL:-http://127.0.0.1:3000/api/health}"
HEALTHCHECK_ATTEMPTS="${HEALTHCHECK_ATTEMPTS:-30}"
HEALTHCHECK_INTERVAL="${HEALTHCHECK_INTERVAL:-2}"

PRUNE_IMAGES=false
SKIP_BUILD=false

usage() {
    cat <<EOF
Verwendung:

  ./scripts/deploy.sh [Optionen]

Optionen:

  --skip-build    Docker-Image nicht neu bauen
  --prune         Nicht mehr verwendete Docker-Images nach dem Deployment löschen
  -h, --help      Hilfe anzeigen

Optionale Umgebungsvariablen:

  HEALTHCHECK_URL
      Standard: http://127.0.0.1:3000/api/health

  HEALTHCHECK_ATTEMPTS
      Standard: 30

  HEALTHCHECK_INTERVAL
      Standard: 2 Sekunden

Beispiele:

  ./scripts/deploy.sh

  ./scripts/deploy.sh --prune

  ./scripts/deploy.sh --skip-build
EOF
}

timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

log() {
    printf '[%s] %s\n' "$(timestamp)" "$*"
}

section() {
    printf '\n'
    printf '============================================================\n'
    printf '%s\n' "$*"
    printf '============================================================\n'
}

fail() {
    log "FEHLER: $*" >&2
    exit 1
}

on_error() {
    local exit_code=$?
    local line_number="${1:-unbekannt}"

    log "Deployment fehlgeschlagen."
    log "Zeile: ${line_number}"
    log "Exit-Code: ${exit_code}"

    if command -v docker >/dev/null 2>&1 &&
        [[ -f "${COMPOSE_FILE}" ]] &&
        [[ -f "${ENV_FILE}" ]]; then
        log "Letzte Webapp-Logs:"

        compose logs \
            --tail=100 \
            --no-color \
            webapp 2>/dev/null || true
    fi

    exit "${exit_code}"
}

trap 'on_error "$LINENO"' ERR

compose() {
    docker compose \
        --env-file "${ENV_FILE}" \
        -f "${COMPOSE_FILE}" \
        "$@"
}

require_command() {
    local command_name="$1"

    command -v "${command_name}" >/dev/null 2>&1 ||
        fail "Benötigter Befehl fehlt: ${command_name}"
}

validate_number() {
    local value="$1"
    local name="$2"

    [[ "${value}" =~ ^[1-9][0-9]*$ ]] ||
        fail "${name} muss eine positive Ganzzahl sein."
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --skip-build)
            SKIP_BUILD=true
            ;;
        --prune)
            PRUNE_IMAGES=true
            ;;
        -h | --help)
            usage
            exit 0
            ;;
        *)
            usage >&2
            fail "Unbekannte Option: $1"
            ;;
    esac

    shift
done

section "Vorbedingungen prüfen"

require_command docker
require_command curl

docker info >/dev/null 2>&1 ||
    fail "Docker ist nicht erreichbar."

docker compose version >/dev/null 2>&1 ||
    fail "Docker Compose ist nicht verfügbar."

[[ -f "${COMPOSE_FILE}" ]] ||
    fail "Compose-Datei nicht gefunden: ${COMPOSE_FILE}"

[[ -f "${ENV_FILE}" ]] ||
    fail "Environment-Datei nicht gefunden: ${ENV_FILE}"

validate_number "${HEALTHCHECK_ATTEMPTS}" "HEALTHCHECK_ATTEMPTS"
validate_number "${HEALTHCHECK_INTERVAL}" "HEALTHCHECK_INTERVAL"

cd "${PROJECT_DIR}"

log "Projektverzeichnis: ${PROJECT_DIR}"
log "Compose-Datei: ${COMPOSE_FILE}"
log "Environment-Datei: ${ENV_FILE}"

log "Validiere Docker-Compose-Konfiguration."
compose config --quiet

if [[ "${SKIP_BUILD}" == "false" ]]; then
    section "Docker-Images bauen"

    compose build
else
    section "Docker-Build übersprungen"

    log "Verwende bereits vorhandene Images."
fi

section "Datenbank starten"

compose up -d db

log "Warte auf eine gesunde Datenbank."

DB_HEALTHY=false

for ((attempt = 1; attempt <= HEALTHCHECK_ATTEMPTS; attempt++)); do
    DB_CONTAINER_ID="$(compose ps -q db)"

    if [[ -n "${DB_CONTAINER_ID}" ]]; then
        DB_HEALTH_STATUS="$(
            docker inspect \
                --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' \
                "${DB_CONTAINER_ID}"
        )"

        if [[ "${DB_HEALTH_STATUS}" == "healthy" ]]; then
            DB_HEALTHY=true
            log "Datenbank ist gesund."
            break
        fi

        log "Datenbankstatus: ${DB_HEALTH_STATUS} (${attempt}/${HEALTHCHECK_ATTEMPTS})"
    else
        log "Datenbank-Container wurde noch nicht gefunden (${attempt}/${HEALTHCHECK_ATTEMPTS})."
    fi

    sleep "${HEALTHCHECK_INTERVAL}"
done

if [[ "${DB_HEALTHY}" != "true" ]]; then
    compose logs --tail=100 --no-color db || true
    fail "Datenbank wurde nicht rechtzeitig gesund."
fi

section "Prisma-Migrationen ausführen"

compose run --rm migrate

section "Webapp starten"

compose up -d webapp

section "Healthcheck ausführen"

HEALTHY=false

for ((attempt = 1; attempt <= HEALTHCHECK_ATTEMPTS; attempt++)); do
    if curl \
        --silent \
        --show-error \
        --fail \
        --max-time 5 \
        "${HEALTHCHECK_URL}" >/dev/null; then
        HEALTHY=true
        log "Healthcheck erfolgreich: ${HEALTHCHECK_URL}"
        break
    fi

    log "Webapp noch nicht erreichbar (${attempt}/${HEALTHCHECK_ATTEMPTS})."
    sleep "${HEALTHCHECK_INTERVAL}"
done

if [[ "${HEALTHY}" != "true" ]]; then
    compose logs --tail=100 --no-color webapp || true
    fail "Healthcheck nach ${HEALTHCHECK_ATTEMPTS} Versuchen fehlgeschlagen."
fi

section "Containerstatus"

compose ps

if [[ "${PRUNE_IMAGES}" == "true" ]]; then
    section "Nicht verwendete Docker-Images entfernen"

    docker image prune --force
fi

section "Deployment erfolgreich"

log "Die Anwendung ist gesund und einsatzbereit."