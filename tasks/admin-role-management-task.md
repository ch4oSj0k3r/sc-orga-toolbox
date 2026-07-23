# Admin Role Management Task

## Ziel

Administratoren sollen die Rolle aktiver Benutzer direkt auf der Adminseite verwalten können.

Unterstützt werden die Rollenwechsel:

- `MEMBER` → `ADMIN`
- `ADMIN` → `MEMBER`

Die bestehende Rollenstruktur `GUEST`, `MEMBER`, `ADMIN` bleibt unverändert. Dieses Feature benötigt keine Prisma-Migration.

---

# M0 – Fachliche Regeln

## Aufgaben

- [x] Rollenwechsel nur für Benutzer mit Status `ACTIVE` erlauben
- [x] `MEMBER` zu `ADMIN` befördern
- [x] `ADMIN` zu `MEMBER` herabstufen
- [x] `GUEST` nicht als manuell auswählbare Zielrolle anbieten
- [x] Selbständerung der eigenen Rolle verhindern
- [x] Herabstufung des letzten verbleibenden Admins verhindern
- [x] Rollenänderung durch einen Bestätigungsdialog absichern

## Akzeptanzkriterien

- Nur aktive Mitglieder können manuell zwischen `MEMBER` und `ADMIN` wechseln.
- Der ausführende Admin kann seine eigene Rolle nicht ändern.
- Es bleibt jederzeit mindestens ein Admin bestehen.
- Ungültige Rollenwechsel werden serverseitig abgelehnt.

---

# M1 – Server Action

## Aufgaben

- [x] neue Server Action `updateUserRole` anlegen
- [x] Admin-Session mit `assertAdmin()` prüfen
- [x] Zielbenutzer laden und Existenz prüfen
- [x] Zielrolle serverseitig validieren
- [x] Status `ACTIVE` voraussetzen
- [x] Selbständerung verhindern
- [x] No-Op bei identischer Rolle abweisen
- [x] letzten Admin vor Herabstufung schützen
- [x] Rolle mit Prisma aktualisieren
- [x] `/admin` nach erfolgreicher Änderung revalidieren
- [x] verständliche Erfolgs- und Fehlermeldungen zurückgeben

## Akzeptanzkriterien

- Nicht autorisierte Aufrufe werden abgewiesen.
- Manipulierte oder nicht unterstützte Rollenwerte werden abgewiesen.
- Eine gültige Rollenänderung wird persistent gespeichert.
- Die Adminseite zeigt nach erfolgreicher Änderung die neue Rolle.

---

# M2 – Action Types und Hook

## Aufgaben

- [x] Action-Typen um Rollenaktionen erweitern
- [x] bestehende Action-Architektur möglichst beibehalten
- [x] Rollenwechsel im `useAdminUserActions`-Hook integrieren
- [x] Loading-State während der Aktion anzeigen
- [x] Erfolgs- und Fehlermeldungen über das bestehende Feedbacksystem darstellen
- [x] Bestätigungsmodal nach erfolgreicher Aktion schließen

## Akzeptanzkriterien

- Die Rollenaktion verwendet dieselbe Modal- und Feedbacklogik wie bestehende Adminaktionen.
- Mehrfachklicks während einer laufenden Aktion werden verhindert.
- Fehler aus der Server Action werden dem Admin angezeigt.

---

# M3 – Admin-Oberfläche

## Aufgaben

- [x] Rollenaktion ausschließlich bei Benutzern mit Status `ACTIVE` anzeigen
- [x] bei `MEMBER` die Aktion „Zum Admin machen“ anzeigen
- [x] bei `ADMIN` die Aktion „Zum Mitglied machen“ anzeigen
- [x] aktuelle Rolle weiterhin sichtbar darstellen
- [x] Rollenaktion optisch von Bann- und Löschaktionen unterscheiden
- [x] Bestätigungsdialog mit Benutzername und Zielrolle anzeigen
- [x] eigene Rolle in der Oberfläche nicht änderbar darstellen

## Akzeptanzkriterien

- Aktive Mitglieder können über eine eindeutige Aktion befördert werden.
- Admins können über eine eindeutige Aktion herabgestuft werden.
- Für nicht aktive Benutzer wird keine Rollenaktion angezeigt.
- Der aktuell eingeloggte Admin kann seine eigene Rolle nicht über die Oberfläche ändern.
- Die Oberfläche bleibt auf mobilen Ansichten nutzbar.

---

# M4 – Tests

## Aufgaben

- [x] `MEMBER` → `ADMIN` testen
- [x] `ADMIN` → `MEMBER` testen
- [x] Selbständerung testen
- [x] Herabstufung des letzten Admins testen
- [x] Rollenwechsel eines nicht aktiven Benutzers testen
- [x] identische Zielrolle testen
- [x] ungültigen Rollenwert testen
- [x] Berechtigungsprüfung für Nicht-Admins testen
- [x] Linting ausführen
- [x] TypeScript-/Production-Build ausführen

## Akzeptanzkriterien

- Gültige Rollenwechsel funktionieren.
- Alle Schutzregeln greifen sowohl in der UI als auch serverseitig.
- `npm run lint` ist erfolgreich.
- `npm run build` ist erfolgreich.

---

# M5 – Dokumentation und Deployment

## Aufgaben

- [x] Task-Checkboxen aktualisieren
- [x] Rollenverwaltung im PR beschreiben
- [x] keine Datenbankmigration erzeugen
- [x] Feature lokal mit mindestens zwei Adminaccounts testen
- [x] nach Merge reguläres Production-Deployment ausführen
- [x] Rollenwechsel auf dem Produktionssystem testen

## Akzeptanzkriterien

- Das Feature ist nachvollziehbar dokumentiert.
- Das Deployment benötigt keine Schemaänderung.
- Rollenverwaltung funktioniert nach dem Deployment über die Adminseite.

---

# Nicht Bestandteil

- neue Rollen neben `GUEST`, `MEMBER` und `ADMIN`
- frei konfigurierbare Berechtigungen
- Permission- oder Capability-System
- Rollenverwaltung für nicht aktive Benutzer
- Audit-Log für Rollenänderungen
- automatische Session-Abmeldung nach Rollenänderung
- Bearbeitung des eigenen Accounts
- Mehrfachauswahl oder Bulk-Rollenänderungen

---

# Definition of Done

- [x] Rollenwechsel `MEMBER` → `ADMIN` umgesetzt
- [x] Rollenwechsel `ADMIN` → `MEMBER` umgesetzt
- [x] nur für aktive Benutzer verfügbar
- [x] serverseitige Rollenvalidierung vorhanden
- [x] Selbständerung verhindert
- [x] letzter Admin geschützt
- [x] Bestätigungsdialog vorhanden
- [x] Erfolgs- und Fehlerfeedback vorhanden
- [x] Linting erfolgreich
- [x] Production-Build erfolgreich
- [x] lokale Funktionstests erfolgreich
- [x] Task aktualisiert
- [x] Production-Test erfolgreich
