## Erstes Deployment

1. Docker-Container starten
2. Migrationen ausführen
3. Anwendung öffnen
4. Ersten Benutzer registrieren
5. Cron ausführen bzw. auf Ausführung warten
6. Benutzer in der Datenbank zum Administrator hochstufen
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
7. Neu anmelden
8. Weitere Administratoren ausschließlich über das Admin-Backend verwalten
