# MobiGlas Theme Integration – Task Plan

## 1. Kontext & Ziel

Die App bekommt ein durchgängiges MobiGlas-Terminal-Design (Sci-Fi-Terminal-Ästhetik, wie sie aus dem
Star-Citizen-Universum bekannt ist): dunkler Hintergrund, Cyan-Glow, monospaced Typo, geclippte
Panel-Ecken, Scanline-Sweep, Statuszeilen im Terminal-Stil.

**Scope:** Kompletter Umbau aller bestehenden Auth-Seiten (Login, Register, Waiting, Admin) auf das neue
Theme, inkl. wiederverwendbarer Komponenten-Bibliothek, Motion und Sound. Bestehende Funktionslogik
(Session-Guards, Suspense-Boundaries, Rate-Limiting, Server Actions) bleibt unverändert – dieser Task ist
reine Präsentationsschicht, keine Feature-Änderung.

**Bereits vorhanden:**

- `tailwind_config.ts` – Farbtokens, Fonts, Shadows, Clip-Paths, Keyframes
- `globals.css` – Komponenten-Klassen (`.terminal-panel`, `.btn-terminal`, `.status-line`, etc.)
- `login-terminal.html` – statisches Referenz-Mockup (⚠️ enthält Discord-Login als Platzhalter, **nicht real**
  – im echten Login gibt es nur `sc_handle` + Passwort, kein OAuth)

---

## 2. Offene technische Fragen – **vor Punkt M0 klären**

Diese Punkte entscheiden, ob die vorhandenen Dateien 1:1 übernommen werden können oder angepasst werden
müssen. Bitte vor Implementierungsstart verifizieren:

- [x] **Tailwind-Version geprüft:** v4 bestätigt (`"tailwindcss": "^4"`, `@tailwindcss/postcss` vorhanden).
      `globals.css`/`tailwind.config.ts` müssen auf v4-CSS-first-Syntax übersetzt werden (`@theme`-Block
      statt JS-Config, `tailwind.config.ts` entfällt komplett).
- [x] **Plugin-Entscheidung getroffen:** `tailwindcss-clip-path` und `@tailwindcss/forms` werden **nicht**
      installiert. Clip-Path läuft über native Arbitrary Properties (`[clip-path:polygon(...)]`), Forms-Reset
      ist aktuell nicht nötig (keine nativen Checkbox/Radio/Select-Elemente im Scope) – spart zwei
      Dependencies, deren v4-Kompatibilität sonst erst hätte geprüft werden müssen.
- [x] **Font-Loading-Strategie:** Aktuell `@import url(...)` von Google Fonts direkt in `globals.css`.
      Empfehlung: auf `next/font/google` umstellen (Chakra Petch, JetBrains Mono, Inter) – self-hosted,
      kein externer Netzwerk-Request zur Laufzeit, kein Layout-Shift, funktioniert auch offline in Dev.
- [x] **`body { overflow-hidden }` in `globals.css` prüfen:** Macht für eine einzelne Login-Card Sinn
      (kein Scroll gewünscht), ist aber ein Problem für Seiten mit variabler Höhe (z. B. Admin-Dashboard mit
      langer User-Liste). Muss auf Layout-Ebene differenziert werden (z. B. nur auf Auth-Seiten anwenden,
      nicht global).
- [x] **Default-Tab im Admin-Dashboard:** `VERIFIED` – Handlungsbedarf zuerst, `ACTIVE` ist der
      Normalzustand ohne Aktionsbedarf und muss nicht die erste Sicht sein.
- [x] **Mobile-Strategie für Admin-Tabelle:** Card-Layout pro User (nicht horizontales Scrollen) –
      höherer Aufwand, aber besseres Handling auf kleinen Viewports.

---

## 3. Design-Tokens (Ist-Stand aus `tailwind.config.ts`)

