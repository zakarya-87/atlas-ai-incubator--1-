# ATLAS AI Incubator

## Project Overview
AI-powered SaaS platform for entrepreneurs to build ventures using multi-agent AI workflows. Generates SWOT analyses, financial models, pitch decks, market research, and more. Maintains "Venture Memory" for consistency across modules.

## Architecture
- **Frontend**: React 18 + Vite + TypeScript + Framer Motion, served on port 5000
- **Backend**: NestJS (Node.js) REST API + WebSockets (Socket.io), running on port 3000
- **Database**: PostgreSQL (Replit built-in) with Prisma ORM + pgvector extension
- **Queue**: BullMQ backed by Redis
- **AI**: Google Gemini (primary), Grok, Mistral AI providers

## Project Layout
```
/ (root)          - React frontend source
  components/     - UI components
  context/        - Global state (Auth, Language, Toast)
  hooks/          - Custom React hooks
  services/       - Frontend API service layer
  locales/        - i18n translations (EN, AR, FR)
  vite.config.ts  - Vite config (port 5000, proxies /api → :3000)

backend/          - NestJS application
  src/
    analysis/     - AI agentic workflows
    auth/         - JWT authentication
    prisma/       - Prisma service
    ventures/     - Venture management
    users/        - User management
    subscriptions/- Stripe subscriptions
    events/       - WebSocket gateway
    reports/      - PDF report generation
    history/      - Version history
    integrations/ - External integrations
  prisma/
    schema.prisma - Database schema
    migrations/   - Database migration history
```

## Running the Project
The `start.sh` script starts all services:
1. Redis (background, port 6379)
2. Prisma migration
3. NestJS backend (port 3000)
4. Vite frontend (port 5000)

Workflow: `bash start.sh` → waits for port 5000

## Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection (auto-set by Replit)
- `JWT_SECRET` - JWT signing secret (set in env vars)
- `GEMINI_API_KEY` - Google Gemini API key (**must be set to a real key for AI features**)
- `NODE_ENV` - development/production
- `PORT` - Backend port (3000)
- `REDIS_HOST` / `REDIS_PORT` - Redis connection

## Optional Environment Variables
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` - Stripe payments
- `SMTP_HOST/PORT/USER/PASS` - Email (dev mode logs to console if not set)
- `GROK_API_KEY` - Grok AI provider
- `MISTRAL_API_KEY` - Mistral AI provider

## Key Notes
- GEMINI_API_KEY is required by backend env validation — set a real key for AI features
- The placeholder GEMINI_API_KEY will allow the app to start but AI analysis will fail
- Vite proxies `/api` and `/socket.io` to `localhost:3000`
- Backend CORS allows all origins in development mode
- pgvector extension is declared in schema but may not be installed — vector search may not work
