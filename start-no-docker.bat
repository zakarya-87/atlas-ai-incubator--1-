@echo off
chcp 65001 >nul
REM Start Script for Running App Without Docker Containers
REM NOTE: This requires PostgreSQL and Redis to be running locally

echo ========================================
echo ATLAS AI Incubator - Pure Local Start
echo ========================================
echo.

echo This script runs the app WITHOUT Docker.
echo.
echo Prerequisites:
echo   1. PostgreSQL installed and running on localhost:5432
echo   2. Redis installed and running on localhost:6379
echo   3. Database 'atlas_db' created with user 'atlas_user'
echo.
echo If you don't have these installed, use start-local.bat instead
echo which runs PostgreSQL and Redis in Docker containers.
echo.
pause

cd /d "%~dp0"

echo [1/3] Installing dependencies...
echo.

REM Check and install root dependencies
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Frontend dependency installation failed!
        pause
        exit /b 1
    )
)

REM Check and install backend dependencies
cd backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Backend dependency installation failed!
        pause
        exit /b 1
    )
)
cd ..

echo [OK] Dependencies installed
echo.

echo [2/3] Generating Prisma Client...
cd backend
call npx prisma generate
if errorlevel 1 (
    echo [WARNING] Prisma generate failed, but continuing...
)
cd ..
echo.

echo [3/3] Starting Backend and Frontend...
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
echo ========================================
echo.
echo Close this window or press Ctrl+C to exit
echo (Note: Backend and Frontend will keep running in separate windows)
echo.
pause
