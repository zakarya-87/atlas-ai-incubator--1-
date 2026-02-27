# ========================================
# Frontend: React + Vite + TypeScript
# Multi-stage build optimized for production
# ========================================

# Stage 1: Build dependencies and application
FROM node:20-alpine AS dependencies

WORKDIR /app

# Install build tools (git required for some npm packages)
RUN apk add --no-cache git

# Copy package files
COPY package*.json ./

# Install dependencies (use npm ci if lock file exists, otherwise npm install)
RUN if [ -f package-lock.json ]; then npm ci --prefer-offline --no-audit; else npm install --prefer-offline --no-audit; fi

# Stage 2: Build application
FROM dependencies AS builder

WORKDIR /app

# Copy all source files and configurations
COPY tsconfig.json eslint.config.js vite.config.ts env.d.ts types.ts ./
COPY index.html ./

# Copy directory structure
COPY public ./public
COPY components ./components
COPY context ./context
COPY hooks ./hooks
COPY services ./services
COPY locales ./locales
COPY utils ./utils

# Copy entry files
COPY App.tsx App.test.tsx index.tsx ./

# Build application with Vite
ARG VITE_BACKEND_URL=http://localhost:3000
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN npm run build && \
    npm cache clean --force

# Stage 3: Production runtime with nginx
FROM nginx:1.27-alpine AS production

# Install curl for health checks (minimal layer)
RUN apk add --no-cache curl && \
    rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S -u 1001 -G nginx-user nginx-user && \
    mkdir -p /var/run/nginx && \
    chown -R nginx-user:nginx-user /var/run/nginx

# Copy built assets from builder stage
COPY --from=builder --chown=nginx-user:nginx-user /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY --chown=nginx-user:nginx-user nginx.conf /etc/nginx/conf.d/default.conf

# Fix nginx cache and log directory permissions
RUN chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx-user:nginx-user /var/run/nginx.pid

# Set nginx to run without privileges
RUN chmod g+rwx /var/cache/nginx /var/run /var/log/nginx

# Switch to non-root user
USER nginx-user

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/ || exit 1

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
