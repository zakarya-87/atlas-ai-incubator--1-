
# ATLAS AI Incubator

**An Agentic, AI-Powered SaaS Platform for Venture Building.**

[![CI - All Unit Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI%20-%20All%20Unit%20Tests/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions)
[![Frontend Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Frontend%20Unit%20Tests/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions)
[![Backend Tests](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Backend%20Unit%20Tests/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions)

> **Note:** Replace `YOUR_USERNAME/YOUR_REPO` with your actual GitHub username and repository name in the badges above.

ATLAS is a comprehensive platform designed to guide entrepreneurs from raw idea to funding. It leverages a multi-agent AI architecture to generate SWOT analyses, financial models, pitch decks, and market research, all contextualized by a "Venture Memory" that ensures consistency across different business modules.

---

## 🌟 Key Features

*   **Agentic "Boardroom"**: A team of specialized AI agents (CFO, Strategist, Researcher) that collaborate to solve your business problems in real-time.
*   **Venture Context (Memory)**: The AI remembers previous outputs. Your Financial Forecast automatically adapts to the weaknesses identified in your SWOT analysis.
*   **Real-Time Market Research**: Integrated with Google Search Grounding to provide up-to-date competitor pricing and market trends.
*   **Multi-Modal Capabilities**: 
    *   **Vision**: Upload competitor screenshots for analysis.
    *   **Image Gen**: Generate brand identity and logo concepts.
*   **Full SaaS Lifecycle**: Authentication, Team Collaboration (Multi-tenancy), Stripe Subscription Billing, and Usage Quotas.
*   **Professional Reporting**: Server-side generation of high-resolution PDF reports using Puppeteer.

---

## 🏗️ Architecture

ATLAS follows a **Modular Monolith** architecture, designed for easy transition to Microservices.

*   **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion.
*   **Backend**: NestJS (Node.js), Passport.js (JWT), Socket.io (WebSockets).
*   **Database**: PostgreSQL (via Prisma ORM).
*   **AI Layer**: Google Gemini 1.5 Pro & Flash, Imagen 3.
*   **Infrastructure**: Docker, Nginx.

---

## 🚀 Quick Start (Development)

### Prerequisites
*   Node.js v18+
*   Docker & Docker Compose

### 1. Clone & Install
```bash
# Install Root dependencies (for E2E tests)
npm install

# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ..
npm install
```

### 2. Configuration
Create a `.env` file in `backend/`:
```env
# Database (Matches docker-compose.yml)
DATABASE_URL="postgresql://atlas_user:atlas_password@localhost:5432/atlas_db"

# AI Keys (Required)
API_KEY="your_google_gemini_api_key"

# Security
JWT_SECRET="dev_secret_key_change_in_prod"
FRONTEND_URL="http://localhost:5173"

# Stripe (Optional for Dev)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Optional - defaults to Console Log in Dev)
SMTP_HOST="smtp.example.com"
SMTP_USER="user"
SMTP_PASS="pass"
```

### 3. Start Infrastructure
Spin up the local PostgreSQL database.
```bash
docker-compose up -d
```

### 4. Initialize Database
```bash
cd backend
npx prisma generate
npx prisma db push
```

### 5. Run Application
In the root directory, start both Frontend and Backend concurrently:
```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
npm run dev
```
Access the app at `http://localhost:5173`.
Access Swagger API Docs at `http://localhost:3000/api/docs`.

---

## 🧪 Testing

We adhere to strict engineering discipline with a full testing pyramid.

*   **Unit Tests**: `npm run test:unit` (Vitest & Jest)
*   **Integration Tests**: `cd backend && npm run test:e2e` (Supertest)
*   **End-to-End Tests**: `npm run test:e2e` (Playwright)

---

## 📦 Deployment

For production deployment, we use a multi-stage Docker build orchestrated by `docker-compose.prod.yml`.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to AWS, Render, or DigitalOcean.

---

## 📜 License

UNLICENSED. Created for demonstration purposes.
