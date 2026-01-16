# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

ATLAS AI Incubator is an agentic AI-powered SaaS platform for venture building. It uses a multi-agent architecture where specialized AI agents (CFO, Strategist, Researcher, etc.) collaborate to generate business analyses (SWOT, financial models, pitch decks, market research) with contextual memory across sessions.

**Architecture Pattern**: Modular Monolith (designed for easy microservices transition)
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend**: NestJS (Node.js) + Passport JWT + Socket.io WebSockets
- **Database**: PostgreSQL via Prisma ORM
- **AI**: Google Gemini 1.5 Pro & Flash, Imagen 3
- **Infrastructure**: Docker + Nginx + Redis (BullMQ for job queues)

## Common Commands

### Development Setup

```powershell
# Install root dependencies (E2E tests)
npm install

# Install backend dependencies
cd backend
npm install
npx prisma generate

# Start infrastructure (PostgreSQL + Redis)
docker-compose up -d

# Initialize database (first time only)
cd backend
npx prisma db push
```

### Running the Application

```powershell
# Terminal 1: Start backend (development mode with hot reload)
cd backend
npm run start:dev

# Terminal 2: Start frontend (development mode)
npm run dev
```

**Access Points**:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Swagger API Docs: `http://localhost:3000/api/docs`

### Testing

```powershell
# Frontend unit tests (Vitest)
npm run test:unit

# Backend unit tests (Jest)
cd backend
npm run test

# Backend integration tests (Supertest)
cd backend
npm run test:e2e

# E2E tests (Playwright) - requires both frontend and backend running
npm run test:e2e

# E2E with UI mode (interactive debugging)
npm run test:e2e:ui
```

### Building for Production

```powershell
# Build frontend
npm run build

# Build backend
cd backend
npm run build

# Run production build
cd backend
npm run start:prod
```

### Database Management

```powershell
cd backend

# Generate Prisma client after schema changes
npx prisma generate

# Push schema changes to database (development)
npx prisma db push

# Create migration (production-ready)
npx prisma migrate dev --name <migration_name>

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Linting and Formatting

```powershell
# Frontend lint
npm run lint

# Backend lint
cd backend
npm run lint

