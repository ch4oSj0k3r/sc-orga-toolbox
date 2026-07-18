# Production Deployment

## Voraussetzungen

- Docker und Docker Compose sind installiert.
- Das Repository ist auf dem Zielsystem vorhanden.
- Die Datei `.env.prod` wurde erstellt und enthält alle erforderlichen Umgebungsvariablen.
- Die Domain und der Reverse Proxy (Apache) sind eingerichtet.

Projektverzeichnis:

```text
/home/toolbox-admin/sc-orga-toolbox
```

---

# Erstes Deployment

Repository aktualisieren:

```bash
git pull --ff-only
```

Deployment starten:

```bash
./scripts/deploy.sh
```

Der Deployment-Prozess führt automatisch folgende Schritte aus:

1. Docker Compose Konfiguration validieren
2. Docker Images bauen
3. Datenbank starten
4. Auf gesunde Datenbank warten
5. Prisma Migrationen ausführen
6. Webapp starten
7. Healthcheck durchführen
8. Containerstatus ausgeben

---

# Initial Administrator Bootstrap

Nach einem frischen Deployment existiert zunächst kein Administrator.

## 1. Benutzer registrieren

Über die Weboberfläche einen Benutzer registrieren.

## 2. Benutzer verifizieren

Den Cronjob ausführen oder auf die automatische Ausführung warten.

## 3. Administrator setzen

```bash
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
        -e "UPDATE users SET role = 'ADMIN', status = 'ACTIVE' WHERE sc_handle = '<SC_HANDLE>';"
```

Danach neu anmelden.

Alle weiteren Administratoren werden ausschließlich über das Admin-Backend verwaltet.

---

# Deployment eines Updates

```bash
git pull --ff-only

./scripts/deploy.sh
```

Das Deployment-Skript führt notwendige Datenbankmigrationen automatisch aus.

---

# Healthcheck

Lokaler Healthcheck:

```bash
curl http://127.0.0.1:3000/api/health
```

Ein erfolgreiches Deployment endet mit einem erfolgreichen Healthcheck.

---

# Fehleranalyse

Containerstatus:

```bash
docker compose \
    --env-file .env.prod \
    -f docker-compose.prod.yml \
    ps
```

Webapp-Logs:

```bash
docker compose \
    --env-file .env.prod \
    -f docker-compose.prod.yml \
    logs webapp
```

Datenbank-Logs:

```bash
docker compose \
    --env-file .env.prod \
    -f docker-compose.prod.yml \
    logs db
```
