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

Enthält alle benötigten Environment-Variablen mit Beispielwerten oder leeren Platzhaltern.

Sie dient ausschließlich als Vorlage und darf keine produktiven Zugangsdaten enthalten.

---

## `.env.prod`

Die Produktionskonfiguration liegt ausschließlich auf dem Zielserver.

Empfehlungen:

- Datei niemals committen.
- Dateirechte auf `600` setzen.
- Keine Inline-Kommentare hinter Variablenwerten verwenden.
- `DB_HOST=db` verwenden (Docker-Compose-Netzwerk).
- `NEXTAUTH_URL` auf die produktive Domain setzen.
- `NGINX_HOST_PORT` auf einen freien Host-Port setzen.
- Port `8080` nicht verwenden, da er bereits von einem anderen Projekt belegt ist.

Beispiel:

```dotenv
DB_HOST=db
DB_PORT=3306
NGINX_HOST_PORT=8081
NEXTAUTH_URL=https://toolbox.shfederation.org
```

Der Nginx-Port wird ausschließlich an `127.0.0.1` gebunden. Der zentrale HTTPS-Reverse-Proxy leitet auf diesen Port weiter.

---

## Infrastrukturvariablen

### `NGINX_HOST_PORT`

TCP-Port auf dem Produktionsserver, über den der Toolbox-Nginx lokal erreichbar ist.

Anforderungen:

- Ganzzahl zwischen `1` und `65535`
- auf dem Zielserver noch nicht belegt
- nicht direkt öffentlich freigeben
- mit dem zentralen Reverse Proxy abstimmen

Das Deployment-Skript validiert den Wert vor dem Start. Docker Compose bricht bereits bei einer fehlenden Variable ab.

---

## Secrets erzeugen

Für neue Secrets wird OpenSSL verwendet.

```bash
openssl rand -base64 32
```

Für `NEXTAUTH_SECRET` wird ein längerer Wert empfohlen.

```bash
openssl rand -base64 48
```

---

## Dateirechte

Die Produktionsdatei sollte ausschließlich vom Deployment-Benutzer lesbar sein.

```bash
chmod 600 .env.prod
```

---

## Environment-Validierung

Anwendungsvariablen werden beim Start über `lib/env.ts` validiert.

Infrastrukturvariablen für Docker Compose, insbesondere `NGINX_HOST_PORT`, werden zusätzlich durch Compose und `scripts/deploy.sh` geprüft.

Fehlende oder ungültige Werte verhindern den Start bewusst frühzeitig.

---

## Hinweis zu Docker

Docker interpretiert Environment-Dateien strenger als `dotenv`.

Inline-Kommentare hinter Variablenwerten werden **nicht** entfernt.

**Nicht verwenden**

```dotenv
SESSION_MAX_AGE=86400 # 24 Stunden
```

**Verwenden**

```dotenv
# 24 Stunden
SESSION_MAX_AGE=86400
```
