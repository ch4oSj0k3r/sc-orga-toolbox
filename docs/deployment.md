# Production Deployment

## Voraussetzungen

- Docker und Docker Compose sind installiert.
- GNU Make ist installiert.
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

Die Produktionskonfiguration liegt in `.env.prod`.

Mindestens der Nginx-Host-Port muss auf einen freien lokalen Port gesetzt werden:

```dotenv
NGINX_HOST_PORT=8081
```

Port `8080` ist auf dem Produktionsserver bereits durch ein anderes Projekt belegt.

Vor dem Deployment kann geprüft werden, ob Port `8081` bereits verwendet wird:

```bash
ss -ltn | grep ':8081 '
```

Keine Ausgabe bedeutet, dass aktuell kein TCP-Listener auf diesem Port gefunden wurde.

Die vollständige Environment-Konfiguration ist in [`docs/environment.md`](environment.md) beschrieben.

---

# Make-Commands

Für den normalen Produktionsbetrieb werden die Make-Targets verwendet.

Dadurch werden `.env.prod` und `docker-compose.prod.yml` automatisch an Docker Compose übergeben.

Übersicht aller Befehle:

```bash
make help
```

Wichtige Befehle:

```bash
make prod-config
make prod-deploy
make prod-ps
make prod-health
```

Die Make-Targets kapseln die eigentlichen Docker-Compose- und Deployment-Befehle. Direkte Docker-Compose-Aufrufe werden hauptsächlich für Diagnose und Sonderfälle verwendet.

---

# Erstes Deployment

## 1. Repository aktualisieren

```bash
git pull --ff-only
```

## 2. Compose-Konfiguration validieren

```bash
make prod-config
```

## 3. Nginx-Konfiguration validieren

```bash
make prod-nginx-test
```

## 4. Deployment starten

```bash
make prod-deploy
```

Das Make-Target ruft intern folgendes Skript auf:

```bash
./scripts/deploy.sh
```

Der Deployment-Prozess führt automatisch folgende Schritte aus:

1. Docker-Compose-Konfiguration validieren
2. Nginx-Host-Port validieren
3. Docker-Images bauen
4. Datenbank starten
5. Auf eine gesunde Datenbank warten
6. Prisma-Migrationen ausführen
7. Webapp starten
8. Nginx starten
9. Healthcheck über Nginx durchführen
10. Containerstatus ausgeben

## 5. Status prüfen

```bash
make prod-ps
```

Die dauerhaft laufenden Services sollten als `running` beziehungsweise `healthy` angezeigt werden:

```text
db
webapp
nginx
```

Der Migration-Service läuft nur während des Deployments und beendet sich anschließend.

## 6. Healthcheck prüfen

```bash
make prod-health
```

Das Target ermittelt den tatsächlich veröffentlichten Nginx-Port über Docker Compose und ruft anschließend auf:

```text
http://127.0.0.1:<NGINX_HOST_PORT>/api/health
```

---

# Deployment eines Updates

Repository aktualisieren:

```bash
git pull --ff-only
```

Deployment ausführen:

```bash
make prod-deploy
```

Danach Status und Healthcheck prüfen:

```bash
make prod-ps
make prod-health
```

Das Deployment-Skript führt notwendige Datenbankmigrationen automatisch aus und prüft die Anwendung anschließend über den Nginx-Container.

## Deployment ohne neuen Build

Wenn die benötigten Images bereits gebaut wurden:

```bash
make prod-deploy-skip-build
```

Dieses Target darf nur verwendet werden, wenn sich keine buildrelevanten Dateien geändert haben.

## Deployment mit Image-Bereinigung

```bash
make prod-deploy-prune
```

Nach einem erfolgreichen Deployment werden dabei nicht mehr verwendete Docker-Images entfernt.

---

# Containerbetrieb

## Production-Stack starten

```bash
make prod-up
```

Dieses Target startet:

```text
db
webapp
nginx
```

Es führt keine Datenbankmigration aus. Für reguläre Deployments muss deshalb `make prod-deploy` verwendet werden.

## Webapp und Nginx neu starten

```bash
make prod-restart
```

## Production-Stack stoppen

```bash
make prod-down
```

Das persistente Datenbank-Volume bleibt dabei erhalten.

Das Volume darf nicht versehentlich mit `docker compose down --volumes` oder `docker compose down -v` entfernt werden.

---

# Logs

## Alle Logs

```bash
make prod-logs
```

## Webapp-Logs

```bash
make prod-logs-webapp
```

## Nginx-Logs

```bash
make prod-logs-nginx
```

## Datenbank-Logs

```bash
make prod-logs-db
```

Die Log-Ausgabe wird mit `Ctrl+C` beendet. Die Container laufen dabei weiter.

---

# Healthchecks

## Gesamte Proxy-Kette prüfen

```bash
make prod-health
```

Dabei wird folgende Kette getestet:

```text
Host-Port
  -> Toolbox-Nginx
  -> Webapp
  -> /api/health
```

## Nur den Nginx-Container prüfen

Environment laden:

```bash
set -a
source .env.prod
set +a
```

Anschließend:

```bash
curl "http://127.0.0.1:${NGINX_HOST_PORT}/nginx-health"
```

## Nginx-Konfiguration prüfen

