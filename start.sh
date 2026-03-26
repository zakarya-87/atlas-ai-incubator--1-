#!/bin/bash

echo "========================================"
echo "ATLAS AI Incubator - Starting Services"
echo "========================================"

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
cd ..

# Start NestJS backend in background
echo "Starting backend on port 3000..."
cd backend
npm run start:dev &
BACKEND_PID=$!
cd ..

# Give backend a moment to initialize before starting frontend
sleep 3

# Start Vite frontend on port 5000
echo "Starting frontend on port 5000..."
npm run dev

# On exit, kill backend
kill $BACKEND_PID 2>/dev/null
