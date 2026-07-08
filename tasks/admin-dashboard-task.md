# Task: Implementierung Admin-Dashboard (/admin)

## 🔒 1. Absicherung & Routing

- [x] **Datenbank-Migration:** `schema.prisma` erweitern und via `npx prisma migrate dev --name add_banned_and_timestamps` in die MariaDB einspielen:
    - `UserStatus`-Enum um `BANNED` erweitern.
    - `User`-Model um `rejectedAt DateTime?` erweitern.
    - `User`-Model um `bannedAt DateTime?` erweitern.
- [x] **Middleware-Schutz:** Die `proxy.ts` (oder `middleware.ts`) erweitern, um die Route `/admin` strikt für alle User zu sperren, die nicht die Rolle `Role.ADMIN` besitzen.
- [x] **Routen-Basis:** Erstellung der Datei `app/admin/page.tsx` inklusive einer serverseitigen Session-Überprüfung (`getServerSession`) als doppelter Boden gegen unbefugte Aufrufe.

## ⚙️ 2. Server Actions (Backend mit Admin-Schutzzaun)

_Hinweis: Jede dieser Actions muss intern prüfen, ob die aufrufende Session die Rolle `ADMIN` besitzt._

- [x] `getAdminDashboardData()`: Holt aggregierte Daten und trennt sie in fünf saubere Listen: `PENDING`, `VERIFIED`, `ACTIVE`, `REJECTED` und `BANNED`.
- [x] `activateUser(userId)`: Setzt den Status eines Users auf `ACTIVE` und die Rolle auf `MEMBER`.
- [x] `banUser(userId)`: Setzt den Status eines aktiven Users auf `BANNED` und befüllt `bannedAt` mit der aktuellen Zeit, um ihn sofort auszuschließen.
- [x] `resetUserAttempts(userId)`: Setzt bei einem abgelehnten User die `failed_attempts` zurück auf `0`, den Status auf `PENDING` und leert das Feld `rejectedAt` (`null`).
- [x] `deleteUser(userId)`: Löscht den User-Datensatz vollständig aus der MariaDB (verfügbar als universelle Aktion in allen Tabellen).

## 🖥️ 3. UI/UX Komponenten (Funktionales Tabellen-Layout)

_Hinweis: Das Design wird rein funktional gehalten, da das visuelle Framework später im Zuge des "MobiGlas"-Themes global überarbeitet wird._

- [ ] **Sektion 1: Warteschlange (`PENDING`)**
    - Tabelle der User im Validierungs-Loop.
    - Spalten: RSI-Handle, Registrierungsdatum (`createdAt`), Fehlversuche (z. B. `4/18`).
    - Aktionen: [Löschen]
- [ ] **Sektion 2: Freischaltungen (`VERIFIED`)**
    - Tabelle der User, die den Token-Check erfolgreich bestanden haben.
    - Spalten: RSI-Handle, Verifizierungsdatum (`updatedAt` beim Wechsel auf VERIFIED).
    - Aktionen: **[Aktivieren]** (wird zum Member), [Löschen]
- [ ] **Sektion 3: Aktive Mitglieder (`ACTIVE`)**
    - Übersicht der freigeschalteten Organisation-Mitglieder.
    - Spalten: RSI-Handle, Rolle, Beitrittsdatum.
    - Aktionen: **[Sperren]** (wird Banned), [Löschen]
- [ ] **Sektion 4: Problemfälle (`REJECTED`)**
    - Tabelle der Accounts, bei denen der automatische Token-Check fehlgeschlagen ist.
    - Spalten: RSI-Handle, Abbruchdatum (`rejectedAt`).
    - Aktionen: **[Reset]** (zurück zu Pending), [Löschen]
- [ ] **Sektion 5: Gesperrt (`BANNED`)**
    - Liste der permanent ausgeschlossenen Accounts.
    - Spalten: RSI-Handle, Sperrdatum (`bannedAt`).
    - Aktionen: [Löschen] (hebt die Sperre/Blockierung des Handles wieder auf)
- [ ] **Globaler Steuerungs-Trigger**
    - Button am oberen Bildschirmrand, um den bestehenden Cron-Job `/api/cron/verify` manuell per `fetch` anzustoßen.
    - Implementierung eines globalen Lade-Zustands (`loading`), der die gesamte UI während der asynchronen RSI-API-Abfragen blockiert, um Mehrfach-Klicks zu verhindern.
