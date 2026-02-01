#!/bin/sh
set -e  # Exit on error

# Logging configuration
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

error_exit() {
    log "ERROR: $*"
    exit 1
}

# Wait for PostgreSQL to be ready
log "Waiting for PostgreSQL at $DATABASE_URL..."
MAX_RETRIES=30
RETRY_COUNT=0

until pg_isready -h postgres -p 5432 -U atlas_user 2>/dev/null || [ $RETRY_COUNT -ge $MAX_RETRIES ]
do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    log "PostgreSQL not ready yet (attempt $RETRY_COUNT/$MAX_RETRIES), waiting..."
    sleep 2
done

if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    error_exit "Failed to connect to PostgreSQL after $MAX_RETRIES attempts"
fi

log "Database is ready! Generating Prisma client..."
if ! npx prisma generate; then
    error_exit "Failed to generate Prisma client"
fi

log "Running database migrations..."
if ! npx prisma migrate deploy; then
    error_exit "Failed to run database migrations"
fi

log "Starting application in production mode..."
if ! npm run start:prod; then
    error_exit "Failed to start application"
fi