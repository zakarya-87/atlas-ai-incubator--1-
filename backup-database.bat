@echo off
setlocal EnableDelayedExpansion

REM Database Backup Script for ATLAS AI Incubator
REM Backs up PostgreSQL and Redis data

set "BACKUP_DIR=%~dp0backups"
set "TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "TIMESTAMP=!TIMESTAMP: =0!"

echo ========================================
echo ATLAS AI Database Backup
echo ========================================
echo.

REM Create backup directory
if not exist "%BACKUP_DIR%" (
    echo [1/4] Creating backup directory...
    mkdir "%BACKUP_DIR%"
) else (
    echo [1/4] Backup directory exists
)
echo.

REM Check if containers are running
echo [2/4] Checking containers...
docker ps | findstr "postgres" >nul
if errorlevel 1 (
    echo [ERROR] PostgreSQL container not running!
    echo Please start the app first: docker compose up -d
    pause
    exit /b 1
)

docker ps | findstr "redis" >nul
if errorlevel 1 (
    echo [WARNING] Redis container not running, skipping Redis backup
    set "SKIP_REDIS=1"
) else (
    echo [OK] Containers are running
)
echo.

REM Backup PostgreSQL
echo [3/4] Backing up PostgreSQL database...
echo   - Exporting database to SQL file...

docker exec atlasaiincubator-postgres-1 pg_dump -U atlas_user -d atlas_db --no-owner --no-acl > "%BACKUP_DIR%\atlas_db_backup_!TIMESTAMP!.sql"

if errorlevel 1 (
    echo [ERROR] PostgreSQL backup failed!
    pause
    exit /b 1
)

echo   - Compressing backup...
certutil -encode "%BACKUP_DIR%\atlas_db_backup_!TIMESTAMP!.sql" "%BACKUP_DIR%\atlas_db_backup_!TIMESTAMP!.sql.b64" >nul 2>&1

echo [OK] PostgreSQL backup created
echo   File: %BACKUP_DIR%\atlas_db_backup_!TIMESTAMP!.sql
echo.

REM Backup Redis (if running)
if not defined SKIP_REDIS (
    echo [4/4] Backing up Redis data...
    
    REM Trigger Redis BGSAVE
    docker exec atlasaiincubator-redis-1 redis-cli BGSAVE >nul 2>&1
    
    REM Wait for save to complete
    timeout /t 2 /nobreak >nul
    
    REM Copy dump.rdb from container
    docker cp atlasaiincubator-redis-1:/data/dump.rdb "%BACKUP_DIR%\redis_backup_!TIMESTAMP!.rdb"
    
    if errorlevel 1 (
        echo [WARNING] Redis backup failed, but PostgreSQL backup succeeded
    ) else (
        echo [OK] Redis backup created
        echo   File: %BACKUP_DIR%\redis_backup_!TIMESTAMP!.rdb
    )
) else (
    echo [4/4] Skipping Redis backup (container not running)
)

echo.
echo ========================================
echo [SUCCESS] Backup Complete!
echo ========================================
echo.
echo Backup files created:
echo   PostgreSQL: %BACKUP_DIR%\atlas_db_backup_!TIMESTAMP!.sql
echo.
if not defined SKIP_REDIS (
    echo   Redis: %BACKUP_DIR%\redis_backup_!TIMESTAMP!.rdb
    echo.
)
echo Backup location: %BACKUP_DIR%
echo.
echo To restore from backup:
echo   docker exec -i atlasaiincubator-postgres-1 psql -U atlas_user -d atlas_db ^< backup_file.sql
echo.
pause
