@echo off
echo ============================================
echo TestSprite MCP Full Test Suite Execution
echo ATLAS AI Incubator
echo ============================================
echo.

setlocal EnableDelayedExpansion

REM Change to tests directory
cd /d "%~dp0"

REM Initialize counters
set TOTAL_TESTS=0
set PASSED_TESTS=0
set FAILED_TESTS=0

echo [INFO] Starting full test suite execution...
echo.

REM Define test categories
set CATEGORIES=core edge_cases error_handling security performance regression

REM Run tests for each category
for %%C in (%CATEGORIES%) do (
    echo ============================================
    echo Running: %%C tests
    echo ============================================
    
    python testsprite_runner.py --category %%C --report-format json
    
    if !ERRORLEVEL! equ 0 (
        echo [PASS] %%C tests completed successfully
        set /a PASSED_TESTS+=1
    ) else (
        echo [FAIL] %%C tests failed
        set /a FAILED_TESTS+=1
    )
    
    set /a TOTAL_TESTS+=1
    echo.
)

echo ============================================
echo Test Suite Summary
echo ============================================
echo Total Categories: %TOTAL_TESTS%
echo Passed: %PASSED_TESTS%
echo Failed: %FAILED_TESTS%
echo.

if %FAILED_TESTS% equ 0 (
    echo [SUCCESS] All test suites passed! ✅
    exit /b 0
) else (
    echo [FAILURE] %FAILED_TESTS% test suite(s) failed ❌
    exit /b 1
)
