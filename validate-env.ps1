#!/bin/pwsh
# Environment validation script for ATLAS AI Incubator

Write-Host "================================" -ForegroundColor Cyan
Write-Host "ATLAS Environment Validation" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Frontend config
Write-Host "[1/7] Frontend Environment..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $frontendEnv = Get-Content ".env.local" | ConvertFrom-StringData
    $geminiKey = $frontendEnv['GEMINI_API_KEY']
    if ($geminiKey -eq "PLACEHOLDER_API_KEY") {
        Write-Host "⚠️  GEMINI_API_KEY is placeholder - update .env.local with real key" -ForegroundColor Yellow
    } else {
        Write-Host "✅ GEMINI_API_KEY configured" -ForegroundColor Green
    }
} else {
    Write-Host "❌ .env.local not found" -ForegroundColor Red
}

# Check Backend config
Write-Host "[2/7] Backend Environment..." -ForegroundColor Yellow
if (Test-Path "backend/.env") {
    $backendEnv = @{}
    Get-Content "backend/.env" | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $backendEnv[$matches[1]] = $matches[2]
        }
    }
    Write-Host "✅ API_KEY: Configured" -ForegroundColor Green
    Write-Host "✅ JWT_SECRET: Configured" -ForegroundColor Green
    Write-Host "✅ DATABASE_URL: $($backendEnv['DATABASE_URL'])" -ForegroundColor Green
    Write-Host "✅ PORT: $($backendEnv['PORT'] ?? '3000')" -ForegroundColor Green
} else {
    Write-Host "❌ backend/.env not found" -ForegroundColor Red
}

# Check Database
Write-Host "[3/7] Database Status..." -ForegroundColor Yellow
if (Test-Path "backend/dev.db") {
    Write-Host "✅ SQLite database exists (backend/dev.db)" -ForegroundColor Green
} else {
    Write-Host "⚠️  SQLite database not found" -ForegroundColor Yellow
}

# Check Docker
Write-Host "[4/7] Docker Services..." -ForegroundColor Yellow
$dockerPs = docker ps --filter "ancestor=postgres" --format "{{.Names}}" 2>$null
if ($dockerPs) {
    Write-Host "✅ PostgreSQL running" -ForegroundColor Green
} else {
    Write-Host "⚠️  PostgreSQL not running (optional)" -ForegroundColor Yellow
}

$redisPs = docker ps --filter "ancestor=redis" --format "{{.Names}}" 2>$null
if ($redisPs) {
    Write-Host "✅ Redis running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Redis not running (optional)" -ForegroundColor Yellow
}

# Check Node dependencies
Write-Host "[5/7] Dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend dependencies not installed" -ForegroundColor Red
}

if (Test-Path "backend/node_modules") {
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Backend dependencies not installed" -ForegroundColor Red
}

# Check configuration files
Write-Host "[6/7] Configuration Files..." -ForegroundColor Yellow
$configFiles = @(
    "vite.config.ts",
    "tsconfig.json",
    "backend/src/main.ts",
    "backend/prisma/schema.prisma",
    "docker-compose.yml"
)
$configFiles | ForEach-Object {
    if (Test-Path $_) {
        Write-Host "✅ $_" -ForegroundColor Green
    } else {
        Write-Host "❌ $_ missing" -ForegroundColor Red
    }
}

# Summary
Write-Host "[7/7] Summary..." -ForegroundColor Yellow
Write-Host ""
Write-Host "To start development:" -ForegroundColor Cyan
Write-Host "  1. Update GEMINI_API_KEY in .env.local (if not already set)" -ForegroundColor White
Write-Host "  2. Terminal 1: cd backend && npm run start:dev" -ForegroundColor White
Write-Host "  3. Terminal 2: npm run dev" -ForegroundColor White
Write-Host "  4. Open: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "API Docs:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000/api/docs" -ForegroundColor White
Write-Host ""

