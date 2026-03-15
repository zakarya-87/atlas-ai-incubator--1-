# ========================================
# Backend: NestJS + TypeScript + Prisma
# Multi-stage build optimized for production
# ========================================

# Stage 1: Build dependencies and app
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies (python3, make, g++ needed for some npm packages)
RUN for i in 1 2 3 4 5; do apk add --no-cache python3 make g++ git && break || sleep 5; done

# Set UTF-8 encoding to fix Prisma Unicode issues
ENV PYTHONIOENCODING=utf-8 \
    LC_ALL=C.UTF-8 \
    LANG=C.UTF-8

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev) for build
RUN npm config set fetch-timeout 120000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 5000 && \
    npm config set fetch-retry-maxtimeout 60000 && \
    npm config set progress false && \
    npm config set audit false && \
    npm config set fund false && \
    npm ci --legacy-peer-deps --no-audit --no-fund && \
    npm install --save @nestjs/throttler --legacy-peer-deps --no-audit --no-fund

# Copy Prisma schema and source
COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json nest-cli.json ./

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine AS production

WORKDIR /app

# Install runtime system dependencies only
# Chromium for PDF generation (puppeteer), curl for health checks, postgresql-client for db checks
RUN for i in 1 2 3 4 5; do apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    curl \
    postgresql-client && break || sleep 5; done && \
    rm -rf /var/cache/apk/*

# Configure Puppeteer to use system Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    mkdir -p /app && \
    chown -R nodejs:nodejs /app

# Copy pruned node_modules and built app from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Copy package files (needed for npm to work properly)
COPY --chown=nodejs:nodejs package*.json ./

# Copy startup script if it exists
COPY --chown=nodejs:nodejs startup.sh* ./
RUN if [ -f startup.sh ]; then chmod +x startup.sh; fi

USER nodejs

EXPOSE 3000
EXPOSE 5555

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["node", "dist/main"]
