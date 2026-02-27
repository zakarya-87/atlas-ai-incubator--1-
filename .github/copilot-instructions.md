# ATLAS AI Incubator - Copilot Instructions

## Architecture Overview

ATLAS is an **Agentic AI SaaS platform** that guides entrepreneurs from idea to funding. It uses a modular monolith architecture with a React frontend (Vite), NestJS backend, and PostgreSQL database.

**Key Principle:** The platform maintains "Venture Memory" - historical analyses automatically inform new generations, ensuring consistency across business modules (SWOT → Financial Forecast → Pitch Deck).

```
Frontend (React 18 + Vite)  ←→  Backend (NestJS)  ←→  Database (PostgreSQL)
    ↓ AI Clients               ↓ Agent Factory         ↓ History Storage
  Gemini API              [Default/Research/Design]  [Venture Context]
```

## Module Structure

### Frontend Modules (`components/` & `types.ts`)

Each module (dashboard, fundamentals, strategy, finance, growth, funding, etc.) follows this pattern:

- **Tool Definition**: Each module contains multiple tools (e.g., `strategy` has `swot`, `pestel`, `roadmap`, `okrWorkflow`)
- **Display Components**: `{ToolName}Display.tsx` renders analysis results
- **SubNav Components**: `{ModuleType}SubNav.tsx` provides tool navigation
- **Type Safety**: All analysis types defined in `types.ts` (SwotData, PestelData, etc.)

**Navigation Flow:**

1. User selects module in sidebar (`Layout.tsx`)
2. `App.tsx` calls `ModuleRouter` with active module/tool
3. `ModuleRouter` dispatches to appropriate display component
4. Input form appears (unless tool is system-focused like `systemDesign`, `taskManager`)

### Backend Services (`backend/src/`)

**Module-based architecture:**

- `auth/` - JWT + Passport.js strategy, user registration/login
- `analysis/` - Core AI generation orchestration
  - `analysis.factory.ts` - Routes to DefaultAgent, ResearchAgent, or DesignAgent based on tool type
  - `agents/` - Agent implementations (inherit from BaseAgent)
  - `dto/generate-analysis.dto.ts` - Validates generation requests
- `history/` - Persists analyses; fetches context for "Venture Memory"
- `ventures/` - Multi-tenancy: users own ventures, invite team members
- `users/` - Credit/subscription management (SaaS quotas)
- `events/` - WebSocket gateway for real-time agent logs (`EventsGateway`)

## Critical Patterns & Conventions

### 1. Venture Memory (Context Window)

**Pattern:** Before generating new analyses, fetch historical data and inject as XML.

**Implementation:**

```typescript
// backend/src/analysis/analysis.service.ts - getVentureContext()
const history = await this.historyService.getRecentAnalysesForContext(
  ventureId,
  currentTool
);
// Returns wrapped in <venture_memory_bank> XML tags
```

**Why:** Gemini's context window is large; we strategically inject 10 most relevant past analyses to maintain consistency. E.g., SWOT findings automatically constrain financial forecast assumptions.

**Frontend Impact:** Historical data loaded into `useUndoRedo` state; when user navigates back to previous analysis, edits are tracked as new "versions" (audit trail via `parentId` in schema).

### 2. Agent Factory Pattern

**Pattern:** Route AI calls to specialized agents based on tool type.

**Implementation (`analysis.factory.ts`):**

- **DefaultAgent**: Strategic tools (SWOT, Roadmap, OKR) - uses Gemini without live search
- **ResearchAgent**: Market tools (Competitor Analysis, Market Research) - uses Google Search grounding + vision
- **DesignAgent**: Visual tools (Brand Identity) - uses Image Generation

**Key Decision Logic:**

```typescript
if (tool === 'brandIdentity') return designAgent;
if (module === 'marketAnalysis') return researchAgent;
if (['competitorAnalysis', 'marketResearch', 'investorDatabase'].includes(tool))
  return researchAgent; // Needs real-time data
return defaultAgent;
```

**When Adding New Tools:**

1. Define type in `types.ts`
2. Add display component in `components/`
3. Create generation function in `services/geminiService.ts` (frontend) or `backend/src/analysis/`
4. Update factory routing logic if tool needs research/vision
5. Add i18n keys in `locales/`

### 3. Schema-Driven Generation

**Pattern:** Gemini uses `responseSchema` to enforce JSON structure.

**Example (SWOT):**

```typescript
const swotSchema = {
  type: SchemaType.OBJECT,
  properties: {
    strengths: { type: SchemaType.ARRAY, items: analysisPointSchema },
    weaknesses: {
      /* ... */
    },
    opportunities: {
      /* ... */
    },
    threats: {
      /* ... */
    },
  },
  required: ['strengths', 'weaknesses', 'opportunities', 'threats'],
};
```

**Convention:** Define schema at top of service file; reuse `analysisPointSchema` (point + explanation) for consistency.

### 4. Real-Time WebSocket Logs

**Pattern:** As backend agents execute, emit live "agent logs" to frontend via WebSocket.

**Backend:**

```typescript
this.eventsGateway.emitLog(ventureId, {
  id: generateId(),
  agent: 'Market Researcher', // or CFO, Strategist, etc.
  messageKey: 'agentLogSearchingCompetitors', // i18n key
  timestamp: Date.now(),
});
```

**Frontend (`components/AgentOrchestrator.tsx`):**
Listens to socket events; displays in activity feed (not yet implemented - aspirational).

### 5. Multi-Language Support

**Pattern:** All UI strings use translation keys.

**Example:**

