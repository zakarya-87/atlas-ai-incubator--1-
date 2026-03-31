# ATLAS AI Incubator

## Project Overview
AI-powered SaaS platform for entrepreneurs to build ventures using multi-agent AI workflows. Generates SWOT analyses, financial models, pitch decks, market research, and more. Maintains "Venture Memory" for consistency across modules.

## Architecture
- **Frontend**: React 18 + Vite + TypeScript + Framer Motion, served on port 5000
- **Backend**: NestJS (Node.js) REST API + WebSockets (Socket.io), running on port 3000
- **Database**: PostgreSQL (Replit built-in) with Prisma ORM + pgvector extension
- **Queue**: BullMQ backed by Redis
- **AI**: Mistral AI (primary), OpenAI (fallback), Grok (fallback) — Gemini optional/disabled

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
- `JWT_SECRET` - JWT signing secret
- `MISTRAL_API_KEY` - Primary AI provider (**required for AI features**)
- `NODE_ENV` - development/production
- `PORT` - Backend port (3000)
- `REDIS_HOST` / `REDIS_PORT` - Redis connection

## Optional Environment Variables
- `OPENAI_API_KEY` / `OPENAI_MODEL` - OpenAI fallback AI provider
- `GEMINI_API_KEY` - Google Gemini (optional; only used for Research agent with grounding)
- `GROK_API_KEY` - Grok AI fallback provider
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` - Stripe payments
- `SMTP_HOST/PORT/USER/PASS` - Email (dev mode logs to console if not set)
- `DEFAULT_AI_PROVIDER` - Override primary provider (default: mistral)
- `MISTRAL_MODEL` - Mistral model name (default: mistral-large-latest)

## AI Provider System
- **Primary**: Mistral AI (via `completeWithFallback` chain in AIProviderFactory)
- **Fallback chain**: Mistral → OpenAI → Grok
- **Schema enforcement**: Both Mistral and OpenAI providers inject a JSON template into the system prompt so the model produces the correct field structure
- **Response normalization**: `AnalysisService.unwrapSingleKeyWrapper()` strips any single-key wrapper object that some models return (e.g. `{ business_idea_validation: {...} }` → `{...}`)

## Landing Page
- `components/LandingPage.tsx` — public marketing landing page shown to unauthenticated visitors
- Integrated into `App.tsx`: when `!isAuthenticated`, renders LandingPage instead of the dashboard
- "Sign In" and "Start Free" buttons open the existing `AuthModal` (via `onSignIn` prop)
- Dynamic animated background: 5 CSS-keyframe orbs + drifting mesh grid + floating particles + scan line
- Hero background image at `public/atlas-hero-bg.png`
- Design mockup source: `artifacts/mockup-sandbox/src/components/mockups/atlas-landing/LandingPage.tsx`

## Key Notes
- Vite proxies `/api` and `/socket.io` to `localhost:3000`
- Backend CORS allows all origins in development mode
- pgvector extension is declared in schema but may not be installed — vector search may not work
- Analysis jobs run through BullMQ queue with WebSocket real-time updates to frontend
