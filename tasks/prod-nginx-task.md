# Production Nginx Task

## Ziel

Die SC Orga Toolbox soll auf dem Produktionsserver einen eigenen Nginx-Container als Reverse Proxy vor der Next.js-Webapp erhalten.

Der Nginx-Container wird über einen freien, konfigurierbaren Host-Port veröffentlicht und leitet Requests innerhalb des Docker-Netzwerks an `webapp:3000` weiter.

Die öffentliche Domain, TLS-Terminierung und Zertifikatsverwaltung bleiben zunächst außerhalb des Projekt-Stacks und werden durch die Serveradministration beziehungsweise den bestehenden zentralen Reverse Proxy übernommen.

---

# M0 – Server- und Port-Situation klären

## Aufgaben

- [ ] belegte Host-Ports auf dem Produktionsserver dokumentieren
- [ ] freien Host-Port für die Toolbox festlegen
- [ ] prüfen, ob der zentrale Reverse Proxy den Toolbox-Port über `127.0.0.1` erreichen kann
- [ ] Verantwortlichkeit für DNS, TLS und Zertifikate dokumentieren
- [ ] Zielarchitektur mit der Serveradministration abstimmen

## Akzeptanzkriterien

- Ein freier Host-Port für den Toolbox-Nginx ist festgelegt.
- Die Zuständigkeit für Domain, TLS und Zertifikate ist eindeutig dokumentiert.
- Die Weiterleitung des zentralen Reverse Proxys auf den Toolbox-Port ist technisch möglich.

---

# M1 – Nginx-Konfiguration

## Aufgaben

- [ ] Nginx-Konfiguration im Repository anlegen
- [ ] Requests an `http://webapp:3000` weiterleiten
- [ ] `Host`-Header weiterreichen
- [ ] `X-Real-IP` setzen
- [ ] `X-Forwarded-For` setzen
- [ ] `X-Forwarded-Proto` weiterreichen
- [ ] WebSocket- und Upgrade-Verbindungen unterstützen
- [ ] sinnvolle Timeouts konfigurieren
- [ ] Nginx-Konfiguration mit `nginx -t` validieren

## Akzeptanzkriterien

- Nginx leitet Requests korrekt an `webapp:3000` weiter.
- Die relevanten Proxy-Header werden korrekt gesetzt.
- WebSocket- beziehungsweise Upgrade-Verbindungen werden unterstützt.
- Die Nginx-Konfiguration ist syntaktisch gültig.

---

# M2 – Docker Compose

## Aufgaben

- [ ] Nginx-Service in `docker-compose.prod.yml` ergänzen
- [ ] Nginx-Image auf eine konkrete Version pinnen
- [ ] Nginx-Konfiguration read-only mounten
- [ ] Nginx in das interne Docker-Netzwerk aufnehmen
- [ ] Abhängigkeit zur Webapp konfigurieren
- [ ] Host-Port über `NGINX_HOST_PORT` konfigurierbar machen
- [ ] Nginx-Port nur auf der benötigten Host-Schnittstelle veröffentlichen
- [ ] direkten Host-Port der Webapp entfernen
- [ ] Restart Policy konfigurieren
- [ ] Log-Rotation konfigurieren
- [ ] Healthcheck für Nginx ergänzen
- [ ] Compose-Konfiguration validieren

## Akzeptanzkriterien

- Der Produktionsstack startet inklusive Nginx fehlerfrei.
- Der Nginx-Port ist über die Environment-Konfiguration steuerbar.
- Die Webapp ist nicht mehr direkt über einen Host-Port veröffentlicht.
- Nginx und Webapp kommunizieren ausschließlich über das interne Docker-Netzwerk.
- Der Nginx-Container wird als gesund gemeldet.

---

# M3 – Environment

## Aufgaben

- [ ] `NGINX_HOST_PORT` in `.env.example` ergänzen
- [ ] Beispielwert dokumentieren
- [ ] bereits belegten Port `8080` nicht als Standard verwenden
- [ ] Environment-Validierung für den Port ergänzen
- [ ] sicherstellen, dass keine Zertifikate oder Private Keys im Repository landen

## Akzeptanzkriterien

- Der Host-Port ist eindeutig konfigurierbar und dokumentiert.
- Eine fehlende oder ungültige Port-Konfiguration führt zu einer verständlichen Fehlermeldung.
- Es befinden sich keine TLS-Secrets im Repository.

---

# M4 – Deployment

## Aufgaben

- [ ] `scripts/deploy.sh` um den Nginx-Service erweitern
- [ ] Nginx nach erfolgreicher Migration und gestarteter Webapp starten
- [ ] Deployment-Healthcheck über den Nginx-Port ausführen
- [ ] Fehlerausgabe um Nginx-Logs ergänzen
- [ ] Containerstatus für Nginx anzeigen
- [ ] bestehende Deployments ohne unnötige Downtime aktualisieren
- [ ] vollständigen Deployment-Ablauf auf dem Produktionsserver testen

