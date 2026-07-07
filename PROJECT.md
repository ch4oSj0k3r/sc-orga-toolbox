# 🚀 Star Citizen Orga ToolBox

Eine modulare, immersive Webapplikation für die Organisation, basierend auf einem hochperformanten Tech-Stack und einem automatisierten RSI-Verifizierungsprozess. Das Design ist im immersiven **MobiGlas-Style** gehalten.

---

## 🛠 Tech-Stack & Architektur

- **Frontend/Backend:** Next.js (App Router, TypeScript)
- **Datenbank-ORM:** Prisma v7
- **Datenbank:** MariaDB
- **Authentifizierung:** NextAuth.js (Credentials Provider)
- **Styling:** Tailwind CSS (Custom MobiGlas Theme)
- **Infrastruktur:** Docker & Docker Compose
- **Automation:** Makefile

---

## 🏗 System-Architektur & Container-Struktur

Die Applikation folgt strikt dem Prinzip "Keep It Simple As Possible". Die gesamte Logik (inklusive der Hintergrund-Verifizierung) läuft innerhalb der Next.js-Anwendung.

### Lokale Entwicklung (Development Setup)

Während der Entwicklung läuft nur die Datenbank in Docker, um maximale Performance und schnelles Hot-Reloading zu gewährleisten:

1. sc-db (MariaDB): Der Datenbank-Container.

- Die Next.js App wird lokal via `npm run dev` gestartet.

### Server-Betrieb (Production Setup)

Auf dem Server wird das System über drei Container orchestriert:

