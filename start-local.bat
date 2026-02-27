@echo off
chcp 65001 >nul
REM Quick Start Script for Local Development
REM This runs the backend locally while keeping PostgreSQL in Docker

echo ========================================
echo ATLAS AI Incubator - Quick Local Start
echo ========================================
echo.

REM Check if Docker Desktop is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Desktop is not running!
    echo Please start Docker Desktop first, then run this script again.
    pause
    exit /b 1
)

echo [1/4] Starting PostgreSQL and Redis containers...
cd /d "%~dp0"
docker compose up postgres redis -d --wait 2>nul
if errorlevel 1 (
    echo [WARNING] Docker compose failed, but PostgreSQL might already be running...
)
echo.

echo [2/4] Checking PostgreSQL connection...
docker exec atlasaiincubator-postgres-1 pg_isready -U atlas_user -d atlas_db >nul 2>&1
if errorlevel 1 (
    echo [ERROR] PostgreSQL is not ready!
    echo Checking container status...
    docker ps --filter "name=postgres"
    pause
    exit /b 1
)
echo [OK] PostgreSQL is running
echo.

echo [3/4] Setting up Backend environment...
cd backend

REM Check if .env exists and contains correct DATABASE_URL
findstr /C:"postgresql://atlas_user:atlas_password@localhost:5432/atlas_db" .env >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Updating DATABASE_URL in .env...
    echo DATABASE_URL="postgresql://atlas_user:atlas_password@localhost:5432/atlas_db" > .env.new
    type .env >> .env.new 2>nul
    move /y .env.new .env >nul
)

echo [OK] Environment configured
echo.

echo [4/4] Starting Backend and Frontend...
echo.
echo Starting Backend on http://localhost:3000
echo Starting Frontend on http://localhost:5173
echo.
echo Press Ctrl+C in each window to stop
echo.

REM Start Backend in new window
start "ATLAS Backend" cmd /c "cd /d "%~dp0backend" && npm run start:dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend in new window  
start "ATLAS Frontend" cmd /c "cd /d "%~dp0" && npm run dev"

echo ========================================
echo Services started!
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo Database: localhost:5432
echo ========================================
echo.
echo Press any key to stop all services...
pause >nul

REM Stop processes (this won't work perfectly, but it's a start)
echo Stopping services...
taskkill /FI "WINDOWTITLE eq ATLAS Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq ATLAS Frontend*" /F >nul 2>&1

echo Done!