## Akzeptanzkriterien

- Das Deployment startet Datenbank, Migration, Webapp und Nginx in korrekter Reihenfolge.
- Der abschließende Healthcheck läuft über Nginx.
- Ein Fehler im Nginx-Service lässt das Deployment fehlschlagen.
- Das vollständige Deployment wurde auf dem Produktionsserver erfolgreich getestet.

---

# M5 – Reverse-Proxy-Integration

## Aufgaben

- [ ] lokalen Zugriff über den konfigurierten Host-Port testen
- [ ] Request mit produktivem `Host`-Header testen
- [ ] `/api/health` über Nginx testen
- [ ] Startseite über Nginx testen
- [ ] Login und Redirects über Nginx testen
- [ ] Verhalten von `X-Forwarded-Proto` bei vorgeschaltetem HTTPS-Proxy prüfen
- [ ] Ziel-Port an die Serveradministration übergeben
- [ ] öffentliche Weiterleitung auf den Toolbox-Port testen

## Akzeptanzkriterien

- Die Anwendung ist lokal über den Nginx-Host-Port erreichbar.
- `/api/health` liefert über Nginx einen erfolgreichen Response.
- Login, Redirects und absolute URLs funktionieren hinter dem Proxy korrekt.
- Der zentrale HTTPS-Reverse-Proxy kann Requests an den Toolbox-Nginx weiterleiten.
- Die Anwendung ist unter der produktiven Domain erreichbar.

---

# M6 – Security

## Aufgaben

- [ ] Nginx-Container ohne unnötige privilegierte Rechte betreiben
- [ ] Port nur auf der erforderlichen Host-Schnittstelle binden
- [ ] keine internen Services öffentlich veröffentlichen
- [ ] MariaDB weiterhin ausschließlich intern erreichbar halten
- [ ] unnötige Nginx-Header deaktivieren
- [ ] Request-Größenlimit prüfen und dokumentieren
- [ ] Security-Header mit zentralem Reverse Proxy abstimmen

## Akzeptanzkriterien

- Nur der Nginx-Host-Port ist für den vorgelagerten Proxy erreichbar.
- Webapp und Datenbank besitzen keine öffentlichen Host-Ports.
- Der Container benötigt keine privilegierten Rechte.
- Security-Header werden nicht widersprüchlich auf mehreren Proxy-Ebenen gesetzt.

---

# M7 – Dokumentation

## Aufgaben

- [ ] `docs/deployment.md` aktualisieren
- [ ] Zielarchitektur dokumentieren
- [ ] Nginx-Port und Environment-Konfiguration dokumentieren
- [ ] lokale Testbefehle dokumentieren
- [ ] Status- und Log-Befehle dokumentieren
- [ ] Zuständigkeiten für Projekt-Nginx und zentralen TLS-Proxy dokumentieren
- [ ] Troubleshooting für `502 Bad Gateway` ergänzen
- [ ] Troubleshooting für belegte Host-Ports ergänzen

## Akzeptanzkriterien

- Deployment und Betrieb des Nginx-Containers sind nachvollziehbar dokumentiert.
- Die Serveradministration kennt den zu verwendenden Toolbox-Port.
- Häufige Proxy- und Portfehler können anhand der Dokumentation geprüft werden.

---

# Nicht Bestandteil

- DNS-Konfiguration
- Ausstellung oder Erneuerung von TLS-Zertifikaten im Projekt-Stack
- direkte Belegung der Host-Ports 80 oder 443
- Änderung des bestehenden ITE-Nginx-Containers
- Konfiguration des zentralen Host-Reverse-Proxys
- Einführung von Traefik, Caddy oder Nginx Proxy Manager
- serverweite Vereinheitlichung aller Reverse-Proxy-Konfigurationen
- GitHub Actions
- Load Balancing oder Multi-Instance-Betrieb

---

# Definition of Done

- [ ] eigener Nginx-Container in `docker-compose.prod.yml`
- [ ] Nginx-Konfiguration im Repository versioniert
- [ ] Host-Port über Environment konfigurierbar
- [ ] Webapp nicht mehr direkt auf dem Host veröffentlicht
- [ ] Proxy-Header korrekt konfiguriert
- [ ] WebSocket-Upgrade unterstützt
- [ ] Nginx-Healthcheck vorhanden
- [ ] Deployment-Skript aktualisiert
- [ ] Healthcheck über Nginx erfolgreich
- [ ] vollständiges Deployment auf dem Produktionsserver getestet
- [ ] Weiterleitung durch den zentralen HTTPS-Reverse-Proxy erfolgreich
- [ ] produktive Domain funktioniert ohne Zertifikatsfehler
- [ ] Dokumentation aktualisiert
