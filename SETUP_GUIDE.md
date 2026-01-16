# ATLAS AI Incubator - Environment & Setup Guide

## Current Environment Status ✅

### ✅ What's Ready
- **Frontend**: Vite + React configured, all dependencies installed
- **Backend**: NestJS configured, all dependencies installed  
- **Database**: Prisma ORM with SQLite schema in place
- **Authentication**: JWT configured
- **API Docs**: Swagger documentation configured
- **Docker**: PostgreSQL/Redis ready (optional)
- **Tests**: Unit tests (15 passing), Backend E2E tests (3 passing)
- **Build**: Production build successful (dist/)

### ⚠️ Action Items
1. **Frontend GEMINI_API_KEY**: Update `.env.local` with real API key from https://aistudio.google.com/app/apikey
2. **Database**: SQLite will auto-create `dev.db` on first run
3. **Optional**: PostgreSQL via `docker-compose up -d` (currently configured for SQLite)

---

## Quick Start (Development Mode)

### Prerequisites
- Node.js 18+
- Docker (optional, for PostgreSQL/Redis)
- npm or pnpm

### Option 1: Quick Start (SQLite Only)

```powershell
# Terminal 1: Start Backend
cd backend
npm run start:dev
# Backend runs on http://localhost:3000
# API docs at http://localhost:3000/api/docs

# Terminal 2: Start Frontend
cd ..
npm run dev
# Frontend runs on http://localhost:5173
```

Then open http://localhost:5173 in your browser.

### Option 2: Full Stack (With PostgreSQL)

```powershell
# 1. Start Docker services
docker-compose up -d

# 2. Verify containers are running
docker ps
# Should show: postgres and redis containers

# 3. Initialize database
cd backend
npx prisma db push
cd ..

# 4. Update DATABASE_URL in backend/.env if using PostgreSQL
# Change from: DATABASE_URL="file:./dev.db"
# To: DATABASE_URL="postgresql://atlas_user:atlas_password@localhost:5432/atlas_db"

# 5. Terminal 1: Start Backend
cd backend
npm run start:dev

# 6. Terminal 2: Start Frontend
cd ..
npm run dev
```

---

## Environment Variables

### Frontend (.env.local)
```dotenv
GEMINI_API_KEY=your_actual_api_key_from_aistudio
```

Get your key from: https://aistudio.google.com/app/apikey

### Backend (backend/.env)
```dotenv
# Database
DATABASE_URL="file:./dev.db"                    # SQLite (local)
# Or use PostgreSQL:
# DATABASE_URL="postgresql://atlas_user:atlas_password@localhost:5432/atlas_db"

# APIs
API_KEY="AIzaSyD999-9wiUgARsOagLiS_5sl6DvyaktPL8"  # Gemini API

# Auth
JWT_SECRET="a_very_secure_production_secret_key_that_is_long_and_random"

# Server
PORT=3000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Optional: Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Optional: Redis (for BullMQ job queue)
REDIS_HOST="localhost"
REDIS_PORT=6379
```

---

## Available Commands

### Frontend
```powershell
npm run dev           # Start dev server (http://localhost:5173)
npm run build         # Build for production
npm run test:unit     # Run unit tests (Vitest)
npm run test:e2e      # Run E2E tests (Playwright)
npm run lint          # Lint code
```

### Backend
```powershell
cd backend

npm run start:dev     # Start dev server with hot reload (http://localhost:3000)
npm run build         # Build for production
npm run test:e2e      # Run integration tests (Jest)
npm run seed          # Seed database with sample data

# Prisma
npx prisma db push   # Push schema to database
npx prisma studio   # Open Prisma Studio for DB inspection
npx prisma generate # Generate Prisma client
```

---

## Test Status

### Unit Tests ✅
- **Frontend**: 15 tests passing
- **Backend**: Integration tests passing
- Run: `npm run test:unit`

### E2E Tests
- **Backend**: 3 API tests passing
- **Frontend**: Playwright tests available (requires running servers)
- Run: `npm run test:e2e`

---

## API Documentation

Once backend is running:
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health
- **Analysis**: POST http://localhost:3000/analysis/generate

---

## Troubleshooting

### Port Already in Use
```powershell
# Kill process on port 5173 (frontend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process

# Kill process on port 3000 (backend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### Database Issues
```powershell
# Reset SQLite database
cd backend
del dev.db dev.db-journal
npx prisma db push
```

### PostgreSQL Connection Issues
```powershell
# Check if containers are running
docker ps

# Start/restart containers
docker-compose restart postgres

# View logs
docker-compose logs postgres
```

### GEMINI API Errors
- Verify API key is valid: https://aistudio.google.com/app/apikey
- Check API quota in Google Cloud Console
- Update `.env.local` with correct key

---

## Architecture Overview

```
Frontend (React 18 + Vite)      Backend (NestJS)        Database
   ↓                               ↓                        ↓
 :5173                           :3000                  SQLite/PostgreSQL
   ↓                               ↓                        ↓
 Components                  - API Routes
 - Dashboard              - AI Analysis Service
 - Module Views          - Job Queue (BullMQ)
 - Analysis Displays     - Authentication
   ↓                               ↓                        ↓
 Services                   Agents
 - Gemini API            - DefaultAgent
 - WebSocket             - ResearchAgent
 - History               - DesignAgent
```

---

## Next Steps

1. **Update GEMINI_API_KEY** in `.env.local`
2. **Start development servers** (see Quick Start above)
3. **Access frontend** at http://localhost:5173
4. **View API docs** at http://localhost:3000/api/docs
5. **Run tests** to validate functionality
6. **Deploy** when ready (see DEPLOYMENT.md)

---

## Additional Resources

- **Frontend Guide**: See components/ and services/ directories
- **Backend Guide**: See backend/src/ directory structure
- **Database Schema**: backend/prisma/schema.prisma
- **Deployment**: See DEPLOYMENT.md
- **Architecture**: See AGENTIC_WORKFLOW.md

