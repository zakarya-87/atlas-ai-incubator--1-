# ATLAS AI Incubator - CI/CD & Test Strategy

## 1. Testing Philosophy

We will adhere to the **Testing Pyramid**:

1.  **Unit Tests (60%):** Fast, isolated tests for utility functions and backend business logic.
2.  **Integration Tests (30%):** Testing API endpoints and database interactions.
3.  **E2E Tests (10%):** Simulating critical user journeys (Login -> Generate SWOT -> View History).

## 2. Tooling Stack

| Scope               | Tool               | Usage                                                                 |
| :------------------ | :----------------- | :-------------------------------------------------------------------- |
| **Unit (Frontend)** | **Vitest**         | Fast replacement for Jest. Tests React components and hooks.          |
| **Unit (Backend)**  | **Jest**           | Standard for NestJS. Tests Services and Controllers.                  |
| **Integration**     | **Supertest**      | Tests HTTP endpoints in NestJS against a test DB.                     |
| **E2E**             | **Playwright**     | Browser automation. Tests the full flow across Chrome/Firefox/Safari. |
| **CI/CD**           | **GitHub Actions** | Orchestration of the pipeline.                                        |

## 3. Test Plan Details

### A. Frontend Tests

- **Component Rendering:** Ensure `SwotDisplay`, `FinancialForecastDisplay` render without crashing.
- **Mocking:** Mock the API calls to ensure the UI handles `Loading`, `Success`, and `Error` states correctly.
- **Snapshot Testing:** Ensure complex UI charts/tables don't regress visually.

### B. Backend Tests

- **Service Logic:** Ensure the `PromptBuilder` generates the correct string based on language inputs.
- **Validation:** Ensure the API rejects empty inputs or invalid tool types.
- **AI Handling:** Mock the Google GenAI response to test how the backend handles malformed JSON from the AI model (Robustness).

### C. E2E Scenarios (Playwright)

1.  **User Flow:** User logs in -> Navigates to Strategy -> Types input -> Clicks Generate -> Verifies results appear.
2.  **Offline/Error:** Simulate network failure during generation and verify Error Toast appears.

## 4. CI/CD Pipeline (GitHub Actions)

We will define two workflows: `pr-check.yml` and `deploy.yml`.

### Workflow 1: Pull Request Check (`pr-check.yml`)

_Triggers on: Pull Request to `main`_

1.  **Lint & Format:**
    - Run `eslint` and `prettier --check`.
    - Fail if code style violations exist.
2.  **Type Check:**
    - Run `tsc --noEmit` to catch TypeScript errors.
3.  **Unit Testing:**
    - Run `npm run test:unit` (Frontend & Backend parallel).
4.  **Integration Testing:**
    - Spin up ephemeral PostgreSQL container (Service Containers).
    - Run backend integration tests.

### Workflow 2: Deployment (`deploy.yml`)

_Triggers on: Push to `main` (after PR merge)_

1.  **Pre-flight:** Run Unit Tests (Safety check).
2.  **E2E Testing:**
    - Build the Frontend.
    - Start Backend (Test Mode).
    - Run Playwright tests.
3.  **Build & Push Docker:**
    - Build Backend Docker Image -> Push to Container Registry (GHCR/ECR).
4.  **Deploy Backend:**
    - Trigger webhook to update cloud provider (e.g., Render/AWS).
    - Run Database Migrations (`prisma migrate deploy`).
5.  **Deploy Frontend:**
    - Trigger Vercel/Netlify deployment via CLI or GitHub Integration.

## 5. Configuration Snippets

### GitHub Actions: Backend Test Step

```yaml
jobs:
  backend-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: user
          POSTGRES_PASSWORD: password
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v3
      - name: Install Dependencies
        run: npm ci
      - name: Run Integration Tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgres://user:password@localhost:5432/test_db
```

### Playwright Config (`playwright.config.ts`)

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'npm run start:dev', // Starts both FE and BE locally
    port: 3000,
    timeout: 120 * 1000,
  },
  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

## 6. Implementation Timeline for DevOps

1.  **Week 1:** Setup Husky (pre-commit hooks) and Vitest.
2.  **Week 2:** Configure GitHub Actions for Linting and Unit Tests.
3.  **Week 3:** Implement E2E tests for the critical "Generate Analysis" flow.
4.  **Week 4:** Full CD pipeline with staging environment.