| Token               | Wert                  | Verwendung                 |
| ------------------- | --------------------- | -------------------------- |
| `bg`                | `#070a10`             | Seitenhintergrund          |
| `panel`             | `#0c1119`             | Terminal-Panel-Fläche      |
| `panel-alt`         | `#111a26`             | Inputs, sekundäre Flächen  |
| `line`              | `#1c2a36`             | Borders, Divider           |
| `cyan` / `cyan-dim` | `#4fe0d4` / `#1f5f5a` | Primärakzent, Fokus, Glow  |
| `amber`             | `#ffb454`             | Warnung / Pending-Zustände |
| `danger`            | `#ff6a5c`             | Fehler, kritische Aktionen |
| `text` / `text-dim` | `#d7e4ea` / `#6f8792` | Primär-/Sekundärtext       |

**Domain-Mapping (Status → Farbe), damit UI und Datenmodell konsistent kommunizieren:**

| `UserStatus` (Prisma) | Farbe                              | Begründung                                                    |
| --------------------- | ---------------------------------- | ------------------------------------------------------------- |
| `PENDING`             | `cyan` (aktiv/wartend)             | Cron läuft, Prozess in Bearbeitung                            |
| `VERIFIED`            | `amber`                            | Wartet auf menschliche Aktion (Admin)                         |
| `ACTIVE`              | `cyan` / grün-nah über `cyan`      | Normalzustand, kein zusätzliches Signal nötig                 |
| `REJECTED`            | `danger`                           | Fehlgeschlagen                                                |
| `BANNED`              | `danger` (dunkler/gesättigter Ton) | Terminalzustand, muss sich von REJECTED optisch unterscheiden |

⚠️ Aktuell hat `BANNED` keinen eigenen Farbton – nur `danger` für beide. Empfehlung: einen zusätzlichen
Token `danger-deep` oder ähnliches ergänzen, damit REJECTED (behebbar) und BANNED (permanent) auf einen
Blick unterscheidbar sind, nicht erst über den Text.

Typografie: `Chakra Petch` (Display/Headlines), `JetBrains Mono` (UI-Text, Labels, Daten – trägt den
Terminal-Charakter), `Inter` (Fallback/Fließtext, falls längere Erklärtexte nötig werden).

---

## 4. Komponenten-Architektur

Die MobiGlas-Bausteine werden **seitenübergreifend** genutzt (Login, Register, Waiting, Admin) – gehören
damit nach Konvention in `components/`, nicht in `_components/` einer einzelnen Route.

```
components/
  mobiglas/
    TerminalPanel.tsx        # Grundgerüst mit Clip-Path + HUD-Corners
    HudCorners.tsx           # <span> Paar, top-left / bottom-right
    Starfield.tsx            # fixed Hintergrund-Layer
    ScanlineSweep.tsx        # fixed Animations-Layer
    StatusLine.tsx           # Terminal-Statuszeile mit Blink-Cursor, Varianten: neutral/active/granted/denied
    TerminalButton.tsx       # primary/secondary Variante über Props, kein Duplikat für jeden Use-Case
    TerminalInput.tsx        # Input mit Label, ersetzt native <input> im Login/Register-Form
    Divider.tsx              # "OR"-Trenner
    Footnote.tsx
  Header.tsx                 # Server Component, App-Shell für (app)-Bereich, kein mobiglas/-Namespace
  UserMenu.tsx                # 'use client', Logout-Trigger, Teil des Headers
  Footer.tsx
```

`Header`/`UserMenu`/`Footer` bewusst **nicht** unter `mobiglas/`, da sie kein wiederverwendbares
Design-Primitiv sind, sondern ein einmaliges Layout-Bauteil der App-Shell (siehe M0.5).

**Bewusst kein God-Component** (z. B. ein `<Terminal>`, das alles kann) – jede Komponente hat eine
Verantwortung, wird über Props/Children komponiert. Deckt sich mit dem SOLID-Ansatz, den ihr im
Auth-Feature schon verfolgt habt.

