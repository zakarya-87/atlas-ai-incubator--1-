# ATLAS AI Incubator: Infrastructure & Database Setup

## 1. Overview
This document details the **Infrastructure Phase** of the backend implementation. To transition from a static code scaffold to a running application, we have established the database environment (PostgreSQL via Docker) and aligned the Data Access Layer (Prisma) with the Scalability Plan.

## 2. Components Implemented

### A. Containerization (`docker-compose.yml`)
We have defined a local development environment using Docker Compose.
*   **Service:** `postgres`
*   **Image:** `postgres:15-alpine` (Lightweight, production-grade).
*   **Port:** `5432` mapped to localhost.
*   **Persistence:** A named volume `postgres_data` ensures data survives container restarts.

### B. Schema Alignment (`schema.prisma`)
The database schema has been updated to support **Multi-Tenancy** and **Venture Context**, as outlined in the Scalability Plan.
*   **New Model:** `Venture`.
    *   Represents a specific business idea.
    *   One User can have multiple Ventures.
    *   Analyses are now linked to a `Venture` (not just a User), allowing the AI to understand the context of specific projects.
*   **Relations:**
    *   `User` 1 -> N `Venture`
    *   `Venture` 1 -> N `Analysis`

### C. Configuration (`backend/.env`)
A template environment file has been created to manage sensitive secrets and configuration flags.
*   **Database Connection String:** Pre-configured to match the Docker Compose credentials.
*   **API Keys:** Placeholders for Google Gemini API keys.

---

## 3. Execution Guide (How to Run)

Follow these steps to start the backend services.

### Prerequisites
*   **Node.js** (v18 or v20 recommended)
*   **Docker Desktop** (Must be running)

### Step 1: Install Dependencies
Navigate to the backend directory and install the required packages.
```bash
cd backend
npm install
```

### Step 2: Configure Environment
Open `backend/.env` and replace the placeholder with your actual Gemini API Key.
```env
API_KEY=your_actual_google_api_key_here
```

### Step 3: Start the Database
Spin up the PostgreSQL container in detached mode.
```bash
docker-compose up -d
```
*Verify: Run `docker ps` to ensure the container `atlas-backend-postgres-1` is running on port 5432.*

### Step 4: Generate Prisma Client
Generate the TypeScript types based on the updated schema.
```bash
npx prisma generate
```

### Step 5: Push Schema to Database
Create the tables in the running PostgreSQL container.
```bash
npx prisma db push
```
*Note: We use `db push` for rapid prototyping. For production, we will use `prisma migrate`.*

### Step 6: Start the Server
Launch the NestJS application in development mode.
```bash
npm run start:dev
```

---

## 4. Verification
Once the server is running, you should see:
```
[Nest] ... Application is running on: http://localhost:3000
```

You can verify the API is ready by sending a POST request to `http://localhost:3000/analysis/generate` (requires a valid payload conforming to the DTO).
