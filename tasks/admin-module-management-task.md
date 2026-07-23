# Admin Module Management Task

## Ziel

Der administrative Bereich wird in klar getrennte Routen für Mitglieder- und Modulverwaltung aufgeteilt.

Das Hauptdashboard bleibt der zentrale Einstiegspunkt. Admins sehen dort zwei getrennte Verwaltungsmodule:

- Mitgliederverwaltung
- Modulverwaltung

Die bestehende Benutzerverwaltung wird unter `/admin/users` erreichbar. `/admin/modules` dient als Einstieg für die kommende datenbankgestützte Modulkonfiguration. Die Route `/admin` bleibt als kompatibler Einstieg bestehen und leitet auf die Mitgliederverwaltung weiter.

---

# M0 – Admin-Routing und Zugriffsschutz

## Aufgaben

- [x] gemeinsames Admin-Layout unter `/admin` anlegen
- [x] alle Admin-Unterseiten zentral mit `requireAdminSession()` schützen
- [x] `/admin` nach `/admin/users` weiterleiten
- [x] direkte Zugriffe durch nicht berechtigte Benutzer abweisen
- [x] bestehende Dashboard-Navigation weiterhin verwenden

## Akzeptanzkriterien

- `/admin` führt auf `/admin/users`.
- `/admin/users` und `/admin/modules` sind ausschließlich für `ADMIN` erreichbar.
- Nicht berechtigte Benutzer können keine Admin-Unterroute aufrufen.
- Der globale Header benötigt keine zusätzlichen Admin-Links.

---

# M1 – Mitgliederverwaltung unter eigener Route

## Aufgaben

- [x] bestehende Mitgliederverwaltung unter `/admin/users` bereitstellen
- [x] Status-Tabs auf `/admin/users?tab=...` umstellen
- [x] alle `revalidatePath()`-Aufrufe auf `/admin/users` anpassen
- [x] Überschrift und Beschreibung der Seite auf „Mitgliederverwaltung“ präzisieren
- [x] vorhandene Benutzeraktionen unverändert funktionsfähig halten
- [x] `/admin` als kompatiblen Redirect beibehalten

## Akzeptanzkriterien

- Die bestehende Mitgliederverwaltung funktioniert unter `/admin/users`.
- Alle Status-Tabs bleiben auswählbar.
- Aktivieren, Rollenwechsel, Sperren, Zurücksetzen und Löschen funktionieren weiterhin.
- Nach einer Mutation werden die sichtbaren Benutzerdaten aktualisiert.
- Bestehende Bookmarks auf `/admin` landen automatisch in der Mitgliederverwaltung.

---

# M2 – Modulverwaltung vorbereiten

## Aufgaben

- [x] Route `/admin/modules` anlegen
- [x] Überschrift und Beschreibung im MobiGlas-Stil darstellen
- [x] vorbereiteten Empty State für die kommende Modulkonfiguration anzeigen
- [x] noch keine Datenbankmigration hinzufügen
- [x] noch keine Server Actions für Moduländerungen implementieren

## Akzeptanzkriterien

- Admins können `/admin/modules` direkt öffnen.
- Die Seite fügt sich optisch in die bestehende Anwendung ein.
- Der vorbereitete Zustand macht deutlich, dass die eigentliche Konfiguration in einem Folge-Feature umgesetzt wird.
- Das Feature verändert das bestehende Prisma-Schema nicht.

---

# M3 – Dashboard-Integration

## Aufgaben

- [x] Mitgliederverwaltung auf `/admin/users` verlinken
- [x] Modulverwaltung als zweite Administrationskachel registrieren
- [x] beide Kacheln ausschließlich für `ADMIN` anzeigen
- [x] Beschreibung des Verwaltungsbereichs erweitern
- [x] bestehende Rollenfilterung weiterverwenden

## Akzeptanzkriterien

- Admins sehen im Hauptdashboard die Kacheln „Mitgliederverwaltung“ und „Modulverwaltung“.
- Mitglieder und Gäste sehen keine Administrationskacheln.
- Die Mitgliederverwaltung öffnet `/admin/users`.
- Die Modulverwaltung öffnet `/admin/modules`.
- Es entsteht kein zusätzliches Admin-Dashboard.

---

# M4 – Qualitätssicherung

## Aufgaben

- [x] `/admin`-Redirect testen
- [x] `/admin/users` als Admin testen
- [x] `/admin/modules` als Admin testen
- [x] beide Routen als nicht berechtigter Benutzer testen
- [x] alle Status-Tabs der Mitgliederverwaltung testen
- [x] mindestens eine Benutzeraktion mit anschließender Aktualisierung testen
- [x] beide Administrationskacheln im Hauptdashboard testen
- [x] Desktop- und Mobilansicht prüfen
- [x] `npm run lint` ausführen
- [x] `npm run build` ausführen
- [x] `git diff --check` ausführen

## Akzeptanzkriterien

- Routing und Zugriffsschutz funktionieren korrekt.
- Die bestehende Mitgliederverwaltung besitzt keine Regressionen.
- Beide Administrationsmodule sind über das Hauptdashboard erreichbar.
- Linting und Production-Build sind erfolgreich.
- Das Feature benötigt keine Datenbankmigration.

---

# Nicht Bestandteil

- persistente Modulkonfiguration
- neues Prisma-Modell für Module
- Module aktivieren oder deaktivieren
- Modulnamen und Beschreibungen bearbeiten
- Sortierung per Drag-and-drop
- Rollenfreigaben über eine Admin-Oberfläche
- frei konfigurierbare Modulrouten
- Modulstatistiken
- separates Admin-Dashboard

---

# Folge-Feature

Die eigentliche Modulverwaltung wird in einem separaten Feature umgesetzt. Geplant ist eine hybride Architektur:

- technischer Modulkatalog im Code
- konfigurierbare Metadaten in der Datenbank
- Aktivierungsstatus
- Anzeigename und Beschreibung
- Reihenfolge
- Kategorie
- erlaubte Rollen
- unabhängiger Zugriffsschutz der Zielrouten

---

# Definition of Done

- [x] gemeinsames Admin-Layout vorhanden
- [x] `/admin` leitet nach `/admin/users`
- [x] Mitgliederverwaltung unter `/admin/users` erreichbar
- [x] Modulverwaltung unter `/admin/modules` vorbereitet
- [x] Tab-Links angepasst
- [x] Revalidierungen angepasst
- [x] Dashboard enthält beide Admin-Kacheln
- [x] Rollenfilterung funktioniert
- [x] keine Datenbankmigration erforderlich
- [x] Linting erfolgreich
- [x] Production-Build erfolgreich
- [x] lokaler Funktionstest erfolgreich
