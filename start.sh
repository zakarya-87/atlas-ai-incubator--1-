#!/bin/bash

echo "========================================"
echo "ATLAS AI Incubator - Starting Services"
echo "========================================"

# Kill any leftover processes on our ports
echo "Cleaning up stale processes..."
fuser -k 5000/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
sleep 1

# Start Redis in the background
echo "Starting Redis..."
redis-server --daemonize yes --loglevel warning
sleep 1
echo "Redis started"

# Run Prisma migrations
echo "Running database migrations..."
cd backend
npx prisma generate 2>&1 | tail -3
npx prisma migrate deploy 2>&1 | tail -5

# Start NestJS backend in background
echo "Starting backend on port 3000..."
npm run start:dev &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready before starting frontend
echo "Waiting for backend to be ready..."
for i in $(seq 1 30); do
  if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "Backend is ready!"
    break
  fi
  sleep 2
done

# Start Vite frontend on port 5000
echo "Starting frontend on port 5000..."
npm run dev

# On exit, kill backend
kill $BACKEND_PID 2>/dev/null
