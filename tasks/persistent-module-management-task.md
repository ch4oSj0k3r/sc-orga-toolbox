# Persistent Module Management Task

## Ziel

Die Dashboard-Module erhalten eine persistente Konfiguration in der Datenbank.

Der technische Modulkatalog bleibt im Code und definiert unveränderliche Eigenschaften wie Modul-ID, Route, Kategorie und Konfigurationsrichtlinien. Änderbare Eigenschaften werden in der Datenbank gespeichert und mit den technischen Definitionen zu einer effektiven Modulkonfiguration zusammengeführt.

Administratoren können Module:

- umbenennen
- beschreiben
- aktivieren oder deaktivieren
- sortieren
- für ausgewählte Systemrollen freigeben

Administrative Kernmodule werden durch technische Richtlinien vor Deaktivierung oder unzulässigen Rollenfreigaben geschützt.

Zugriffsgruppen und Benutzerzuweisungen sind nicht Bestandteil dieses Features und werden in PR #18 umgesetzt.

---

# M0 – Technischer Modulkatalog

## Aufgaben

- [x] bestehende Modul-Registry in einen technischen Modulkatalog überführen
- [x] Standardtitel und Standardbeschreibung definieren
- [x] Standardrollen pro Modul definieren
- [x] verpflichtende Rollen pro Modul definieren
- [x] granulare Konfigurationsrichtlinien pro Modul einführen
- [x] technische Route und Kategorie ausschließlich im Code halten
- [x] Helper zum Auflösen einer Moduldefinition anhand der Modul-ID bereitstellen

## Vorgesehene Struktur

```ts
interface ModuleConfigurationPolicy {
    title: boolean;
    description: boolean;
    enabled: boolean;
    sortOrder: boolean;
    allowedRoles: boolean;
}

interface ModuleDefinition {
    id: string;
    defaultTitle: string;
    defaultDescription: string;
    href: string;
    category: ModuleCategory;
    defaultAllowedRoles: Role[];
    mandatoryRoles: Role[];
    configuration: ModuleConfigurationPolicy;
}
```

## Akzeptanzkriterien

- Modul-ID, Route und Kategorie können nicht über die Datenbank verändert werden.
- Jedes Modul besitzt vollständige Standardwerte.
- Jedes konfigurierbare Feld wird separat durch eine Richtlinie geschützt.
- Unbekannte Modul-IDs werden serverseitig abgewiesen.

---

# M1 – Persistentes Datenmodell

## Aufgaben

- [x] Prisma-Modell `ModuleConfiguration` ergänzen
- [x] Prisma-Modell `ModuleAllowedRole` ergänzen
- [x] relationale Rollenfreigaben umsetzen
- [x] Migration für die neuen Tabellen erzeugen
- [x] Prisma-Client neu generieren
- [x] bestehende Benutzer- und Authentifizierungsmodelle unverändert lassen

## Vorgesehenes Schema

```prisma
model ModuleConfiguration {
  moduleId    String   @id
  title       String?
  description String?  @db.Text
  enabled     Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  allowedRoles ModuleAllowedRole[]

  @@map("module_configurations")
}

model ModuleAllowedRole {
  moduleId String
  role     Role

  module ModuleConfiguration @relation(
    fields: [moduleId],
    references: [moduleId],
    onDelete: Cascade
  )

  @@id([moduleId, role])
  @@map("module_allowed_roles")
}
```

## Akzeptanzkriterien

- Eine Modulkonfiguration wird eindeutig über die technische Modul-ID identifiziert.
- Rollen werden relational und nicht als unvalidiertes JSON gespeichert.
- Beim Löschen einer Modulkonfiguration werden zugehörige Rollenfreigaben entfernt.
- Ein Seed ist für den Betrieb nicht zwingend erforderlich.

---

# M2 – Effektive Modulkonfiguration

## Aufgaben

- [x] technische Definitionen mit Datenbankeinträgen zusammenführen
- [x] Standardwerte verwenden, falls kein Datenbankeintrag existiert
- [x] nicht konfigurierbare Felder immer aus dem Code übernehmen
- [x] verpflichtende Rollen immer ergänzen
- [x] doppelte Rollen entfernen
- [x] Module nach effektiver Sortierreihenfolge sortieren
- [x] deaktivierte Module aus dem regulären Dashboard entfernen
- [x] serverseitigen Service für Dashboard und Adminseite bereitstellen

