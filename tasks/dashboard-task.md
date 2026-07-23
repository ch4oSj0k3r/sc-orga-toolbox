# Dashboard Task

## Ziel

Die Next.js-Standardseite wird durch ein rollenabhängiges Dashboard im MobiGlas-Stil ersetzt.

Das Dashboard dient als zentraler Einstiegspunkt für alle zukünftigen Toolbox-Module. Verfügbare Systeme werden als Kacheln angezeigt. Administrative Funktionen erscheinen in einem getrennten Bereich und nur für berechtigte Benutzer.

---

# M0 – Navigation und Routing

## Aufgaben

- [x] Root-Route `/` nach `/dashboard` weiterleiten
- [x] Next.js-Standardseite vollständig entfernen
- [x] `/dashboard` innerhalb des geschützten App-Layouts anlegen
- [x] Logo im Header weiterhin auf `/dashboard` verlinken
- [x] Admin-Link aus dem Header entfernen
- [x] Header auf Logo, Benutzeranzeige und Logout reduzieren

## Akzeptanzkriterien

- `/` führt auf `/dashboard`.
- Nicht angemeldete Benutzer werden weiterhin zum Login geführt.
- Aktive Benutzer landen auf dem Dashboard.
- Die globale Navigation enthält keine modulspezifischen Links mehr.

---

# M1 – Modul-Registry

## Aufgaben

- [x] zentrale Modul-Registry anlegen
- [x] Modul-ID, Titel, Beschreibung und Zielroute definieren
- [x] Kategorien `module` und `administration` unterstützen
- [x] erlaubte Rollen pro Modul hinterlegen
- [x] sichtbare Module anhand der Session-Rolle filtern
- [x] Mitgliederverwaltung als erstes Administrationsmodul registrieren

## Akzeptanzkriterien

- Neue Module können zentral durch einen Registry-Eintrag ergänzt werden.
- Nicht berechtigte Benutzer erhalten keine Kachel für geschützte Systeme.
- Die Mitgliederverwaltung ist ausschließlich für `ADMIN` sichtbar.

---

# M2 – Dashboard-Oberfläche

## Aufgaben

- [x] Begrüßungsbereich mit Benutzername anzeigen
- [x] aktuelle Rolle als Zugriffslevel darstellen
- [x] Modulbereich anlegen
- [x] Verwaltungsbereich für administrative Systeme anlegen
- [x] wiederverwendbare Modulkachel erstellen
- [x] Empty State anzeigen, solange keine fachlichen Module existieren
- [x] responsive Rasterdarstellung umsetzen
- [x] Tastaturfokus und Link-Beschriftungen berücksichtigen

## Akzeptanzkriterien

- Dashboard entspricht dem bestehenden MobiGlas-Design.
- Kacheln funktionieren auf Desktop und Mobilgeräten.
- Normale Mitglieder sehen den Modul-Empty-State.
- Admins sehen zusätzlich die Kachel „Mitgliederverwaltung“.
- Die gesamte Kachel ist als Link bedienbar.

---

# M3 – Qualitätssicherung

## Aufgaben

- [x] Root-Redirect testen
- [x] Dashboard als `MEMBER` testen
- [x] Dashboard als `ADMIN` testen
- [x] Mitgliederverwaltung über Kachel öffnen
- [x] Header auf Desktop testen
- [x] Dashboard und Header mobil testen
- [x] `npm run lint` ausführen
- [x] `npm run build` ausführen
- [x] `git diff --check` ausführen

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

- [x] Standardseite entfernt
- [x] Root-Redirect vorhanden
- [x] Dashboard-Route vorhanden
- [x] Modul-Registry vorhanden
- [x] rollenabhängige Filterung vorhanden
- [x] Mitgliederverwaltung als Admin-Kachel vorhanden
- [x] Admin-Link aus Header entfernt
- [x] Empty State vorhanden
- [x] responsive Darstellung geprüft
- [x] Linting erfolgreich
- [x] Production-Build erfolgreich
- [x] lokaler Funktionstest erfolgreich
- [x] Production-Test erfolgreich
