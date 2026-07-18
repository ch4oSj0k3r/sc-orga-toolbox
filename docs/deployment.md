# Production Deployment

## Voraussetzungen

- Docker
- Docker Compose
- Git
- .env.prod vorhanden

## Erstes Deployment

git clone
docker compose build
docker compose up -d db
docker compose run --rm migrate
docker compose up -d webapp

## Initialer Administrator

1. Benutzer registrieren
2. Cron ausführen
3. User per SQL auf ADMIN setzen
    ```C
    set -a
    source .env.prod
    set +a

    docker compose \
        --env-file .env.prod \
        -f docker-compose.prod.yml \
        exec db \
        mariadb \
        -u"$DB_USER" \
        -p"$DB_PASSWORD" \
        "$DB_NAME" \
        -e "UPDATE users SET role = 'ADMIN', status = 'ACTIVE' WHERE sc_handle = '<DEIN_SC_HANDLE>';"
    ```
4. Neu anmelden

## Deployment eines Updates

git pull
docker compose build
docker compose run --rm migrate
docker compose up -d

## Healthcheck

/api/health

## Rollback

Git Checkout
neu bauen
Migrationen (nur falls nötig)
Container starten
