#!/bin/sh
# Daily backup script for Smart NDC Pro ERP
# Backs up PostgreSQL database and MinIO objects to a backup volume
set -e

BACKUP_DIR="${BACKUP_DIR:-/backups}"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup..."

# --- PostgreSQL backup ---
if [ -z "$DATABASE_URL" ]; then
  echo "WARNING: DATABASE_URL not set, skipping DB backup"
else
  PG_FILE="$BACKUP_DIR/db_${DATE}.sql.gz"
  echo "Backing up PostgreSQL to $PG_FILE"
  pg_dump "$DATABASE_URL" | gzip > "$PG_FILE"
  echo "DB backup done: $PG_FILE"
fi

# --- MinIO backup ---
if [ -n "$MINIO_ENDPOINT" ] && [ -n "$MINIO_ACCESS_KEY" ]; then
  MINIO_FILE="$BACKUP_DIR/minio_${DATE}.tar.gz"
  echo "Backing up MinIO bucket '$MINIO_BUCKET' to $MINIO_FILE"
  mc alias set src "$MINIO_ENDPOINT" "$MINIO_ACCESS_KEY" "$MINIO_SECRET_KEY" --api S3v4
  mc mirror --overwrite src/"$MINIO_BUCKET" "$BACKUP_DIR/minio_tmp_$DATE"
  tar -czf "$MINIO_FILE" -C "$BACKUP_DIR" "minio_tmp_$DATE"
  rm -rf "$BACKUP_DIR/minio_tmp_$DATE"
  echo "MinIO backup done: $MINIO_FILE"
fi

# --- Retention: remove backups older than RETENTION_DAYS ---
echo "Cleaning backups older than ${RETENTION_DAYS} days"
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
find "$BACKUP_DIR" -name "minio_*.tar.gz" -mtime +${RETENTION_DAYS} -delete

echo "[$(date)] Backup complete."