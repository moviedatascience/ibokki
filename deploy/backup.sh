#!/usr/bin/env bash
# Nightly SQLite backup — add to cron:  0 4 * * * /opt/ibokki/deploy/backup.sh
# Uses sqlite3's online .backup (safe while the server runs; WAL mode).
set -euo pipefail
DB="${IBOKKI_DB:-/opt/ibokki/data/ibokki.db}"
OUT_DIR="${IBOKKI_BACKUP_DIR:-/opt/ibokki/backups}"
mkdir -p "$OUT_DIR"
sqlite3 "$DB" ".backup '$OUT_DIR/ibokki-$(date +%F).db'"
# Keep two weeks.
find "$OUT_DIR" -name 'ibokki-*.db' -mtime +14 -delete