## Regeln

- Fehlt eine Datenbankkonfiguration, gelten die Standardwerte aus dem Code.
- `mandatoryRoles` können niemals entfernt werden.
- Nicht konfigurierbare Rollen verwenden immer `defaultAllowedRoles`.
- Nicht deaktivierbare Module bleiben unabhängig vom Datenbankwert aktiv.
- Nicht konfigurierbare Texte und Sortierwerte verwenden immer die Code-Defaults.

## Akzeptanzkriterien

- Die Anwendung funktioniert direkt nach der Migration ohne manuelles Anlegen von Datensätzen.
- Änderungen in der Datenbank wirken auf das Dashboard.
- Manipulierte Datenbankwerte können technische Schutzregeln nicht umgehen.
- Administratoren behalten Zugriff auf administrative Kernmodule.

---

# M3 – Dashboard-Integration

## Aufgaben

- [x] Dashboard-Module serverseitig aus der effektiven Konfiguration laden
- [x] Rollenfilterung mit effektiven Rollenfreigaben durchführen
- [x] deaktivierte Module nicht anzeigen
- [x] effektiven Titel und effektive Beschreibung verwenden
- [x] effektive Sortierreihenfolge anwenden
- [x] bestehende Kategorien `module` und `administration` beibehalten
- [x] bestehende Empty States weiterhin unterstützen

## Akzeptanzkriterien

- Das Dashboard zeigt ausschließlich aktive und freigegebene Module.
- Änderungen an Titel, Beschreibung, Reihenfolge oder Rollen werden sichtbar.
- Normale Mitglieder sehen keine ausschließlich administrativen Module.
- Das Dashboard bleibt vollständig serverseitig autorisiert.

---

# M4 – Verwaltungsoberfläche

## Aufgaben

- [ ] `/admin/modules` an die persistente Konfiguration anbinden
- [ ] alle technischen Module anzeigen
- [ ] technische Modul-ID und Route schreibgeschützt darstellen
- [ ] Titel bearbeiten
- [ ] Beschreibung bearbeiten
- [ ] Aktivierungsstatus bearbeiten, sofern erlaubt
- [ ] Sortierreihenfolge bearbeiten, sofern erlaubt
- [ ] erlaubte Systemrollen bearbeiten, sofern erlaubt
- [ ] nicht konfigurierbare Felder sichtbar deaktivieren oder ausblenden
- [ ] Speichern pro Modul ermöglichen
- [ ] Konfiguration auf Standardwerte zurücksetzen können
- [ ] verständliche Erfolgs- und Fehlermeldungen anzeigen

## Akzeptanzkriterien

- Administratoren können erlaubte Modulwerte bearbeiten.
- Gesperrte Felder können nicht manipuliert werden.
- Änderungen werden nach dem Speichern unmittelbar angezeigt.
- Zurücksetzen entfernt oder neutralisiert die persistente Überschreibung.
- Die Oberfläche funktioniert auf Desktop und Mobilgeräten.

---

# M5 – Server Actions und Validierung

## Aufgaben

- [ ] Admin-Server-Action zum Speichern einer Modulkonfiguration erstellen
- [ ] Admin-Server-Action zum Zurücksetzen einer Modulkonfiguration erstellen
- [ ] Eingaben mit Zod validieren
- [ ] technische Modul-ID gegen den Katalog validieren
- [ ] Konfigurationsrichtlinien serverseitig erzwingen
- [ ] Rollenwerte gegen das Prisma-Enum validieren
- [ ] Speicherung von Konfiguration und Rollen in einer Transaktion durchführen
- [ ] betroffene Routen revalidieren

## Validierungsgrenzen

- Titel: 1 bis 80 Zeichen
- Beschreibung: 1 bis 300 Zeichen
- Sortierreihenfolge: ganze Zahl zwischen 0 und 9999
- mindestens eine effektive Rolle nach Anwendung der verpflichtenden Rollen
- keine unbekannten Rollen
- keine unbekannten Modul-IDs

## Zu revalidierende Routen

```text
/dashboard
/admin/modules
```

## Akzeptanzkriterien

- Clientseitige Manipulation kann Richtlinien nicht umgehen.
- Ungültige Eingaben erzeugen keine Teiländerungen.
- Rollenfreigaben und Modulkonfiguration werden atomar gespeichert.
- Fehler werden kontrolliert an die Oberfläche zurückgegeben.

