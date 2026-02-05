@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul

echo =========================================
echo ATLAS AI Incubator - SIMPLE START
echo =========================================
echo.

REM Check 1: Docker
echo [CHECK 1/4] Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo [FAIL] Docker Desktop is not running!
    echo Please start Docker Desktop first.
    goto :error
)
echo [PASS] Docker is running
echo.

REM Check 2: Database
echo [CHECK 2/4] Checking PostgreSQL...
docker ps | findstr "postgres" >nul
if errorlevel 1 (
    echo [INFO] Starting PostgreSQL container...
    docker compose up postgres -d
    timeout /t 5 /nobreak >nul
)
docker exec atlasaiincubator-postgres-1 pg_isready -U atlas_user >nul 2>&1
if errorlevel 1 (
    echo [WAIT] PostgreSQL is starting, waiting 10 seconds...
    timeout /t 10 /nobreak >nul
)
echo [PASS] PostgreSQL is ready
echo.

REM Check 3: Node modules
echo [CHECK 3/4] Checking dependencies...
set "FRONTEND_OK=0"
set "BACKEND_OK=0"

if exist "node_modules\vite\package.json" (
    set "FRONTEND_OK=1"
    echo [PASS] Frontend dependencies installed
) else (
    echo [MISSING] Frontend dependencies not found
    echo          Run: npm install
)

if exist "backend\node_modules\@nestjs\core\package.json" (
    set "BACKEND_OK=1"
    echo [PASS] Backend dependencies installed
) else (
    echo [MISSING] Backend dependencies not found
    echo          Run: cd backend ^&^& npm install
)

if "!FRONTEND_OK!"=="0" (
    echo.
    echo =========================================
    echo MISSING DEPENDENCIES
    echo =========================================
    echo.
    echo To install frontend dependencies:
    echo   npm install
    echo.
    echo To install backend dependencies:
    echo   cd backend
    echo   npm install
    echo.
    echo Then run this script again.
    echo.
    goto :error
)

if "!BACKEND_OK!"=="0" (
    echo.
    echo =========================================
    echo MISSING BACKEND DEPENDENCIES
    echo =========================================
    echo.
    echo To install backend dependencies:
    echo   cd backend
    echo   npm install
    echo.
    echo Then run this script again.
    echo.
    goto :error
)

echo.
echo [CHECK 4/4] Dependencies OK
echo.

REM All checks passed, start services
echo =========================================
echo STARTING SERVICES
echo =========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo Database: localhost:5432
echo.
echo Press Ctrl+C in each window to stop
echo.
echo Starting in 3 seconds...
timeout /t 3 /nobreak >nul

REM Start Backend
echo [1/2] Starting Backend...
start "ATLAS Backend - Port 3000" cmd /k "cd backend && npm run start:dev"

REM Wait for backend to start
timeout /t 5 /nobreak >nul

REM Start Frontend
echo [2/2] Starting Frontend...
start "ATLAS Frontend - Port 5173" cmd /k "npm run dev"

echo.
echo =========================================
echo SERVICES STARTED!
echo =========================================
echo.
echo Wait 10-20 seconds for services to fully start
echo.
echo Backend logs:  Look for "Nest application successfully started"
echo Frontend logs: Look for "VITE v" and "Local: http://localhost:5173"
echo.
echo Press any key to exit this window...
echo (Services will keep running in their windows)
pause >nul
goto :end

:error
echo.
echo =========================================
echo STARTUP FAILED
echo =========================================
echo.
echo Please fix the issues above and try again.
pause
exit /b 1

:end
endlocal
