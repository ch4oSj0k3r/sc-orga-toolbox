# Backup and Restore

## Backup erstellen

Ein Backup wird mit folgendem Befehl erstellt:

```bash
./scripts/backup-db.sh
```

Das Skript:

- erstellt einen komprimierten SQL-Dump,
- prüft die Integrität des Archivs,
- speichert das Backup im Verzeichnis `backups/`,
- löscht automatisch Backups, die älter als die konfigurierte Aufbewahrungsdauer sind.

---

# Restore

Ein Restore überschreibt den aktuellen Datenbankinhalt.

Vor dem Restore sollte sichergestellt werden, dass ein aktuelles Backup vorhanden ist.

Restore ausführen:

```bash
CONFIRM_RESTORE=YES \
./scripts/restore-db.sh backups/<backup-datei>.sql.gz
```

Der Restore-Prozess:

1. prüft die Backup-Datei,
2. stoppt die Webapp,
3. spielt den SQL-Dump ein,
4. prüft die Datenbank,
5. startet die Webapp erneut.

---

# Backup-Verzeichnis

Standardverzeichnis:

```text
backups/
```

Dieses Verzeichnis ist im Repository vorhanden, die erzeugten Backups werden jedoch nicht versioniert.

---

# Aufbewahrung

Standardmäßig werden Backups für 14 Tage aufbewahrt.

Die Aufbewahrungsdauer kann über die Umgebungsvariable `BACKUP_RETENTION_DAYS` angepasst werden.

---

# Geplanter Cronjob

Tägliches Backup um 02:00 Uhr:

```cron
0 2 * * * cd /home/toolbox-admin/sc-orga-toolbox && ./scripts/backup-db.sh >> /var/log/sc-orga-backup.log 2>&1
```

---

# Restore regelmäßig testen

Ein Backup ist nur dann zuverlässig, wenn ein Restore erfolgreich durchgeführt wurde.

Es wird empfohlen, den Restore-Prozess regelmäßig gegen eine Testumgebung zu validieren, um die Wiederherstellbarkeit sicherzustellen.