---

# M6 – Aussperr- und Sicherheitsschutz

## Aufgaben

- [ ] `ADMIN` für administrative Kernmodule verpflichtend machen
- [ ] Deaktivierung der Mitgliederverwaltung verhindern
- [ ] Deaktivierung der Modulverwaltung verhindern
- [ ] Rollenbearbeitung für administrative Kernmodule sperren
- [ ] Route und Kategorie niemals aus Datenbankwerten bilden
- [ ] Dashboard-Sichtbarkeit nicht als alleinigen Zugriffsschutz behandeln
- [ ] bestehendes Admin-Layout für `/admin/*` beibehalten

## Akzeptanzkriterien

- Ein Admin kann die Modulverwaltung nicht deaktivieren.
- Ein Admin kann sich nicht durch Entfernen der Adminrolle aussperren.
- Ein Datenbankeintrag kann ein Administrationsmodul nicht für Mitglieder öffnen.
- Direkte Zugriffe auf Adminrouten bleiben serverseitig geschützt.

---

# M7 – Qualitätssicherung

## Aufgaben

- [ ] Anwendung ohne vorhandene Modulkonfiguration testen
- [ ] Standardwerte aus dem Code testen
- [ ] Titeländerung testen
- [ ] Beschreibungsänderung testen
- [ ] Sortierung testen
- [ ] Aktivierung und Deaktivierung eines erlaubten Moduls testen
- [ ] Rollenfreigabe eines konfigurierbaren Moduls testen
- [ ] verpflichtende Rollen testen
- [ ] gesperrte Kernmodule testen
- [ ] Zurücksetzen auf Standardwerte testen
- [ ] unbekannte Modul-ID testen
- [ ] ungültige Rolle testen
- [ ] Desktop- und Mobilansicht prüfen
- [ ] Migration in einer leeren Datenbank testen
- [ ] Migration mit bestehenden Benutzerdaten testen
- [ ] `npm run lint` ausführen
- [ ] `npm run build` ausführen
- [ ] `git diff --check` ausführen

## Akzeptanzkriterien

- Bestehende Benutzer- und Adminfunktionen besitzen keine Regressionen.
- Die Anwendung startet nach der Migration ohne manuelle Konfiguration.
- Technische Richtlinien werden sowohl in der Oberfläche als auch serverseitig erzwungen.
- Linting und Production-Build sind erfolgreich.

---

# Nicht Bestandteil

- Zugriffsgruppen
- Gruppendefinitionen
- Gruppenzuweisungen zu Modulen
- Gruppenzuweisungen zu Benutzern
- Drag-and-drop-Sortierung
- freie Bearbeitung von Modul-ID, Route oder Kategorie
- Erstellen beliebiger neuer Module in der Datenbank
- Löschen technischer Module
- zeitgesteuerte Freigaben
- Audit-Log für Konfigurationsänderungen
- individuelle Benutzerfreigaben

---

# Folge-Feature PR #18

PR #18 behandelt Zugriffsgruppen.

Dabei werden insbesondere folgende Fragen entschieden und umgesetzt:

- globale oder modulspezifische Gruppen
- technischer Gruppenschlüssel und Anzeigename
- Gruppenerstellung und Gruppenbearbeitung
- Zuordnung einer Gruppe zu einem oder mehreren Modulen
- Zuordnung von Benutzern zu Gruppen
- Archivierung und Löschung
- Darstellung in Mitglieder- und Modulverwaltung
- Auswertung im serverseitigen Modulzugriff

---

# Definition of Done

- [ ] technischer Modulkatalog mit Konfigurationsrichtlinien vorhanden
- [ ] persistentes Prisma-Datenmodell vorhanden
- [ ] Migration vorhanden
- [ ] effektive Konfiguration aus Code und Datenbank vorhanden
- [ ] verpflichtende Rollen werden erzwungen
- [ ] Dashboard verwendet persistente Konfiguration
- [ ] Modulverwaltung erlaubt freigegebene Änderungen
- [ ] Speichern und Zurücksetzen funktionieren
- [ ] administrative Kernmodule sind geschützt
- [ ] unbekannte Module und Rollen werden abgewiesen
- [ ] keine Gruppenfunktionalität enthalten
- [ ] Linting erfolgreich
- [ ] Production-Build erfolgreich
- [ ] Migration erfolgreich getestet
- [ ] lokaler Funktionstest erfolgreich
