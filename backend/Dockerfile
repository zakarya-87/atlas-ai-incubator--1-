# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Configure npm for better network resilience and low concurrency
RUN npm config set fetch-timeout 600000 && \
    npm config set fetch-retries 10 && \
    npm config set fetch-retry-mintimeout 60000 && \
    npm config set fetch-retry-maxtimeout 300000 && \
    npm config set maxsockets 3 && \
    npm config set progress false && \
    npm config set audit false && \
    npm config set fund false && \
    npm config set registry https://registry.npmjs.org/

# Copy package files
COPY package*.json ./

# Install all dependencies with extra retries
RUN npm install --legacy-peer-deps || \
    (sleep 30 && npm install --legacy-peer-deps) || \
    (sleep 60 && npm install --legacy-peer-deps)

# Copy source and prisma configuration
COPY . .

# Generate Prisma client (prisma is in devDependencies)
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install curl for health checks and pg_isready for database checks
RUN apk add --no-cache postgresql-client curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Configure npm for better network resilience and low concurrency
RUN npm config set fetch-timeout 600000 && \
    npm config set fetch-retries 10 && \
    npm config set fetch-retry-mintimeout 60000 && \
    npm config set fetch-retry-maxtimeout 300000 && \
    npm config set maxsockets 3 && \
    npm config set progress false && \
    npm config set audit false && \
    npm config set fund false && \
    npm config set registry https://registry.npmjs.org/

# Copy package files
COPY package*.json ./

# Install production dependencies only with extra retries
RUN (npm install --omit=dev --legacy-peer-deps || \
    (sleep 60 && npm install --omit=dev --legacy-peer-deps) || \
    (sleep 120 && npm install --omit=dev --legacy-peer-deps))

# Copy build artifacts from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/prisma ./prisma

# Copy the startup script
COPY startup.sh ./startup.sh
RUN chmod +x ./startup.sh

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the application port
EXPOSE 3000

# Health check for the backend application
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["./startup.sh"]
