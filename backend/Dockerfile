# Production Dockerfile - Optimized for reliability
# Uses two-stage build but with optimizations for faster builds

FROM node:20-alpine AS build

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (single attempt with reasonable timeout)
RUN npm config set fetch-timeout 120000 && \
    npm config set fetch-retries 2 && \
    npm config set progress false && \
    npm config set audit false && \
    npm config set fund false && \
    npm install --legacy-peer-deps --no-audit --no-fund

# Copy source and prisma configuration
COPY . ./

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage - Copy only what's needed
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache postgresql-client curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files and install production deps
COPY package*.json ./
RUN npm config set fetch-timeout 120000 && \
    npm config set progress false && \
    npm config set audit false && \
    npm config set fund false && \
    npm install --omit=dev --legacy-peer-deps --no-audit --no-fund

# Copy build artifacts
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/prisma ./prisma

# Copy startup script
COPY startup.sh ./startup.sh
RUN chmod +x ./startup.sh && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["./startup.sh"]
