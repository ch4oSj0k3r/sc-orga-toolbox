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
- `DB_HOST=db` verwenden (Docker Compose Netzwerk).
- `NEXTAUTH_URL` auf die produktive Domain setzen.

Beispiel:

```dotenv
DB_HOST=db
DB_PORT=3306
NEXTAUTH_URL=https://toolbox.shfederation.org
```

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

Alle benötigten Variablen werden beim Start der Anwendung über `lib/env.ts` validiert.

Fehlende oder ungültige Werte verhindern den Start der Anwendung bewusst frühzeitig.

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