**Admin-Dashboard braucht eigenes Layout-Konzept, keine 1:1-Wiederverwendung der Login-Card:**
Die Referenz-HTML ist für eine schmale, zentrierte Karte gebaut (max-width 420px). Das Admin-Dashboard
zeigt tabellarische Daten über mehrere hundert Pixel Breite – hier reicht "Terminal-Panel schmaler machen"
nicht. Braucht einen zweiten visuellen Baustein, z. B. `ConsolePanel` (volle Breite, gleiche
Materialsprache: Clip-Corners, Cyan-Border, monospaced Tabellen-Header) statt den Login-Look zu strecken.

---

## 5. Meilensteine

### M0 – Foundation Verification ✅ abgeschlossen

- [x] Offene technische Fragen aus Punkt 2 klären
- [x] `next/font`-Umstellung für die drei Fonts
- [x] Tailwind-Config ggf. auf tatsächliche installierte Version anpassen (`tailwind.config.ts` existierte
      nie separat, `globals.css` direkt auf v4-Syntax übernommen)
- [x] `overflow-hidden`-Scope korrigiert (aus `body` entfernt, wird gezielt in M0.5 pro Layout gesetzt)

### M0.5 – App-Shell (Route Groups + Header/Nav/Footer + Logout) ✅ abgeschlossen

Grundvoraussetzung, bevor irgendein Theme-Baustein in `/admin` oder `/dashboard` sichtbar wird – aktuell
gibt es keinen gemeinsamen Rahmen für den authentifizierten Bereich.

**Struktur:**

```
app/
  layout.tsx                 # Root: <html>/<body>, Fonts, Toaster, SessionProvider (unverändert)
  (app)/
    layout.tsx                # NEU: Header/Nav/Footer, ruft requireActiveSession() zentral
    admin/                    # bisheriger Inhalt unverändert, Pfad bleibt /admin
    dashboard/                 # sobald gebaut, braucht keinen eigenen Session-Check mehr
  (auth)/
    login/                     # bisheriger Inhalt unverändert, Pfad bleibt /login
    register/
    waiting/
```

Route-Group-Klammern `(app)`/`(auth)` tauchen nicht in der URL auf – reine Ordnerorganisation, kein
Breaking Change für bestehende Links/Redirects.

- [v] Bestehende Ordner `admin/`, `dashboard/` (falls schon angelegt) nach `app/(app)/` verschieben
- [x] Bestehende Ordner `login/`, `register/`, `waiting/` nach `app/(auth)/` verschieben
- [x] `app/(app)/layout.tsx` anlegen: ruft `requireActiveSession()` zentral auf, rendert `Header`/`Footer`
      um `{children}`
- [x] `/admin/page.tsx` behält seinen eigenen `requireAdminSession()`-Aufruf (strengere Anforderung als
      nur "eingeloggt" – bewusste Redundanz, gleiches Defense-in-Depth-Prinzip wie beim Cron-Secret)
- [x] `components/Header.tsx` (Server Component) – bekommt `user` als Prop vom Layout, kein eigener
      Session-Fetch nötig; rendert Admin-Link nur bei `user.role === 'ADMIN'` (reiner Server-Conditional,
      kein Client-JS)
- [x] `components/UserMenu.tsx` (`'use client'`) – einziger Client-Teil im Header, ruft `signOut()` auf
      Logout-Klick, nach demselben "so viel Server, so wenig Client wie nötig"-Prinzip wie beim
      Waiting-Page-Split
- [x] `components/Footer.tsx` – Org-Name/Version, Platzhalter für später (Impressum o. ä.)
- [x] `app/(auth)/layout.tsx` – gemeinsamer Wrapper für Login/Register/Waiting: zentrierte Karte,
      `overflow-hidden` hier (nicht mehr in `body`), Starfield/Scanline direkt über die M0-Utility-Klassen
      eingebunden (`bg-starfield`, `bg-scanline-sweep`) – wird in M1 durch dedizierte
      `Starfield.tsx`/`ScanlineSweep.tsx`-Komponenten ersetzt, ohne das Layout selbst anzufassen
- [x] Äußere Wrapper-Divs aus `LoginForm.tsx`, `WaitingPageClient.tsx`, Register-Form entfernen (Zentrierung
      übernimmt jetzt `(auth)/layout.tsx`, sonst doppeltes Rendering)