1. sc-nginx (Optionaler Reverse Proxy): Der Gatekeeper. Er lauscht auf Port 80/443, verwaltet die SSL-Zertifikate (Let's Encrypt) und leitet den Traffic intern weiter.
2. sc-webapp (Next.js): Die Core-Anwendung. Sie enthält das Frontend, die API-Routen (inkl. Verifizierungs-Cron) und die gesamte Business-Logik.
3. sc-db (MariaDB): Die zentrale relationale Datenbank.

---

## 🔒 Authentifizierung & Verifizierungs-Workflow

Um Fake-Accounts zu verhindern und gleichzeitig den Administrationsaufwand zu minimieren, läuft die Registrierung über einen vollautomatischen, in-app gesteuerten Prozess ab:

1. Registrierung: Der User registriert sich mit sc_handle und Wunschpasswort. Er erhält den Status PENDING und ein einzigartiges verification_token.
2. Validierung: Der User hinterlegt das Token in seiner RSI-Short-Bio.
3. In-App Hintergrund-Prüfung & Manueller Trigger (Out of the Box):
    - **Automatisch:** Sobald die Next.js App im Docker-Container startet, initialisiert sie über die zentrale `app/instrumentation.ts` einen Hintergrund-Task (via node-cron). Dieser Task läuft alle 10 Minuten isoliert im Node.js-Prozess und prüft alle PENDING-User gegen die Orga-API.
    - **Manuell (Admin-Trigger):** Parallel dazu existiert der API-Endpunkt `/api/cron/verify`. Ein Admin kann im Dashboard per Button-Klick diesen Endpunkt triggern, um eine Verifizierung sofort manuell zu erzwingen (z. B. wenn ein User im Discord auf seine Freischaltung wartet).
    - **Ergebnis:** Bei Erfolg wechselt der Status auf VERIFIED (Rolle Guest). Bei Fehlschlag wechselt er nach X Versuchen auf REJECTED und wird nach 24 Stunden gelöscht.
4. Admin-Aktivierung: Ein Admin sieht alle VERIFIED-User im Dashboard und schaltet sie mit einem Klick auf ACTIVE frei (Zuweisung der Rolle Member). Erst jetzt erlaubt NextAuth.js den erfolgreichen Login.

---

## 👥 Rechtesystem (Zukunftssicher vorbereitet)

Für den MVP nutzen wir ein festes Rollenset, das jedoch im Prisma-Schema über eine relationale Struktur (User -> Role -> Permission) abgebildet ist.

- MVP-Rollen: Guest, Member, Officer, Admin
- Die Rechteprüfung im Next.js-Code erfolgt deklarativ via Permissions (z.B. users:write), sodass in Version 2.0 ein voll-dynamisches UI-Rechtesystem ohne Schema-Änderung nachgerüstet werden kann.

---

## 📁 Projektstruktur

Das Projekt nutzt die Standard-Struktur von create-next-app:

```text
my-sc-toolbox/
├── app/                  # Next.js App Router (Standard)
│   ├── (auth)/           # Login, Registrierung (RSI-Token Vergabe)
│   ├── (dashboard)/      # Dashboard, Admin-Panel, zukünftige Module
│   ├── api/
│   │   └── cron/         # Endpunkt für manuelle/externe Verifizierungs-Trigger
│   ├── instrumentation.ts # Boot-Hook: Initialisiert den automatischen node-cron
│   └── layout.tsx        # Globales MobiGlas-Theme & NextAuth Provider
├── components/           # Globale UI-Komponenten (shadcn/ui)
├── prisma/               # Prisma ORM v7
│   └── schema.prisma     # Relationales Datenmodell
├── .husky/               # Git-Hooks (Linting & Commit-Check)
├── .env.example          # Vorlage für lokale Umgebungsvariablen (ohne Secrets)
├── Dockerfile            # Dockerfile für Next.js Webapp (Production)
├── docker-compose.yml    # Multi-Container-Setup (Local/Prod)
├── Makefile              # Zentrale CLI-Befehle
├── tailwind.config.ts    # MobiGlas Farbpaletten & Scanline-Effekte
└── PROJECT.md            # Diese Dokumentation
```

---

## ⚙️ Entwicklungs-Richtlinien & Code Quality

Um die Code-Qualität hochzuhalten und Merge-Konflikte zu minimieren, gelten strikte Regeln für das GitHub-Repository.

### 1. Git-Workflow

- Der main-Branch ist die Source of Truth und immer deploybar.
- Entwickelt wird ausschließlich in Feature-Branches (feature/feature-name). Merge Requests erfolgen via Pull Request auf main.

### 2. Husky & Code Quality Hooks

Vor jedem Commit (pre-commit) führt Husky automatisch folgende Schritte aus:

1. Linter: npm run lint (Prüfung auf Code-Style und TypeScript-Fehler).
2. Prettier: npx prettier --write (Automatische Code-Formatierung).
   _Schlägt einer der Schritte fehl, wird der Commit blockiert._

### 3. Semantic Commits

Commit-Nachrichten müssen dem Conventional-Commits-Standard entsprechen. Husky prüft dies via commitlint.

- feat: ... (Ein neues Feature)
- fix: ... (Ein Bugfix)
- docs: ... (Änderungen an der Dokumentation)
- style: ... (Formatierungen, fehlende Semikolons, etc. – kein produktiver Code)
- refactor: ... (Code-Änderung, die weder einen Bug behebt noch ein Feature hinzufügt)

---

## 🚀 Deployment-Konzept (Private Server)

Das Deployment erfolgt nach dem Prinzip "GitOps-Light" direkt aus dem Terminal des Entwicklungs-Rechners über SSH. Der Server baut die Container eigenständig, um den Transfer von großen Docker-Images zu vermeiden.

### 1. Server-Voraussetzungen

- Installiertes Docker & Docker Compose V2.
- Git-Zugriff auf das GitHub-Repository (SSH-Key des Servers bei GitHub hinterlegt).
- Ports 80 (HTTP) und 443 (HTTPS) müssen zum Internet hin geöffnet sein, falls der integrierte Nginx genutzt wird.

### 2. Daten-Sicherheit & Persistenz

- **Datenbank:** Die MariaDB-Daten werden über ein Docker Named Volume (sc_db_data) auf dem Host-System persistiert. Container-Updates führen zu keinem Datenverlust.
- **Datenbank-Backups:** Da Docker-Volumes nur vor Container-Verlust, nicht aber vor Datenkorruption oder versehentlichem Löschen schützen, wird auf dem Server ein täglicher Backup-Cronjob eingerichtet. Dieser führt ein `mysqldump` der MariaDB aus und sichert die SQL-Dateien komprimiert in einem separaten Backup-Verzeichnis auf dem Host-System.
- **Environment Variables:** Auf dem Server existiert im Projektverzeichnis eine feste .env.prod Datei, die niemals ins Git gepusht wird. Sie enthält die Produktions-Passwörter und den Orga-API-Token.

### 3. Deployment-Workflow (Automatisiert via Makefile)

Der Befehl "make deploy" auf dem lokalen Rechner stößt folgende automatisierte Kette an:

```text
[Lokaler PC]                  [Privater Server]
  make deploy  ───────SSH──────►  git pull origin main
                                       │
                                  docker compose -f docker-compose.prod.yml up --build -d
                                       │
                                  Prisma DB-Migration (auto-run)
```

- Schritt 1 (Lokaler PC): Entwickler führt lokal "make deploy" aus.
- Schritt 2 (SSH-Trigger): Der Befehl verbindet sich per SSH mit dem Server und wechselt in das Projektverzeichnis.
- Schritt 3 (Git Pull): Der Server führt "git pull origin main" aus, um den neuesten Code zu laden.
- Schritt 4 (Docker Build): Docker Compose baut die Next.js App (Multi-Stage Standalone Build) und den optionalen Nginx-Proxy im Hintergrund neu. Sobald sie bereit sind, werden die alten Container ohne spürbare Downtime ersetzt.
- Schritt 5 (DB Migration): Nach dem Start der Container führt die Webapp automatisch "npx prisma migrate deploy" aus, um das Schema der Produktions-Datenbank atomar zu aktualisieren.
