# Environment-Konfiguration

## Überblick

Die Anwendung verwendet drei verschiedene Environment-Dateien.

| Datei          | Zweck                              | Versioniert |
| -------------- | ---------------------------------- | ----------- |
| `.env`         | Lokale Entwicklung                 | ❌          |
| `.env.prod`    | Produktionssystem                  | ❌          |
| `.env.example` | Vorlage aller benötigten Variablen | ✅          |

Nur `.env.example` wird im Repository gespeichert.

---

## `.env.example`

Die Datei `.env.example` enthält alle benötigten Environment-Variablen mit Beispielwerten oder leeren Platzhaltern.

Sie dient ausschließlich als Vorlage und darf keine produktiven Zugangsdaten enthalten.

Eine neue lokale oder produktive Environment-Datei kann auf Basis der Vorlage erstellt werden:

```bash
cp .env.example .env.prod
```

Anschließend müssen alle Werte geprüft und für das Zielsystem angepasst werden.

---

## `.env.prod`

Die Produktionskonfiguration liegt ausschließlich auf dem Zielserver.

Empfehlungen:

- Datei niemals committen
- Dateirechte auf `600` setzen
- keine Inline-Kommentare hinter Variablenwerten verwenden
- `DB_HOST=db` verwenden
- `DB_PORT=3306` verwenden
- `NEXTAUTH_URL` auf die produktive HTTPS-Domain setzen
- `NGINX_HOST_PORT` auf einen freien lokalen Host-Port setzen
- Port `8080` nicht verwenden, da er bereits durch ein anderes Projekt belegt ist
- keine Zertifikate oder Private Keys in `.env.prod` speichern

Beispiel:

```dotenv
DB_HOST=db
DB_PORT=3306
NGINX_HOST_PORT=8081
NEXTAUTH_URL=https://toolbox.shfederation.org
```

Der Nginx-Port wird ausschließlich an `127.0.0.1` gebunden.

Der zentrale HTTPS-Reverse-Proxy leitet Requests auf diesen lokalen Port weiter.

---

## Verwendung durch Make

Die Production-Make-Targets verwenden automatisch:

```text
.env.prod
docker-compose.prod.yml
```

Beispiele:

```bash
make prod-config
make prod-deploy
make prod-ps
make prod-health
```

Dadurch muss bei normalen Betriebsbefehlen nicht jedes Mal folgender vollständiger Compose-Aufruf geschrieben werden:

```bash
docker compose \
  --env-file .env.prod \
  -f docker-compose.prod.yml
```

Die Make-Targets ersetzen nicht die Environment-Validierung. Fehlende oder ungültige Werte führen weiterhin zu einem Abbruch durch Docker Compose, das Deployment-Skript oder die Anwendung.

---

## Datenbankvariablen

### `DB_HOST`

Hostname der MariaDB.

Lokale Entwicklung:

```dotenv
DB_HOST=localhost
```

Production mit Docker Compose:

```dotenv
DB_HOST=db
```

Innerhalb des Production-Stacks wird der Compose-Service-Name `db` verwendet.

### `DB_PORT`

Port der MariaDB innerhalb des Docker-Netzwerks:

```dotenv
DB_PORT=3306
```

Die Production-Datenbank veröffentlicht keinen Host-Port.

### `DB_USER`

Benutzername des Anwendungsbenutzers:

```dotenv
DB_USER=sc_toolbox
```

### `DB_PASSWORD`

Passwort des Anwendungsbenutzers.

Der Wert muss zufällig erzeugt werden und darf nicht im Repository stehen.

### `DB_NAME`

Name der Anwendungsdatenbank:

```dotenv
DB_NAME=sc_orga_toolbox
```

### `DB_ROOT_PASSWORD`

Root-Passwort der MariaDB.

Dieses Passwort wird für die Initialisierung des Datenbankcontainers benötigt und darf nicht im Repository stehen.

---

## Infrastrukturvariablen

### `NGINX_HOST_PORT`

TCP-Port auf dem Produktionsserver, über den der Toolbox-Nginx lokal erreichbar ist.

Beispiel:

```dotenv
NGINX_HOST_PORT=8081
```

Anforderungen:

- Ganzzahl zwischen `1` und `65535`
- auf dem Zielserver noch nicht belegt
- nur an `127.0.0.1` binden
- nicht direkt öffentlich freigeben
- mit dem zentralen Reverse Proxy abstimmen
- nicht Port `8080` verwenden, solange dieser durch das ITE-Projekt belegt ist

Belegung prüfen:

```bash
ss -ltn | grep ':8081 '
```

Keine Ausgabe bedeutet, dass aktuell kein TCP-Listener auf diesem Port gefunden wurde.

Das Deployment-Skript validiert den Wert vor dem Start.