### M1 – Design Primitives

- [x] `components/mobiglas/*` bauen (siehe Liste oben)
- [x] Jede Komponente isoliert testen (z. B. eigene `/dev/mobiglas`-Testseite oder Storybook-artiges
      Sammel-Page, das nach Abschluss wieder entfernt wird)
- [x] `danger-deep`-Token für BANNED vs. REJECTED ergänzen (siehe Punkt 3)
- [x] `TerminalInput`: Autofill-Override einbauen (`box-shadow: 0 0 0px 1000px var(--panel-alt) inset`-Trick
      für `:-webkit-autofill`), sonst brechen Browser-Passwort-Vorschläge das Theme mit weißem Hintergrund

### M2 – Login & Register Reskin

- [x] `LoginForm.tsx` auf `TerminalPanel`/`TerminalInput`/`TerminalButton` umstellen
- [x] Copy anpassen: kein Discord-Button, Feld-Label `RSI Handle` statt `E-Mail`
- [x] Bestehendes Error-Mapping (`getAuthErrorMessage`) unverändert weiternutzen, nur visuell neu verpackt
- [x] Gleiches für Register-Form
- [x] `LoginFormFallback`/Suspense-Fallback (aus dem `useSearchParams`-Fix) im Terminal-Stil statt
      unstyled Plain-Text – sonst kurzer Stil-Blitzer bei jedem Seitenaufruf
- [x] Browser-Autofill-Override für alle `TerminalInput`-Felder (`:-webkit-autofill`-Trick, siehe M1) –
      Passwort-Manager-Vorschläge rendern sonst mit weißem Hintergrund unabhängig vom Theme

### M3 – Waiting Page Reskin

- [x] `StatusLine`-Komponente für die PENDING/VERIFIED-Zustände nutzen (passt konzeptionell besonders gut,
      da die Seite ohnehin einen "wartet auf Prozess"-Charakter hat)
- [x] Verifizierungs-Token-Anzeige im Terminal-Stil (monospaced, hervorgehoben, "select-all" wie im Original
      beibehalten)

### M4 – Admin Console Redesign ✅ abgeschlossen

Nicht nur Reskin – die aktuelle Struktur (alle 5 Status-Tabellen untereinander) wird durch ein
Tab-basiertes Layout ersetzt. Bewusst **ohne** Client-State-Bibliothek gelöst: Die Daten sind ohnehin
komplett server-seitig geladen (`getAdminDashboardData()`), Tab-Wechsel läuft rein über
URL-Query-Param + `<Link>` – kein zusätzlicher Fetch nötig, deep-linkbar/teilbar (`/admin?tab=rejected`),
übersteht Reload ohne eigenen State-Management-Aufwand.

- [x] `ConsolePanel`-Baustein entwerfen (volle Breite, gleiche Materialsprache wie `TerminalPanel`:
      Clip-Corners, Cyan-Border, aber für tabellarische Daten statt zentrierter Karte)
- [x] `AdminPage` liest `searchParams.tab` (Server Component, Next.js 16 `searchParams` als Promise),
      Default-Tab: **`VERIFIED`** (Entscheidung final, siehe Punkt 2) – Handlungsbedarf zuerst, `ACTIVE`
      als Normalzustand ohne Aktionsbedarf muss nicht die erste Sicht sein
- [x] `TabBar`-Komponente: Segmented-Control im MobiGlas-Stil, Cyan-Unterstrich/Glow auf aktivem Tab,
      Count-Badge pro Status (z. B. `PENDING (3)`) – reine `<Link>`-Elemente, kein `onClick`/State nötig
- [x] `CronTrigger` wird sticky Action-Bar oberhalb der Tabs, unabhängig vom aktiven Tab immer sichtbar
- [x] `UserTable` visuell auf Konsolen-Look umstellen, Status-Farben aus Domain-Mapping (Punkt 3) übernehmen
- [x] `ConfirmationModal` an das Theme anpassen
- [ ] **Mobile-Ansicht: Card-Layout pro User** (Entscheidung final, siehe Punkt 2) statt Tabelle mit
      horizontalem Scroll – jede Karte zeigt dieselben Felder wie die Desktop-Tabellenzeile
      (`sc_handle`, Rolle, Datum, ggf. Status-spezifische Zusatzinfo), Aktions-Buttons darunter statt
      rechtsbündig in einer Spalte
