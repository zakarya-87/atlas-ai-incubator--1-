#!/bin/sh

# Startup script for ATLAS AI Incubator Backend
# This script handles database migration and application startup

echo "========================================"
echo "ATLAS AI Incubator Backend Startup"
echo "========================================"
echo ""

# Wait for PostgreSQL to be ready
echo "Step 1/3: Waiting for PostgreSQL..."
max_attempts=30
attempt=0
while ! pg_isready -h localhost -U atlas_user -d atlas_db > /dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
        echo "ERROR: PostgreSQL did not become ready after $max_attempts attempts"
        exit 1
    fi
    echo "  Attempt $attempt/$max_attempts: PostgreSQL not ready yet, waiting..."
    sleep 2
done
echo "✓ PostgreSQL is ready!"
echo ""

# Generate Prisma Client
echo "Step 2/3: Generating Prisma Client..."
if npx prisma generate; then
    echo "✓ Prisma Client generated successfully"
else
    echo "ERROR: Failed to generate Prisma Client"
    exit 1
fi
echo ""

# Run database migrations
echo "Step 3/3: Running database migrations..."
if npx prisma migrate deploy; then
    echo "✓ Database migrations completed"
else
    echo "ERROR: Database migration failed"
    exit 1
fi
echo ""

echo "========================================"
echo "Startup complete! Starting application..."
echo "========================================"
echo ""

# Start the application
exec node dist/main.js