Docker Compose bricht bereits bei einer fehlenden Variable ab.

Der tatsächlich veröffentlichte Port kann angezeigt werden mit:

```bash
docker compose \
  --env-file .env.prod \
  -f docker-compose.prod.yml \
  port nginx 80
```

---

## Authentifizierungsvariablen

### `NEXTAUTH_SECRET`

Secret für die Signierung und Verschlüsselung von Authentifizierungsdaten.

Empfohlene Erzeugung:

```bash
openssl rand -base64 48
```

### `NEXTAUTH_URL`

Öffentliche URL der Anwendung.

Production:

```dotenv
NEXTAUTH_URL=https://toolbox.shfederation.org
```

Die URL muss das öffentliche HTTPS-Schema enthalten.

Nicht verwenden:

```dotenv
NEXTAUTH_URL=http://127.0.0.1:8081
```

Der lokale Nginx-Port ist nur der interne Einstiegspunkt des zentralen Reverse Proxys und nicht die öffentliche Anwendungs-URL.

### `SESSION_MAX_AGE`

Maximale Lebensdauer einer Session in Sekunden.

Beispiel für 24 Stunden:

```dotenv
SESSION_MAX_AGE=86400
```

### `SESSION_UPDATE_AGE`

Zeitintervall in Sekunden, nach dem eine aktive Session aktualisiert wird.

Beispiel für 15 Minuten:

```dotenv
SESSION_UPDATE_AGE=900
```

---

## Cron-Variablen

### `CRON_SECRET`

Secret zur Absicherung interner Cron-Endpunkte.

Der Wert muss mindestens 16 Zeichen lang sein.

Erzeugung:

```bash
openssl rand -base64 32
```

---

## RSI- und Organisations-API

### `ORGA_API_BASE_URL`

Basis-URL der verwendeten Organisations-API.

Die Variable muss eine gültige URL enthalten.

### `ORGA_API_KEY`

API-Key für die Organisations-API.

Der Wert darf nicht im Repository gespeichert werden.

### `VALID_ORGA_ID`

ID der erlaubten Star-Citizen-Organisation.

### `MAX_ATTEMPTS`

Maximale Anzahl der Prüfversuche.

Beispiel:

```dotenv
MAX_ATTEMPTS=18
```

---

## Secrets erzeugen

Für neue Secrets wird OpenSSL verwendet.

Allgemeines Secret:

```bash
openssl rand -base64 32
```

Längeres Secret für `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 48
```

Die erzeugten Werte dürfen nicht:

- im Repository eingecheckt werden
- in Tickets oder Pull Requests veröffentlicht werden
- in Screenshots sichtbar sein
- in ungeschützte Dokumentationen kopiert werden

---

## Dateirechte

Die Produktionsdatei sollte ausschließlich vom Deployment-Benutzer lesbar sein.

```bash
chmod 600 .env.prod
```

Dateirechte prüfen:

```bash
stat -c '%a %n' .env.prod
```

Erwartet:

```text
600 .env.prod
```

---

## Environment-Validierung

Anwendungsvariablen werden beim Start über `lib/env.ts` validiert.

Infrastrukturvariablen für Docker Compose, insbesondere `NGINX_HOST_PORT`, werden zusätzlich durch Docker Compose und `scripts/deploy.sh` geprüft.

Fehlende oder ungültige Werte verhindern den Start bewusst frühzeitig.

Production-Konfiguration validieren:

```bash
make prod-config
```

Das Deployment-Skript validiert zusätzlich den Nginx-Port:

```bash
make prod-deploy
```

Bei der Fehlersuche darf die vollständig aufgelöste Compose-Konfiguration nicht öffentlich geteilt werden, da darin Secrets aus `.env.prod` enthalten sein können.

---

## Hinweis zu Docker-Environment-Dateien

Docker interpretiert Environment-Dateien strenger als viele `dotenv`-Bibliotheken.

Inline-Kommentare hinter Variablenwerten werden nicht zuverlässig entfernt.

Nicht verwenden:

```dotenv
SESSION_MAX_AGE=86400 # 24 Stunden
```

Verwenden:

```dotenv
# 24 Stunden
SESSION_MAX_AGE=86400
```

Auch unnötige Anführungszeichen sollten vermieden werden.

Bevorzugt:

```dotenv
NGINX_HOST_PORT=8081
```

Nicht erforderlich:

```dotenv
NGINX_HOST_PORT="8081"
```

---

## Vollständigkeit prüfen

Vor einem Deployment:

```bash
make prod-config
```

Danach kann die Nginx-Konfiguration separat validiert werden:

```bash
make prod-nginx-test
```

Das vollständige Deployment erfolgt mit:

```bash
make prod-deploy
```
