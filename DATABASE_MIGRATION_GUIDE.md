# Database Migration Strategy: Fresh Start (PostgreSQL)

## Current State Analysis
- **Schema**: Configured for PostgreSQL (`backend/prisma/schema.prisma`)
- **Migrations**: None exist (fresh state)
- **Docker**: PostgreSQL 15 container configured in `docker-compose.yml`
- **Database**: `atlas_db` with user `atlas_user`

## Migration Plan

### Step 1: Update Environment Configuration

Update `backend/.env` with correct database URL:

```env
DATABASE_URL="postgresql://atlas_user:atlas_password@localhost:5432/atlas_db"
```

For Docker environment (already configured in docker-compose.yml):
```env
DATABASE_URL="postgresql://atlas_user:atlas_password@postgres:5432/atlas_db"
```

### Step 2: Start PostgreSQL Container

```bash
# Start only the database
docker compose up postgres -d

# Wait for it to be healthy (check with)
docker compose ps
```

### Step 3: Create Baseline Migration

Navigate to backend directory and create initial migration:

```bash
cd backend

# Create initial migration from schema
npx prisma migrate dev --name init

# This will:
# 1. Create SQL migration file in prisma/migrations/YYYYMMDD_init/
# 2. Apply migration to database
# 3. Update migration_lock.toml
```

### Step 4: Generate Prisma Client

```bash
# Generate TypeScript client
npx prisma generate
```

### Step 5: Verify Database Setup

```bash
# Check database tables
npx prisma db pull --print

# Or use Prisma Studio to view data
npx prisma studio
```

## Post-Migration Steps

### Option A: Using Docker (Recommended for Development)

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f atlas-backend
```

### Option B: Local Development

```bash
# Terminal 1: Start PostgreSQL
docker compose up postgres -d

# Terminal 2: Run backend locally
cd backend
npm run start:dev

# Terminal 3: Run frontend locally
npm run dev
```

## Database Schema Overview

Your schema includes these models:
- **User** - Authentication & user management
- **RefreshToken** - Secure token storage
- **Venture** - Business/project entities
- **VentureMember** - Team collaboration
- **Analysis** - AI-generated content storage
- **Integration** - External service connections
- **Subscription** - Stripe billing data
- **Job** - Background processing queue
- **AuditLog** - Compliance tracking

## Troubleshooting

### Issue: Migration already exists error
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

### Issue: Connection refused
```bash
# Check if PostgreSQL is running
docker compose ps postgres

# Check logs
docker compose logs postgres
```

### Issue: Permission denied
```bash
# Ensure database URL is correct in backend/.env
cat backend/.env | grep DATABASE_URL
```

## Commands Summary

```bash
# Quick setup (run these in order):
cd "C:\Users\zboud\ATLAS AI Incubator"

# 1. Start database
docker compose up postgres -d

# 2. Create migration
cd backend
npx prisma migrate dev --name init

# 3. Generate client
npx prisma generate

# 4. Start all services
cd ..
docker compose up -d
```

## Next Steps After Migration

1. **Seed Data** (optional): Create seed file for default admin user
2. **Backup Strategy**: Set up automated PostgreSQL backups
3. **Monitoring**: Configure database monitoring (pgAdmin, Datadog, etc.)
4. **Migrations Workflow**: Document process for future schema changes

## Notes

- PostgreSQL data persists in Docker volume `postgres_data`
- Migrations are tracked in `prisma/migrations/`
- Never delete migration files after they've been applied to production
- Always test migrations in development before applying to production
