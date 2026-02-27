# Deployment Guide

This document outlines the steps to deploy the ATLAS AI Incubator to a production environment.

## 🐳 Docker Architecture

We use a multi-container setup:

1.  **atlas-backend**: NestJS API (Node 20 Alpine).
2.  **atlas-frontend**: React Static Assets served via Nginx (Alpine).
3.  **postgres**: Production database (managed externally recommended, but container provided).

## 1. Prerequisites

- A Virtual Private Server (VPS) (e.g., AWS EC2, DigitalOcean Droplet) with Docker and Docker Compose installed.
- OR a PaaS provider (Render, Railway) capable of building from `Dockerfile`.
- A Google Gemini API Key.
- A Stripe Secret Key (for payments).

## 2. Environment Variables

On your production server, create a `.env` file with the following (do NOT commit this to Git):

```env
# App Config
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com

# Database (Use a managed DB for production safety, e.g. RDS/Supabase)
DATABASE_URL=postgresql://user:pass@host:5432/db_name

# Secrets
API_KEY=your_gemini_key
JWT_SECRET=strong_random_string_generated_via_openssl

# Payment
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

## 3. Deploying with Docker Compose

1.  **Transfer Files**: Copy the project files to your server.
2.  **Build & Run**:
    ```bash
    docker-compose -f docker-compose.prod.yml up --build -d
    ```
3.  **Run Migrations**:
    ```bash
    docker-compose -f docker-compose.prod.yml exec atlas-backend npx prisma migrate deploy
    ```

## 4. Nginx Reverse Proxy (Recommended)

In a production environment, you should run a host-level Nginx or Traefik to handle SSL termination (Let's Encrypt) and route traffic:

- `your-domain.com` -> `localhost:80` (Frontend Container)
- `api.your-domain.com` -> `localhost:3000` (Backend Container)

## 5. Health Checks

The backend exposes a health check endpoint for load balancers:
`GET /health`

If the response is `{ "status": "ok", ... }`, the service and database are operational.