# Backend format
cd backend
npm run format
```

## Architecture Overview

### Backend Module Structure

The NestJS backend follows a **domain-driven modular architecture**:

```
backend/src/
├── analysis/          # Core AI generation logic and multi-agent orchestration
│   ├── agents/        # Specialized AI agents (research, design, default)
│   ├── analysis.factory.ts  # Agent selection based on module/tool
│   └── analysis.service.ts  # Main orchestration with "Venture Memory"
├── auth/              # JWT authentication, guards, strategies
├── ventures/          # Business project management (multi-tenancy)
├── history/           # Analysis versioning and audit trail
├── users/             # User management with credit quotas
├── subscriptions/     # Stripe integration for billing
├── reports/           # PDF generation via Puppeteer
├── events/            # WebSocket gateway for real-time agent logs
├── integrations/      # External service connectors (OAuth)
├── email/             # Transactional emails via Nodemailer
├── health/            # Health checks and Prometheus metrics
└── prisma/            # Database service and schema
```

### Key Architectural Concepts

#### 1. **Venture Memory System**
The platform implements a context-aware memory layer where each AI generation references previous analyses for the same venture. This is implemented in `analysis.service.ts`:
- Fetches the last 10 relevant analyses via `HistoryService`
- Formats them as XML `<venture_memory_bank>` tags
- Injects into Gemini prompts to ensure consistency (e.g., if SWOT identified "Limited Capital", the Marketing Plan must suggest low-cost strategies)

#### 2. **Multi-Agent Architecture**
Each business domain (Strategy, Finance, Marketing) has a specialized agent with custom system instructions:
- `AnalysisAgentFactory` selects the appropriate agent based on `module` and `tool` parameters
- Agents use specific response schemas defined via `SchemaType` for structured JSON output
- Real-time agent activity logs emitted via WebSockets to the `LiveActivityFeed` component

#### 3. **WebSocket-Driven UX**
The platform provides transparency by streaming agent "thoughts":
- Backend emits `agentLog` events via `EventsGateway` (Socket.io)
- Frontend subscribes in `AgentOrchestrator.tsx` to display real-time updates
- Logs use translation keys (e.g., `agentLogAnalyzingContext`) for i18n support

#### 4. **Async Job Processing**
Long-running tasks (PDF reports, image generation) use BullMQ with Redis:
- Jobs submitted via `JobsController`
- Processed in background workers
- Status updates pushed via WebSockets

#### 5. **Prisma Schema Design**
- **User**: Authentication, role-based access, credit quotas, Stripe customer ID
- **Venture**: Projects owned by users with team collaboration support
- **VentureMember**: Multi-tenancy for team collaboration (owner/editor/viewer roles)
- **Analysis**: AI-generated content with versioning (`parentId` for refinements)
- **RefreshToken**: Secure token rotation for JWT auth
- **Subscription**: Stripe billing integration
- **AuditLog**: Compliance and activity tracking

### Frontend Architecture

```
src/
├── App.tsx                    # Main application entry with routing
├── components/                # Reusable UI components
├── context/                   # React Context providers (Auth, Venture)
├── hooks/                     # Custom React hooks
├── services/                  # API client and WebSocket managers
├── utils/                     # Utility functions and helpers
├── types.ts                   # Centralized TypeScript types
└── locales/                   # i18n translation files
```

**Key Components**:
- `AgentOrchestrator.tsx`: WebSocket manager and state machine for agent workflows
- `LiveActivityFeed.tsx`: Glassmorphism UI showing real-time agent logs
- `ArtifactPreview.tsx`: Dynamic document rendering with streaming updates

## Development Guidelines

### Working with AI Agents

When adding a new analysis tool:

1. **Define the TypeScript type** in `types.ts` (e.g., `MarketAnalysisData`)
2. **Create the response schema** in the relevant agent file using `@google/generative-ai` SchemaType
3. **Register the agent** in `AnalysisAgentFactory.getAgent()` method
4. **Add translation keys** for agent logs in `locales/`
5. **Create a display component** in `components/` to render the results

### Database Changes

Always use Prisma migrations for schema changes:
```powershell
cd backend
# Edit src/prisma/schema.prisma
npx prisma migrate dev --name add_new_field
npx prisma generate
```

### Testing Strategy

#### Philosophy: Testing Pyramid (60/30/10)

The project follows a **strict Testing Pyramid** approach as defined in `CICD_TEST_STRATEGY.md`:
- **60% Unit Tests**: Fast, isolated tests for business logic
- **30% Integration Tests**: API endpoints with database interactions
- **10% E2E Tests**: Critical user journeys across the full stack

#### Current Test Coverage

**Backend Unit Tests** (`backend/src/**/*.spec.ts`):
- `analysis.service.spec.ts`: Core AI orchestration logic
  - Tests venture context injection ("Venture Memory")
  - Validates access control (owner/member checks)
  - Mocks AI agent responses to avoid Google API calls
  - Verifies WebSocket log emission
- `analysis.factory.spec.ts`: Agent selection logic
  - Tests module-to-agent routing (e.g., marketAnalysis → ResearchAgent)
  - Validates fallback to DefaultAgent

**Backend Integration Tests** (`backend/test/*.e2e-spec.ts`):
- `analysis.e2e-spec.ts`: Full HTTP request/response cycle
  - Tests JWT authentication (401 without token)
  - Validates DTO validation (400 on invalid input)
  - Mocks PrismaService, AnalysisAgentFactory, EventsGateway
  - Uses `supertest` to make real HTTP calls against the NestJS app

**Frontend Unit Tests**:
- `hooks/useUndoRedo.test.ts`: Undo/redo state management
  - Tests history tracking, undo/redo operations, state reset
- `services/geminiService.test.ts`: API client layer
  - Mocks `fetch` to test request formatting
  - Tests error handling (401 auth, 500 server errors)
  - Validates authorization header injection

**E2E Tests** (`e2e/core-flow.spec.ts`):
- Golden path: User generates SWOT analysis
  - Mocks `/analysis/generate` API response
  - Simulates authentication via localStorage
  - Tests UI state transitions (loading → results → export)
- Module navigation: Switching between Strategy/Finance/Marketing

#### Running Tests

```powershell
# Backend unit tests (Jest)
cd backend
npm run test          # Run all unit tests
npm run test:watch    # Watch mode
npm run test:cov      # With coverage report
npm run test:debug    # Debug mode

# Backend integration tests (Supertest)
cd backend
npm run test:e2e      # Runs test/**.e2e-spec.ts

# Frontend unit tests (Vitest)
npm run test:unit     # Fast, runs in jsdom environment

# Full E2E tests (Playwright)
npm run test:e2e      # Starts both servers automatically
npm run test:e2e:ui   # Interactive UI mode for debugging
```

#### Test Configuration Files

- **Backend Unit**: Uses NestJS default Jest config (inline in package.json)
- **Backend Integration**: `backend/test/jest-e2e.json`
  - `testRegex: ".e2e-spec.ts$"`
  - `testEnvironment: "node"`
- **Frontend Unit**: `vitest.config.ts`
  - `environment: 'jsdom'` for DOM APIs
  - `globals: true` for describe/it/expect without imports
- **E2E**: `playwright.config.ts`
  - `baseURL: 'http://localhost:5173'`
  - Auto-starts both backend (port 3000) and frontend (port 5173)
  - 120-second timeout for server startup

#### Key Testing Patterns

**1. Mocking External Dependencies**

To avoid expensive/unreliable external calls during tests:

```typescript
// Backend: Mock Google Gemini AI
const mockAgentFactory = {
  getAgent: jest.fn().mockReturnValue({
    generate: jest.fn().mockResolvedValue({ 
      text: '{"result":"success"}', 
      data: { result: 'success' } 
    })
  })
};

// Frontend: Mock fetch API
mockFetch.mockResolvedValue({
  ok: true,
  json: async () => ({ strengths: [...] })
});

// E2E: Mock entire endpoints
await page.route('**/analysis/generate', route => {
  route.fulfill({ status: 200, body: JSON.stringify({...}) });
});
```

**2. Testing Authentication Flows**

Integration tests use `JwtService` to generate valid tokens:
```typescript
const token = await jwtService.signAsync(
  { email: user.email }, 
  { secret: 'secretKey' }
);
request(app.getHttpServer())
  .post('/analysis/generate')
  .set('Authorization', `Bearer ${token}`)
