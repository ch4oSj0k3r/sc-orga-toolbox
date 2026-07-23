# Dashboard Task

## Ziel

Die Next.js-Standardseite wird durch ein rollenabhängiges Dashboard im MobiGlas-Stil ersetzt.

Das Dashboard dient als zentraler Einstiegspunkt für alle zukünftigen Toolbox-Module. Verfügbare Systeme werden als Kacheln angezeigt. Administrative Funktionen erscheinen in einem getrennten Bereich und nur für berechtigte Benutzer.

---

# M0 – Navigation und Routing

## Aufgaben

- [ ] Root-Route `/` nach `/dashboard` weiterleiten
- [ ] Next.js-Standardseite vollständig entfernen
- [ ] `/dashboard` innerhalb des geschützten App-Layouts anlegen
- [ ] Logo im Header weiterhin auf `/dashboard` verlinken
- [ ] Admin-Link aus dem Header entfernen
- [ ] Header auf Logo, Benutzeranzeige und Logout reduzieren

## Akzeptanzkriterien

- `/` führt auf `/dashboard`.
- Nicht angemeldete Benutzer werden weiterhin zum Login geführt.
- Aktive Benutzer landen auf dem Dashboard.
- Die globale Navigation enthält keine modulspezifischen Links mehr.

---

# M1 – Modul-Registry

## Aufgaben

- [ ] zentrale Modul-Registry anlegen
- [ ] Modul-ID, Titel, Beschreibung und Zielroute definieren
- [ ] Kategorien `module` und `administration` unterstützen
- [ ] erlaubte Rollen pro Modul hinterlegen
- [ ] sichtbare Module anhand der Session-Rolle filtern
- [ ] Mitgliederverwaltung als erstes Administrationsmodul registrieren

## Akzeptanzkriterien

- Neue Module können zentral durch einen Registry-Eintrag ergänzt werden.
- Nicht berechtigte Benutzer erhalten keine Kachel für geschützte Systeme.
- Die Mitgliederverwaltung ist ausschließlich für `ADMIN` sichtbar.

---

# M2 – Dashboard-Oberfläche

## Aufgaben

- [ ] Begrüßungsbereich mit Benutzername anzeigen
- [ ] aktuelle Rolle als Zugriffslevel darstellen
- [ ] Modulbereich anlegen
- [ ] Verwaltungsbereich für administrative Systeme anlegen
- [ ] wiederverwendbare Modulkachel erstellen
- [ ] Empty State anzeigen, solange keine fachlichen Module existieren
- [ ] responsive Rasterdarstellung umsetzen
- [ ] Tastaturfokus und Link-Beschriftungen berücksichtigen

## Akzeptanzkriterien

- Dashboard entspricht dem bestehenden MobiGlas-Design.
- Kacheln funktionieren auf Desktop und Mobilgeräten.
- Normale Mitglieder sehen den Modul-Empty-State.
- Admins sehen zusätzlich die Kachel „Mitgliederverwaltung“.
- Die gesamte Kachel ist als Link bedienbar.

---

# M3 – Qualitätssicherung

## Aufgaben

- [ ] Root-Redirect testen
- [ ] Dashboard als `MEMBER` testen
- [ ] Dashboard als `ADMIN` testen
- [ ] Mitgliederverwaltung über Kachel öffnen
- [ ] Header auf Desktop testen
- [ ] Dashboard und Header mobil testen
- [ ] `npm run lint` ausführen
- [ ] `npm run build` ausführen
- [ ] `git diff --check` ausführen

## Akzeptanzkriterien

- Rollenfilterung funktioniert korrekt.
- Es entstehen keine doppelten Navigationswege im Header.
- Linting und Production-Build sind erfolgreich.
- Das Feature benötigt keine Datenbankmigration.

---

# Nicht Bestandteil

- frei sortierbare Kacheln
- Favoriten
- zuletzt verwendete Module
- Benachrichtigungszähler
- Modulstatistiken
- deaktivierte Vorschaukacheln
- neue fachliche Toolbox-Module
- dynamische Modulverwaltung über die Datenbank

---

# Definition of Done

- [ ] Standardseite entfernt
- [ ] Root-Redirect vorhanden
- [ ] Dashboard-Route vorhanden
- [ ] Modul-Registry vorhanden
- [ ] rollenabhängige Filterung vorhanden
- [ ] Mitgliederverwaltung als Admin-Kachel vorhanden
- [ ] Admin-Link aus Header entfernt
- [ ] Empty State vorhanden
- [ ] responsive Darstellung geprüft
- [ ] Linting erfolgreich
- [ ] Production-Build erfolgreich
- [ ] lokaler Funktionstest erfolgreich
- [ ] Production-Test erfolgreich
