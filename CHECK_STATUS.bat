@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
cls
echo =========================================
echo ATLAS AI - QUICK DIAGNOSTIC
echo =========================================
echo.

set "ALL_GOOD=1"

REM Check Docker
echo [1/6] Docker Desktop..........
docker info >nul 2>&1
if errorlevel 1 (
    echo     [FAIL] Not running
    set "ALL_GOOD=0"
) else (
    echo     [OK] Running
)

REM Check PostgreSQL
echo [2/6] PostgreSQL Container....
docker ps | findstr "postgres" >nul
if errorlevel 1 (
    echo     [MISSING] Not running
    echo            Run: docker compose up postgres -d
) else (
    docker exec atlasaiincubator-postgres-1 pg_isready >nul 2>&1
    if errorlevel 1 (
        echo     [WAIT] Starting up...
    ) else (
        echo     [OK] Running on port 5432
    )
)

REM Check Backend Dependencies
echo [3/6] Backend Dependencies....
if exist "backend\node_modules\@nestjs\core\package.json" (
    echo     [OK] Installed
) else (
    echo     [MISSING] Need: cd backend ^&^& npm install
    set "ALL_GOOD=0"
)

REM Check Frontend Dependencies
echo [4/6] Frontend Dependencies...
if exist "node_modules\vite\package.json" (
    echo     [OK] Installed
) else (
    echo     [MISSING] Need: npm install
    set "ALL_GOOD=0"
)

REM Check Backend Port
echo [5/6] Backend Service.........
netstat -an | findstr ":3000" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo     [STOPPED] Not running on port 3000
) else (
    echo     [OK] Running on port 3000
)

REM Check Frontend Port
echo [6/6] Frontend Service........
netstat -an | findstr ":5173" | findstr "LISTENING" >nul
if errorlevel 1 (
    echo     [STOPPED] Not running on port 5173
) else (
    echo     [OK] Running on port 5173
)

echo.
echo =========================================

if "!ALL_GOOD!"=="1" (
    echo [READY] All systems go! 
    echo.
    echo Run START_SIMPLE.bat to start the app
    echo.
) else (
    echo [ACTION NEEDED] 
    echo.
    echo Missing items marked above ^^!
    echo See START_HERE.md for instructions
    echo.
)

echo =========================================
echo.
pause
