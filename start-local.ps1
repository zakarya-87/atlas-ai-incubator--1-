#!/usr/bin/env pwsh
# Quick Start Script for ATLAS AI Incubator - Local Development
# This runs the backend locally while keeping PostgreSQL in Docker

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ATLAS AI Incubator - Quick Local Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker Desktop is running
try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
} catch {
    Write-Host "[ERROR] Docker Desktop is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop first, then run this script again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 1: Start PostgreSQL and Redis containers
Write-Host "[1/4] Starting PostgreSQL and Redis containers..." -ForegroundColor Green
try {
    docker compose up postgres redis -d 2>&1 | Out-Null
    Write-Host "[OK] Containers started" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] Docker compose had issues, but PostgreSQL might already be running..." -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Wait for PostgreSQL to be ready
Write-Host "[2/4] Waiting for PostgreSQL..." -ForegroundColor Green
$maxAttempts = 30
$attempt = 0
$postgresReady = $false

while ($attempt -lt $maxAttempts -and -not $postgresReady) {
    $attempt++
    try {
        $result = docker exec atlasaiincubator-postgres-1 pg_isready -U atlas_user -d atlas_db 2>&1
        if ($result -match "accepting connections") {
            $postgresReady = $true
        }
    } catch {
        # Container might not exist yet
    }
    
    if (-not $postgresReady) {
        Write-Host "  Attempt ${attempt}/${maxAttempts}: PostgreSQL not ready yet..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if (-not $postgresReady) {
    Write-Host "[ERROR] PostgreSQL failed to start!" -ForegroundColor Red
    docker ps --filter "name=postgres"
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[OK] PostgreSQL is ready" -ForegroundColor Green
Write-Host ""

# Step 3: Configure Backend
Write-Host "[3/4] Configuring Backend environment..." -ForegroundColor Green
$projectRoot = $PSScriptRoot
$backendDir = Join-Path $projectRoot "backend"
$envFile = Join-Path $backendDir ".env"

if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -notmatch "postgresql://atlas_user:atlas_password@localhost:5432/atlas_db") {
        Write-Host "[INFO] Updating DATABASE_URL in .env..." -ForegroundColor Yellow
        $newEnv = "DATABASE_URL=`"postgresql://atlas_user:atlas_password@localhost:5432/atlas_db`"" + "`n" + $envContent
        Set-Content -Path $envFile -Value $newEnv
    }
}
Write-Host "[OK] Environment configured" -ForegroundColor Green
Write-Host ""

# Step 4: Start services
Write-Host "[4/4] Starting services..." -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting services:" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Database: localhost:5432" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend
$backendJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    npm run start:dev 2>&1
} -ArgumentList $backendDir

# Wait for backend to initialize
Start-Sleep -Seconds 5

# Start Frontend
$frontendJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    npm run dev 2>&1
} -ArgumentList $projectRoot

Write-Host "Services are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Monitor logs
try {
    while ($true) {
        $backendOutput = Receive-Job $backendJob -ErrorAction SilentlyContinue
        $frontendOutput = Receive-Job $frontendJob -ErrorAction SilentlyContinue
        
        if ($backendOutput) {
            Write-Host "[BACKEND] $backendOutput" -ForegroundColor Blue
        }
        if ($frontendOutput) {
            Write-Host "[FRONTEND] $frontendOutput" -ForegroundColor Magenta
        }
        
        if ($backendJob.State -eq "Failed") {
            Write-Host "[ERROR] Backend failed to start!" -ForegroundColor Red
            break
        }
        if ($frontendJob.State -eq "Failed") {
            Write-Host "[ERROR] Frontend failed to start!" -ForegroundColor Red
            break
        }
        
        Start-Sleep -Milliseconds 100
    }
} finally {
    # Cleanup
    Write-Host "`nStopping services..." -ForegroundColor Yellow
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    Write-Host "Done!" -ForegroundColor Green
}