- [x] Leere Zustände ("Keine Benutzer mit diesem Status vorhanden") pro Tab beibehalten, optisch ans
      Console-Theme angepasst

### M5 – Motion & Sound Layer

**Motion (jetzt umgesetzt):**

- [x] Scanline-Sweep, Pulse-Dot, Blink-Cursor – bereits über M0 (Keyframes in `globals.css`) und M1
      (`ScanlineSweep`-Komponente, `eyebrow-dot`, `.status-line::after`) abgedeckt,
      `prefers-reduced-motion`-Fallback aus dem Original beibehalten
- [x] Sonner-`Toaster` an die Farbpalette angepasst (`unstyled: true` + eigene `classNames` statt
      generischem `richColors`-Preset – konsistent mit Clip-Path/Border-Look des restlichen Systems).
      Position auf `top-right` geändert (abweichend vom ursprünglichen Vorschlag `bottom-right`).

**Sound (bewusst zurückgestellt, siehe Entscheidung unten):**

- [ ] Sound-Konzept: kurze, diskrete Feedback-Sounds für einzelne Aktionen (Klick, Erfolg, Fehler,
      Admin-Aktion bestätigt). Bewusst kein geloopter Ambient-Hintergrundsound
- [ ] Autoplay-Policy beachten: Sound darf nie ungefragt beim Seitenaufruf starten, nur als Reaktion auf
      echte Klicks/Aktionen
- [ ] Mute-Toggle einplanen, Präferenz in `localStorage` speichern

_Entscheidung: Animations-Teil wurde vorgezogen und ist abgeschlossen. Sound-Feature wird bewusst als
eigener, späterer Task behandelt (siehe Risiken-Tabelle: "Sound-Feature bläht Scope auf") – kein
technischer Blocker, reine Priorisierung._

### M6 – Accessibility & Cross-Cutting Pass ✅ abgeschlossen

- [x] Tastatur-Fokus-Zustände für alle neuen interaktiven Elemente geprüft und nachgezogen: `.focus-terminal`
      Utility für Links (`NavLink`, Header-Brand-Link, `AdminTabBar`, `.link-terminal`), `inset box-shadow`
      statt `outline` für die drei `TerminalButton`-Varianten (Clip-Path schneidet `outline` sonst ab –
      betrifft auch die ungeclippte Secondary-Variante, bewusst vereinheitlicht statt zwei Fokus-Mechaniken
      zu mischen)
- [x] Kontrastwerte geprüft (WCAG AA): `cyan-dim` als **Text**farbe (Footnote-Tag, Footnote-Links) fiel mit
      ~2.6:1 durch – auf `cyan` als Ruhezustand umgestellt (`cyan-dim` bleibt für Borders/Hover reserviert,
      dort gelten die Kontrastregeln nicht). Alle anderen Text/Hintergrund-Kombinationen bestehen AA.
- [x] `app/error.tsx` und `app/not-found.tsx` im MobiGlas-Stil angelegt (siehe oben)
- [x] `app/layout.tsx`-Boilerplate ersetzt (`title`/`description`)
- [x] `ConfirmationModal`: `Escape`-Taste schließt den Dialog (deaktiviert während `isLoading`, analog zum
      Backdrop-Klick)
- [x] `npm run build` nach jeder Änderung grün

---

## 6. Bekannte Risiken

