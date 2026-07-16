# Production Deployment Task

## Ziel

Die SC Orga Toolbox soll erstmals produktiv auf einem privaten Ubuntu-Server betrieben werden.

Die Anwendung läuft als Docker-Compose-Projekt mit einer persistenten MariaDB und ist über den bestehenden Apache-Reverse-Proxy unter `https://toolbox.shfederation.org` erreichbar.

Deployment erfolgt zunächst manuell über `make deploy` und SSH. Eine spätere Migration auf GitHub Actions ist ausdrücklich vorgesehen, aber **nicht Bestandteil dieses Tasks**.

---

# M0 – Server vorbereiten

## Aufgaben

- [ ] Ubuntu-Version dokumentieren
- [ ] Docker & Docker Compose prüfen
- [ ] Docker-Zugriff für den `toolbox`-User sicherstellen
- [ ] Projektverzeichnis festlegen
- [ ] SSH-Zugriff testen
- [ ] Reverse-Proxy-Konzept dokumentieren
- [ ] Apache-/Certbot-Konfiguration vom Serveradmin einholen

## Akzeptanzkriterien

- Server ist für das Deployment vorbereitet.
- Alle benötigten Infrastrukturinformationen liegen vor.

---

# M1 – Production Build

## Aufgaben

- [x] Next.js Standalone Build aktivieren
- [x] Produktionsbuild testen
- [x] Production Start lokal testen
- [x] Healthcheck-Endpunkt anlegen

## Akzeptanzkriterien

- `npm run build` erfolgreich
- Standalone Server startet fehlerfrei

---

# M2 – Docker

## Aufgaben

- [x] Multi-Stage Dockerfile
- [x] `.dockerignore`
- [x] Non-Root User
- [x] Prisma Generate
- [x] Standalone Build integrieren
- [x] Healthcheck konfigurieren
- [x] Runtime-Test des Containers erfolgreich durchgeführt

## Akzeptanzkriterien

- Docker Image baut erfolgreich
- Container startet fehlerfrei

---

# M3 – Docker Compose

## Aufgaben

- [x] `docker-compose.prod.yml`
- [x] MariaDB integriert
- [x] Persistentes Volume
- [x] internes Docker-Netzwerk
- [x] Webapp ausschließlich auf `127.0.0.1` veröffentlicht
- [x] Restart Policy
- [x] Container Healthchecks
- [x] Log-Rotation
- [x] Compose-Konfiguration validiert
- [x] Webapp und Datenbank starten erfolgreich
- [x] Persistenz nach Container-Neustart geprüft

## Akzeptanzkriterien

- Webapp und Datenbank laufen stabil.
- Daten bleiben nach Neustart erhalten.

---

# M4 – Environment

## Aufgaben

- [x] `.env.example` aktualisieren
- [x] `.env.prod` Konzept definieren
- [x] Secret-Erzeugung dokumentieren
- [x] Environment validieren

## Akzeptanzkriterien

- Keine Secrets im Repository.
- Anwendung startet nur mit vollständiger Konfiguration.

---

# M5 – Datenbank

## Aufgaben

- [ ] `prisma migrate deploy`
- [ ] separaten Migration-Service oder Deployment-Schritt für `prisma migrate deploy` umsetzen
- [ ] Deployment-Reihenfolge definieren
- [ ] Fehlerfall sauber behandeln

## Akzeptanzkriterien

- Migrationen laufen reproduzierbar.
- Fehlgeschlagene Migration stoppt das Deployment.

---

# M6 – Apache Reverse Proxy

## Aufgaben

- [ ] Apache VirtualHost konfigurieren
- [ ] Proxy auf `127.0.0.1:3000`
- [ ] HTTPS aktivieren
- [ ] Certbot integrieren
- [ ] NextAuth konfigurieren
- [ ] Security Header prüfen

## Akzeptanzkriterien

- Anwendung ist unter `https://toolbox.shfederation.org` erreichbar.

---

# M7 – Deployment

## Aufgaben

- [ ] `make deploy`
- [ ] `make prod-status`
- [ ] `make prod-logs`
- [ ] `make prod-restart`

## Akzeptanzkriterien

- Deployment erfolgt mit einem einzigen Befehl.

---

# M8 – Backups

## Aufgaben

- [ ] Datenbank-Backup-Skript
- [ ] tägliche automatische Backups
- [ ] Rotation (7 täglich / 4 wöchentlich)
- [ ] Restore dokumentieren

## Akzeptanzkriterien

- Backups laufen automatisch.
- Restore wurde erfolgreich getestet.

---

# M9 – Rollback

## Aufgaben

- [ ] Rollback dokumentieren
- [ ] vorherigen Commit deploybar machen

## Akzeptanzkriterien

- Vorherige Version kann wiederhergestellt werden.

---

# M10 – Logging

## Aufgaben

- [ ] Docker Log Rotation
- [ ] Betriebsbefehle ergänzen
- [ ] Containerstatus dokumentieren

## Akzeptanzkriterien

- Logs und Status sind einfach abrufbar.

---

# M11 – Security

## Aufgaben

- [ ] Secrets prüfen
- [ ] Dateirechte prüfen
- [ ] Root-freien Container verwenden
- [ ] MariaDB nicht öffentlich erreichbar
- [ ] Deployment-User dokumentieren

## Akzeptanzkriterien

- Deployment entspricht den definierten Sicherheitsanforderungen.

---

# M12 – Erstdeployment

## Aufgaben

- [ ] Docker Deployment
- [ ] Migration
- [ ] Healthcheck
- [ ] Login testen
- [ ] Registrierung testen
- [ ] Admin testen
- [ ] Cron testen

## Akzeptanzkriterien

- Die Anwendung läuft produktiv.

---

# M13 – Dokumentation

## Aufgaben

- [ ] PROJECT.md aktualisieren
- [ ] Deployment dokumentieren
- [ ] Betriebsabläufe dokumentieren

## Akzeptanzkriterien

- Deployment ist vollständig dokumentiert.

---

# Nicht Bestandteil

- GitHub Actions
- Kubernetes
- Docker Swarm
- Blue/Green Deployment
- Monitoring
- Cloud Backups
- Multi-Instance Betrieb

---

# Definition of Done

- [ ] Docker Multi-Stage Build vorhanden
- [ ] Docker Compose produktiv lauffähig
- [ ] Persistente MariaDB
- [ ] Healthcheck vorhanden
- [ ] `make deploy` funktioniert
- [ ] Migrationen laufen automatisch
- [ ] HTTPS über Apache
- [ ] tägliche Backups
- [ ] Restore getestet
- [ ] Rollback dokumentiert
- [ ] Produktionsbetrieb erfolgreich getestet
- [ ] Dokumentation aktualisiert