```bash
make prod-nginx-test
```

Erwartete Ausgabe:

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

---

# Datenbankmigrationen

Migrationen sind Bestandteil von `make prod-deploy`.

Eine manuelle Ausführung ist möglich mit:

```bash
make prod-migrate
```

Dabei wird zunächst die Datenbank gestartet und anschließend der einmalige Migration-Service ausgeführt.

---

# Backups

Datenbankbackup erstellen:

```bash
make prod-backup
```

Die Backups werden im Verzeichnis `backups/` gespeichert.

Backup-Dateien dürfen nicht in das Repository eingecheckt werden.

Weitere Informationen befinden sich in [`docs/backup.md`](backup.md).

---

# Restore

Ein Restore überschreibt den aktuellen Inhalt der Datenbank.

Der Aufruf benötigt deshalb sowohl eine Datei als auch eine ausdrückliche Bestätigung:

```bash
make prod-restore \
  FILE=backups/sc-orga-db_2026-07-18_19-48-28.sql.gz \
  CONFIRM=YES
```

Während des Restores wird die Webapp gestoppt. Nach einem erfolgreichen Restore wird sie wieder gestartet.

Nach dem Restore prüfen:

```bash
make prod-ps
make prod-health
```

---

# Initial Administrator Bootstrap

Nach einem frischen Deployment existiert zunächst kein Administrator.

## 1. Benutzer registrieren

Über die Weboberfläche einen Benutzer registrieren.

## 2. Benutzer verifizieren

Den Cronjob ausführen oder auf die automatische Ausführung warten.

## 3. MariaDB-Client öffnen

```bash
make prod-shell-db
```

## 4. Administrator setzen

Im MariaDB-Client ausführen:

```sql
UPDATE users
SET role = 'ADMIN',
    status = 'ACTIVE'
WHERE sc_handle = '<SC_HANDLE>';
```

MariaDB-Client anschließend beenden:

```sql
exit;
```

Danach neu anmelden.

Alle weiteren Administratoren werden ausschließlich über das Admin-Backend verwaltet.

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

Der Toolbox-Nginx übernimmt keine TLS-Zertifikate.

Zertifikatsausstellung und Zertifikatserneuerung bleiben Aufgabe der zentralen Serverkonfiguration.

Nach Einrichtung des zentralen Reverse Proxys prüfen:

- produktive Domain ist erreichbar
- TLS-Zertifikat ist gültig
- Login funktioniert
- Redirects verwenden HTTPS
- `/api/health` ist über die produktive Domain erreichbar

---

# Fehleranalyse

## Containerstatus

Standardbefehl:

```bash
make prod-ps
```

Direkter Docker-Compose-Aufruf:

```bash
docker compose \
  --env-file .env.prod \
  -f docker-compose.prod.yml \
  ps
```

## Webapp- und Nginx-Logs

Standardbefehle:

```bash
make prod-logs-webapp
make prod-logs-nginx
```

Gemeinsamer direkter Aufruf:

```bash
docker compose \
  --env-file .env.prod \
  -f docker-compose.prod.yml \
  logs --tail=100 webapp nginx
```

## Datenbank-Logs

Standardbefehl:

```bash
make prod-logs-db
```

Direkter Docker-Compose-Aufruf:

```bash
docker compose \
  --env-file .env.prod \
  -f docker-compose.prod.yml \
  logs --tail=100 db
```

---

## `502 Bad Gateway`

Zuerst den Status prüfen:

```bash
make prod-ps
```

Danach die Logs lesen:

```bash
make prod-logs-webapp
make prod-logs-nginx
```

Direkten Webapp-Healthcheck innerhalb des Nginx-Containers ausführen:

```bash
docker compose \
  --env-file .env.prod \
  -f docker-compose.prod.yml \
  exec nginx \
  wget -q -O - http://webapp:3000/api/health
```

Mögliche Ursachen:

- Webapp läuft nicht
- Webapp ist noch nicht gesund
- Nginx kann `webapp` im Docker-Netzwerk nicht auflösen
- Webapp lauscht nicht auf Port `3000`
- Nginx-Konfiguration ist ungültig

Nginx-Konfiguration erneut prüfen:

```bash
make prod-nginx-test
```

---

## Host-Port bereits belegt

Environment laden:

```bash
set -a
source .env.prod
set +a
```

Belegung prüfen:

```bash
ss -ltn | grep ":${NGINX_HOST_PORT} "
```

Bei einer Kollision einen anderen freien Port in `.env.prod` eintragen und das Deployment erneut ausführen:

```bash
make prod-deploy
```

---

## Nginx läuft, Anwendung ist aber nicht erreichbar

Veröffentlichten Port anzeigen:

```bash
docker compose \
  --env-file .env.prod \
  -f docker-compose.prod.yml \
  port nginx 80
```

Nginx direkt testen:

```bash
make prod-health
```

Firewall- und Reverse-Proxy-Konfiguration liegen außerhalb des Docker-Stacks und müssen gegebenenfalls durch die Serveradministration geprüft werden.

---

# Direkte Shell-Zugriffe

Webapp:

```bash
make prod-shell-webapp
```

Nginx:

```bash
make prod-shell-nginx
```

MariaDB:

```bash
make prod-shell-db
```