```

E2E tests simulate localStorage state:
```typescript
await page.addInitScript((state) => {
  window.localStorage.setItem('atlas_auth_token', state.token);
}, { token: 'mock-e2e-token' });
```

**3. Database Testing Strategy**

Integration tests **mock Prisma** rather than using a test database:
```typescript
prismaService = {
  venture: { 
    findUnique: jest.fn().mockResolvedValue({ id: 'v1', userId: 'user-123' })
  },
  analysis: { create: jest.fn() }
};
```

**Rationale**: Faster execution, no cleanup needed. For true integration tests against PostgreSQL, use `docker-compose` with ephemeral containers in CI (see GitHub Actions workflow).

**4. Testing AI Context Injection**

Critical test in `analysis.service.spec.ts` validates the "Venture Memory" system:
```typescript
it('should inject context into the agent prompt', async () => {
  historyService.getRecentAnalysesForContext.mockResolvedValue([
    { tool: 'pestel', resultData: { data: 'old-data' } }
  ]);
  
  await service.generateAnalysis(mockDto, userId);
  
  const generateCallArgs = mockAgent.generate.mock.calls[0];
  expect(generateCallArgs[1]).toContain('pestel');
  expect(generateCallArgs[1]).toContain('old-data');
});
```

This ensures previous analyses are properly injected as XML context.

#### Test Gaps and Expansion Opportunities

Based on the current test files, the following areas need more coverage:

**Missing Unit Tests**:
- `auth/auth.service.ts`: JWT generation, password hashing, refresh token logic
- `users/users.service.ts`: Credit deduction logic
- `ventures/ventures.service.ts`: Team member management
- `history/history.service.ts`: Analysis versioning and refinement
- Frontend components: `AgentOrchestrator.tsx`, `LiveActivityFeed.tsx`

**Missing Integration Tests**:
- `/auth/login` and `/auth/register` endpoints
- `/history` endpoint for fetching past analyses
- `/ventures` CRUD operations
- WebSocket event flows (agent logs, job status updates)

**Missing E2E Tests**:
- User registration and login flow
- Analysis refinement/versioning workflow
- PDF export functionality
- Multi-language switching
- Error recovery scenarios (network failures, API quota exceeded)

#### Adding New Tests

**Backend Unit Test Template**:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from './your.service';

describe('YourService', () => {
  let service: YourService;
  let mockDependency: any;

  beforeEach(async () => {
    mockDependency = { method: jest.fn() };
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourService,
        { provide: DependencyService, useValue: mockDependency }
      ],
    }).compile();

    service = module.get<YourService>(YourService);
  });

  it('should do something', async () => {
    mockDependency.method.mockResolvedValue('result');
    const output = await service.yourMethod();
    expect(output).toBe('expected');
  });
});
```

