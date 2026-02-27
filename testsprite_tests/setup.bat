@echo off
REM TestSprite MCP Server Setup Script for ATLAS AI Incubator
REM This script validates and configures the TestSprite MCP server

echo ============================================
echo TestSprite MCP Server Setup
echo ATLAS AI Incubator
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js 22 or higher from: https://nodejs.org/
    exit /b 1
)

echo [OK] Node.js found
for /f "tokens=*" %%a in ('node --version') do set NODE_VERSION=%%a
echo        Version: %NODE_VERSION%
echo.

REM Check if npx is available
npx --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npx is not available
    echo Please update npm: npm install -g npm@latest
    exit /b 1
)

echo [OK] npx available
echo.

REM Test if TestSprite MCP server can be reached
echo [INFO] Checking TestSprite MCP server availability...
npx @testsprite/testsprite-mcp@latest --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] Cannot verify TestSprite MCP server yet
    echo        This is normal if you haven't installed it before
) else (
    echo [OK] TestSprite MCP server package available
)
echo.

REM Check API key
echo [INFO] Checking API key configuration...
if defined TESTSPRITE_API_KEY (
    echo [OK] TESTSPRITE_API_KEY is set
    echo        Key: %TESTSPRITE_API_KEY:~0,10%...
) else (
    echo [WARN] TESTSPRITE_API_KEY is not set
    echo.
    echo To get your API key:
    echo   1. Visit: https://www.testsprite.com/dashboard
    echo   2. Sign in or create an account
    echo   3. Navigate to Settings ^> API Keys
    echo   4. Generate a new API key
    echo.
    echo To set the API key:
    echo   set TESTSPRITE_API_KEY=your_api_key_here
    echo.
)

REM Validate MCP config
echo [INFO] Validating MCP configuration...
if exist "..\.mcpconfig.json" (
    echo [OK] .mcpconfig.json found
    
    REM Check if TestSprite is configured
    findstr /C:"testsprite" "..\.mcpconfig.json" >nul
    if %errorlevel% equ 0 (
        echo [OK] TestSprite MCP server configured
    ) else (
        echo [WARN] TestSprite not found in .mcpconfig.json
        echo        Please run: node testsprite_install.js
    )
) else (
    echo [WARN] .mcpconfig.json not found in parent directory
)
echo.

REM Check Python test files
echo [INFO] Checking test files...
set TEST_COUNT=0
for %%f in (TC*.py) do (
    set /a TEST_COUNT+=1
)
echo [OK] Found %TEST_COUNT% test files
echo.

REM Run validation
echo [INFO] Running test validation...
python testsprite_runner.py --validate
if %errorlevel% neq 0 (
    echo.
    echo [WARN] Validation failed - see messages above
)
echo.

echo ============================================
echo Setup Check Complete
echo ============================================
echo.
echo Next steps:
echo   1. Set your API key: set TESTSPRITE_API_KEY=your_key
echo   2. Run tests: python testsprite_runner.py
echo   3. View reports in: testsprite_tests\reports\
echo.
echo For help: python testsprite_runner.py --help
echo.

pause
