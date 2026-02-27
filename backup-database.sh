#!/bin/bash

# Database Backup Script for ATLAS AI Incubator
# Backs up PostgreSQL and Redis data

set -e

BACKUP_DIR="$(dirname "$0")/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "========================================"
echo "ATLAS AI Database Backup"
echo "========================================"
echo ""

# Create backup directory
echo "[1/4] Creating backup directory..."
mkdir -p "$BACKUP_DIR"
echo "[OK] Backup directory ready"
echo ""

# Check if containers are running
echo "[2/4] Checking containers..."
if ! docker ps | grep -q "postgres"; then
    echo "[ERROR] PostgreSQL container not running!"
    echo "Please start the app first: docker compose up -d"
    exit 1
fi

if ! docker ps | grep -q "redis"; then
    echo "[WARNING] Redis container not running, skipping Redis backup"
    SKIP_REDIS=1
else
    echo "[OK] Containers are running"
fi
echo ""

# Backup PostgreSQL
echo "[3/4] Backing up PostgreSQL database..."
echo "  - Exporting database to SQL file..."

BACKUP_FILE="$BACKUP_DIR/atlas_db_backup_$TIMESTAMP.sql"

docker exec atlasaiincubator-postgres-1 pg_dump -U atlas_user -d atlas_db --no-owner --no-acl > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "[OK] PostgreSQL backup created"
    echo "  File: $BACKUP_FILE"
    echo "  Size: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo "[ERROR] PostgreSQL backup failed!"
    exit 1
fi
echo ""

# Backup Redis (if running)
if [ -z "$SKIP_REDIS" ]; then
    echo "[4/4] Backing up Redis data..."
    
    # Trigger Redis BGSAVE
    docker exec atlasaiincubator-postgres-1 redis-cli BGSAVE 2>/dev/null || true
    
    # Wait for save to complete
    sleep 2
    
    # Copy dump.rdb from container
    REDIS_BACKUP="$BACKUP_DIR/redis_backup_$TIMESTAMP.rdb"
    docker cp atlasaiincubator-redis-1:/data/dump.rdb "$REDIS_BACKUP" 2>/dev/null || true
    
    if [ -f "$REDIS_BACKUP" ]; then
        echo "[OK] Redis backup created"
        echo "  File: $REDIS_BACKUP"
        echo "  Size: $(du -h "$REDIS_BACKUP" | cut -f1)"
    else
        echo "[WARNING] Redis backup failed or no data to backup"
    fi
else
    echo "[4/4] Skipping Redis backup (container not running)"
fi

echo ""
echo "========================================"
echo "[SUCCESS] Backup Complete!"
echo "========================================"
echo ""
echo "Backup files created:"
echo "  PostgreSQL: $BACKUP_FILE"
if [ -f "$REDIS_BACKUP" ]; then
    echo "  Redis: $REDIS_BACKUP"
fi
echo ""
echo "Backup location: $BACKUP_DIR"
echo ""
echo "To restore from backup:"
echo "  docker exec -i atlasaiincubator-postgres-1 psql -U atlas_user -d atlas_db < backup_file.sql"
echo ""
