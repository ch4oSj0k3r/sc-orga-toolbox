# Production Deployment

## Voraussetzungen

- Docker und Docker Compose sind installiert.
- Das Repository ist auf dem Zielsystem vorhanden.
- Die Datei `.env.prod` wurde erstellt und enthält alle erforderlichen Umgebungsvariablen.
- Für `NGINX_HOST_PORT` wurde ein freier Host-Port festgelegt.
- Der zentrale Reverse Proxy kann den Toolbox-Nginx über `127.0.0.1:<NGINX_HOST_PORT>` erreichen.
- Domain, TLS-Zertifikat und öffentlicher HTTPS-Reverse-Proxy werden außerhalb dieses Docker-Stacks verwaltet.

Projektverzeichnis:

```text
/home/toolbox-admin/sc-orga-toolbox
```

## Zielarchitektur

```text
Browser
  -> zentraler HTTPS-Reverse-Proxy
  -> 127.0.0.1:<NGINX_HOST_PORT>
  -> Toolbox-Nginx-Container:80
  -> webapp:3000
```

Die Webapp veröffentlicht selbst keinen Host-Port. Nur der Toolbox-Nginx ist auf dem Host erreichbar.

---

# Environment vorbereiten

In `.env.prod` muss ein freier Port hinterlegt werden:

```dotenv
NGINX_HOST_PORT=8081
```

Port `8080` ist auf dem Produktionsserver bereits durch ein anderes Projekt belegt. Vor dem Deployment prüfen:

```bash
ss -ltn | grep ':8081 '
```

Keine Ausgabe bedeutet, dass aktuell kein TCP-Listener auf diesem Port gefunden wurde.

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

1. Docker-Compose-Konfiguration validieren
2. Nginx-Host-Port validieren
3. Docker-Images bauen
4. Datenbank starten
5. Auf gesunde Datenbank warten
6. Prisma-Migrationen ausführen
7. Webapp starten
8. Nginx starten
9. Healthcheck über Nginx durchführen
10. Containerstatus ausgeben

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

Das Deployment-Skript führt notwendige Datenbankmigrationen automatisch aus und prüft die Anwendung anschließend über den Nginx-Container.

---

# Healthchecks

Environment laden:

```bash
set -a
source .env.prod
set +a
```

Gesamte Proxy-Kette bis zur Webapp prüfen:

```bash
curl "http://127.0.0.1:${NGINX_HOST_PORT}/api/health"
```

Nur den Nginx-Container prüfen:

```bash
curl "http://127.0.0.1:${NGINX_HOST_PORT}/nginx-health"
```

Ein erfolgreiches Deployment endet mit einem erfolgreichen Healthcheck über `/api/health`.

---

# Zentralen Reverse Proxy anbinden

Der vorgelagerte HTTPS-Reverse-Proxy muss auf folgenden Endpunkt weiterleiten:

```text
http://127.0.0.1:<NGINX_HOST_PORT>
```

Der zentrale Proxy muss mindestens diese Informationen weitergeben:

```text
Host
X-Forwarded-For
X-Forwarded-Proto
```

Der Toolbox-Nginx übernimmt keine TLS-Zertifikate. Zertifikatsausstellung und Erneuerung bleiben Aufgabe der zentralen Serverkonfiguration.

---

# Fehleranalyse

Containerstatus:

```bash
docker compose \
    --env-file .env.prod \
    -f docker-compose.prod.yml \
    ps
```

Webapp- und Nginx-Logs:

```bash
docker compose \
    --env-file .env.prod \
    -f docker-compose.prod.yml \
    logs --tail=100 webapp nginx
```

Datenbank-Logs:

```bash
docker compose \
    --env-file .env.prod \
    -f docker-compose.prod.yml \
    logs --tail=100 db
```

## `502 Bad Gateway`

Zuerst den Status von Webapp und Nginx prüfen:

```bash
docker compose \
    --env-file .env.prod \
    -f docker-compose.prod.yml \
    ps
```

Danach die Logs beider Services lesen:

```bash
docker compose \
    --env-file .env.prod \
    -f docker-compose.prod.yml \
    logs --tail=100 webapp nginx
```

Direkten Webapp-Healthcheck im Nginx-Container ausführen:

```bash
docker compose \
    --env-file .env.prod \
    -f docker-compose.prod.yml \
    exec nginx \
    wget -q -O - http://webapp:3000/api/health
```

## Host-Port bereits belegt

Belegung prüfen:

```bash
set -a
source .env.prod
set +a

ss -ltn | grep ":${NGINX_HOST_PORT} "
```

Bei einer Kollision einen anderen freien Port in `.env.prod` eintragen und das Deployment erneut ausführen.