| Risiko                                                              | Auswirkung                                                                      | Gegenmaßnahme                                                                                                          |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Tailwind-Versions-Mismatch (v3-Config auf v4-Projekt)               | Klassen greifen nicht, Theme sieht komplett falsch aus                          | M0 zuerst, vor jeglicher Component-Arbeit                                                                              |
| `overflow-hidden` global                                            | Admin-Dashboard mit vielen Usern nicht scrollbar                                | Scope auf Auth-Layout begrenzen, nicht `body` global                                                                   |
| Sound-Feature bläht Scope auf                                       | Kompletter Umbau dauert deutlich länger als reines Reskin                       | M5 als klar abgegrenzten, notfalls verschiebbaren Schritt behandeln                                                    |
| Login-Card-Pattern auf Admin-Tabelle gepresst                       | Schlecht lesbare, zu schmale Datentabellen                                      | Eigenes `ConsolePanel`-Konzept (M4), keine Wiederverwendung erzwingen                                                  |
| Route-Group-Umzug bricht bestehende relative Importe                | `_components`-Pfade, Redirect-Ziele o. ä. zeigen nach dem Verschieben ins Leere | Nach M0.5 zwingend `npm run build` + manuelles Durchklicken aller bestehenden Routen (Login, Register, Waiting, Admin) |
| Admin-Redesign (Tabs) vergrößert M4 spürbar gegenüber reinem Reskin | Zeitaufwand für M4 unterschätzt, wenn nur "Farben austauschen" erwartet wurde   | Bewusst als Redesign, nicht als Reskin kommuniziert (siehe M4-Titel) – Erwartung ist damit gesetzt                     |

---

## 7. Nicht im Scope

- Discord-OAuth (nur Platzhalter in der Referenz, kein echtes Feature)
- Helle/alternative Themes – MobiGlas ist bewusst dark-only
- Änderungen an Auth-Logik, Session-Handling, Rate-Limiting oder Server Actions – reine Präsentationsschicht

---

## 8. M0-Ergebnis: `globals.css` v4-Übersetzung (Referenz)

```css
@import 'tailwindcss';

@theme {
    --color-bg: #070a10;
    --color-panel: #0c1119;
    --color-panel-alt: #111a26;
    --color-line: #1c2a36;
    --color-cyan: #4fe0d4;
    --color-cyan-dim: #1f5f5a;
    --color-amber: #ffb454;
    --color-danger: #ff6a5c;
    --color-text: #d7e4ea;
    --color-text-dim: #6f8792;

    --font-display: 'Chakra Petch', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --font-sans: 'Inter', sans-serif;

    --shadow-glow: 0 0 18px rgba(79, 224, 212, 0.35);
    --shadow-panel: 0 0 0 1px rgba(79, 224, 212, 0.05), 0 20px 60px rgba(0, 0, 0, 0.6);

    --animate-sweep: sweep 7s linear infinite;
    --animate-pulse-glow: pulse-glow 1.8s ease-in-out infinite;
    --animate-blink: blink 1s step-end infinite;
}

@keyframes sweep {
    0% {
        transform: translateY(-140px);
    }
    100% {
        transform: translateY(100vh);
    }
}
@keyframes pulse-glow {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.3;
    }
}
@keyframes blink {
    50% {
        opacity: 0;
    }
}

@layer base {
    body {
        @apply bg-bg text-text font-sans;
        background-image: radial-gradient(ellipse at 50% 20%, #0d1622 0%, #070a10 65%);
    }
}

/* @layer components { ... } bleibt strukturell wie im Original (.terminal-panel, .btn-terminal,
   .status-line, etc.) – einzige Änderung: clip-path läuft über Arbitrary Properties statt Plugin:

   .terminal-panel {
     @apply relative w-full max-w-[420px] bg-panel border border-line
            px-[30px] pt-7 pb-[26px] shadow-panel
            [clip-path:polygon(18px_0,100%_0,100%_calc(100%-18px),calc(100%-18px)_100%,0_100%,0_18px)];
   }
   .btn-terminal {
     @apply ... [clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)];
   }
*/
```

**`tailwind.config.ts` wird komplett gelöscht** – v4 braucht dafür keine JS-Config mehr, Content-Globbing
läuft automatisch, Plugins entfallen durch die Arbitrary-Properties-Lösung. Google-Fonts-`@import` bleibt
hier nur als M0-Übergang drin, wird in M0/M1 final durch `next/font` ersetzt (siehe M0-Checkliste).