**Frontend Unit Test Template**:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import YourComponent from './YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent prop="value" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

**E2E Test Template**:
```typescript
import { test, expect } from '@playwright/test';

test('User can perform action', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Action' }).click();
  await expect(page.getByText('Success')).toBeVisible();
});
```

### Environment Variables

**Backend** (`.env` in `backend/`):
```env
DATABASE_URL="postgresql://atlas_user:atlas_password@localhost:5432/atlas_db"
API_KEY="your_google_gemini_api_key"  # Required for AI generation
JWT_SECRET="dev_secret_key_change_in_prod"
FRONTEND_URL="http://localhost:5173"
REDIS_HOST="localhost"
REDIS_PORT="6379"
STRIPE_SECRET_KEY="sk_test_..."  # Optional for dev
```

**Frontend** (`.env.local` in root):
```env
VITE_API_URL="http://localhost:3000"
```

### Security Considerations

- API keys are **never exposed to the frontend** (proxied through backend)
- JWT tokens use secure HttpOnly cookies with refresh token rotation
- Rate limiting enforced: 10 requests per 60 seconds (ThrottlerGuard)
- Input validation via `class-validator` DTOs
- CORS restricted to `FRONTEND_URL` in production
- Helmet middleware for security headers

### CI/CD Pipeline

GitHub Actions workflows in `.github/workflows/`:

**`pr-check.yml`** (on pull requests):
1. Frontend unit tests (Vitest)
2. Backend unit tests (Jest)
3. Backend integration tests (Supertest with ephemeral PostgreSQL)
4. E2E tests (Playwright)

**`deploy.yml`** (on push to main):
1. Build frontend and backend
2. Deploy to production infrastructure

## Project-Specific Patterns

### Agentic Workflow Pattern
The platform uses a **"Goal → Plan → Execute → Review"** flow instead of traditional form submission:
- User provides a high-level goal (e.g., "I need to raise $500k seed funding")
- Supervisor agent breaks it into tasks (Market Research → Financial Modeling → Pitch Deck)
- UI shows task graph with live agent activity
- Human-in-the-loop checkpoints for critical decisions

### Refinement/Versioning System
Users can refine AI outputs iteratively:
- Original analysis stored with unique `id`
- Refined version created with `parentId` pointing to original
- Refinement prompt includes both original description and user feedback
- System instruction tells AI to "start with previous result and modify based on feedback"

### Credit Quota System
SaaS usage limits via `User.credits` field:
- Each analysis generation deducts credits
- Enforced in `UsersService.checkAndDeductCredits()`
- Dev bypass: `userId === 'dev-test-user-id'` skips credit check

### Prompt Engineering Best Practices
The system instructions in `analysis.service.ts` include:
- **Strategic Consistency**: Cross-reference venture memory to avoid contradictions
- **Data-Driven Realism**: Prefer specific numbers over generic advice
- **Critical Thinking**: Challenge user inputs if they contradict previous analyses
- **Structured Output**: Enforce strict JSON schema compliance

## Common Issues and Solutions

### WebSocket connection fails
Ensure both backend (port 3000) and frontend (port 5173) are running. Check CORS settings in `main.ts`.

### Prisma client out of sync
After pulling schema changes: `cd backend && npx prisma generate`

### Docker Compose fails to start
Check if ports 5432 (PostgreSQL) or 6379 (Redis) are already in use: `netstat -ano | findstr "5432"`

### AI generation returns malformed JSON
Check the response schema definition matches the expected TypeScript type. Validate with Gemini's `responseMimeType: "application/json"` and `responseSchema` parameters.

### E2E tests timeout
Increase timeout in `playwright.config.ts` or ensure both servers start within 120 seconds.