```typescript
const t = useLanguage().t; // Frontend hook
setError({ code: 'errorRateLimit', message: t('errorRateLimit') });

// Backend passes language to services
const data = await generate(description, language, ventureId);
```

**Convention:**

- Translation keys are CamelCase (e.g., `errorEmptyDescription`, `geminiPromptSwot`)
- Defined in `locales/` for en, fr, ar
- Backend prompts in `locales/` are prefixed `geminiPrompt*` (e.g., `geminiPromptSwot`, `geminiPromptMarketResearch`)

### 6. State Management (Frontend)

**Key Hooks:**

- `useUndoRedo()` - Tracks analysis history with undo/redo support
- `usePersistedState()` - Saves input draft to localStorage (key: `atlas_input_draft`)
- Context APIs - `AuthContext`, `LanguageContext`, `ToastContext`

**Global State in `App.tsx`:**

```typescript
const [businessDescription, setBusinessDescription] = usePersistedState(
  'atlas_input_draft',
  ''
);
const [currentAnalysis, setCurrentAnalysis] = useUndoRedo(null);
const [viewingHistoryRecord, setViewingHistoryRecord] = useState(null); // Preview mode
const [generationHistory, setGenerationHistory] = useState([]);
```

**Pattern:** When user views a historical record, `viewingHistoryRecord` is set; UI shows "Return to Workspace" button. Edits to historical records create new versions (NOT mutations).

### 7. SaaS Credit System

**Pattern:** Each API call deducts credits; free tier has 100 credits.

**Backend:**

```typescript
if (userId !== 'dev-test-user-id') {
  await this.usersService.checkAndDeductCredits(userId);
}
```

**Convention:** Dev bypass uses hardcoded `'dev-test-user-id'` for testing.

### 8. Error Handling

**Frontend:** Errors have a code + message structure:

```typescript
{ code: 'errorRateLimit', message: t(code) } // Translatable
```

**Backend:**

- Use NestJS `HttpException` with global `HttpExceptionFilter`
- Log via Winston logger: `logger.error(...)`
- Emit via WebSocket for critical operations

### 9. Testing Strategy

**Frontend (Vitest):**

```bash
npm run test:unit  # Runs hooks/, components/, context/, utils/
```

Uses jsdom environment; excludes services/geminiService.ts.

**Backend (Jest):**

```bash
cd backend && npm run test:e2e  # Integration tests via Supertest
```

Located in `backend/test/`

**E2E (Playwright):**

```bash
npm run test:e2e  # Full user workflows
```

## Development Commands

| Command                                     | Purpose                        | Runs From      |
| ------------------------------------------- | ------------------------------ | -------------- |
| `npm run dev`                               | Start frontend (Vite) on :5173 | root           |
| `cd backend && npm run start:dev`           | Start backend on :3000         | root → backend |
| `docker-compose up -d`                      | Spin up PostgreSQL             | root           |
| `npx prisma generate && npx prisma db push` | Initialize DB                  | backend/       |
| `npm run test:unit`                         | Frontend unit tests            | root           |
| `npm run test:e2e`                          | Playwright end-to-end          | root           |
| `cd backend && npm run test:e2e`            | Backend integration tests      | backend/       |

**Setup Checklist:**

1. `npm install && cd backend && npm install && cd ..`
2. Create `backend/.env` (DATABASE_URL, API_KEY, JWT_SECRET, etc.)
3. `docker-compose up -d`
4. `cd backend && npx prisma db push`
5. Run dev in two terminals

## Key Files to Know

| File                                        | Purpose                                                         |
| ------------------------------------------- | --------------------------------------------------------------- |
| `App.tsx`                                   | Global state orchestration, module routing, generation dispatch |
| `types.ts`                                  | Centralized type definitions (439 lines)                        |
| `services/geminiService.ts`                 | Frontend AI generation; all schemas; history fetching           |
| `components/ModuleRouter.tsx`               | Renders correct sub-nav + content based on active module        |
| `backend/src/analysis/analysis.service.ts`  | Core backend orchestration; Venture Memory injection            |
| `backend/src/analysis/agents/base.agent.ts` | BaseAgent implementation; Gemini API calls                      |
| `backend/prisma/schema.prisma`              | Database schema; User, Venture, Analysis, Job models            |
| `backend/src/events/events.gateway.ts`      | WebSocket for real-time agent logs                              |
| `locales/`                                  | Translation keys for all UI + backend prompts                   |

## Debugging Tips

**Frontend generation not working:**

1. Check `API_KEY` in `vite.config.ts` - must load from env
2. Verify Gemini API quota in Google Cloud Console
3. Use browser DevTools to inspect `geminiService.ts` promise chain

**Backend generation failing:**

1. Check `backend/.env` - API_KEY must be set
2. Verify Venture exists in database (auto-created on first request)
3. Check `backend/src/analysis/analysis.service.ts` for credit deduction errors
4. View WebSocket logs via `events.gateway.ts` for real-time agent activity

**Database issues:**

1. `npx prisma db push` to sync schema after changes
2. `npx prisma generate` to regenerate Prisma client
3. Check `docker ps` - ensure PostgreSQL container is running
4. `docker-compose logs db` for database errors

## Future Architecture Notes

- **Agent Orchestration:** `AGENTIC_WORKFLOW.md` describes planned "Boardroom" interface with live agent logs
- **Multi-Agent Dispatch:** Currently all tools route to one of 3 agents; future: parallel multi-agent systems
- **Report Generation:** `backend/src/reports/` uses Puppeteer for PDF export
- **Job Queue:** `backend/src/analysis/jobs.controller.ts` interfaces with BullMQ for async operations
