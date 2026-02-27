# ATLAS AI Platform: Scalability & Consistency Roadmap

## 1. Strategic Phasing

### Phase 1: The "Brain" & Memory (Current Priority)

**Goal:** Transition from Stateless (Client-side) to Stateful (Server-side).

- **Architecture:** Modular Monolith (NestJS).
- **Database:** PostgreSQL (Relational data) + Prisma ORM.
- **Key Feature:** "Venture Context". The AI remembers previous answers. If you generate a SWOT, the Financial Forecast knows about the Weaknesses listed in that SWOT.
- **Scalability Check:** Stateless API design allows horizontal scaling of Node.js instances.

### Phase 2: The Agentic Layer (Orchestration)

**Goal:** Move from "Tools" to "Agents".

- **Concept:** The "Boardroom".
- **Implementation:**
  - **Supervisor Agent:** Breaks down user goals ("Help me raise series A") into sub-tasks.
  - **Worker Agents:** Specialized prompts (The CFO, The Skeptic, The Researcher).
- **Scalability Check:** Redis Queues (BullMQ) to handle long-running agent tasks without blocking the HTTP main thread.

### Phase 3: The Ecosystem (Network Effects)

**Goal:** Connect Ventures and External Data.

- **Features:**
  - **Real-time Data:** Google Search Grounding (Live competitors).
  - **Integrations:** Stripe/Plaid (Actual financials).
- **Consistency Check:** Strict TypeScript Interfaces (DTOs) shared between Frontend and Backend via a Monorepo structure to ensure data contracts never break.

---

## 2. Consistency Strategy: "Venture-Scoped State"

To ensure the platform feels "smart," we must maintain consistency across modules.

**The Data Model:**
Instead of saving isolated "Analyses," we save a **Venture**.

- `Venture` (The Project)
  - `ContextVector` (A summarized embedding of what the business is)
  - `Modules` (Strategy, Finance, etc.)
    - `Artifacts` (The specific SWOT, Budget, etc.)

**The "Hydration" Pattern:**
When generating a **Pitch Deck**:

1.  Backend fetches the `Venture`.
2.  Backend injects `SWOT`, `Financials`, and `Market Research` from the database into the Prompt Context.
3.  Gemini generates a deck _consistent_ with the budget and strategy previously defined.

---

## 3. Scalability Architecture

| Layer            | Technology     | Strategy                                                                                                                                 |
| :--------------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**     | React + Vite   | **Optimistic UI:** Show "Thinking..." states immediately. **React Query:** Cache server state to minimize API hits.                      |
| **API Gateway**  | NestJS         | **Rate Limiting:** Prevent abuse. **Compression:** Gzip JSON responses.                                                                  |
| **Worker Layer** | Redis + BullMQ | **Async Processing:** Offload AI generation (10s-60s duration) to background workers.                                                    |
| **Database**     | PostgreSQL     | **Read Replicas:** Separate read/write traffic as user base grows. **JSONB:** Store flexible AI outputs without rigid schema migrations. |
