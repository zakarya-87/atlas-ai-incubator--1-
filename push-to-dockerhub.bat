@echo off
setlocal EnableDelayedExpansion

REM Docker Hub Push Script for ATLAS AI Incubator (Windows)
REM Usage: push-to-dockerhub.bat <your-dockerhub-username>

echo ========================================
echo Docker Hub Push Script
echo ========================================
echo.

REM Check if username is provided
if "%~1"=="" (
    echo [ERROR] Docker Hub username required
    echo.
    echo Usage:
    echo   push-to-dockerhub.bat ^<your-dockerhub-username^>
    echo.
    echo Example:
    echo   push-to-dockerhub.bat johndoe
    echo.
    pause
    exit /b 1
)

set "DOCKER_USERNAME=%~1"
set "IMAGE_TAG=latest"

echo Username: !DOCKER_USERNAME!
echo Tag: !IMAGE_TAG!
echo.

REM Check if user is logged in
echo [1/4] Checking Docker Hub login status...
docker info 2>nul | findstr "Username" >nul
if errorlevel 1 (
    echo [ERROR] Not logged into Docker Hub
    echo.
    echo Please login first:
    echo   docker login
    echo.
    pause
    exit /b 1
)

echo [OK] Logged into Docker Hub
echo.

REM Tag images
echo [2/4] Tagging images...

echo   - Tagging frontend...
docker tag atlasaiincubator-atlas-frontend:latest !DOCKER_USERNAME!/atlas-frontend:!IMAGE_TAG!
if errorlevel 1 (
    echo [ERROR] Failed to tag frontend
    pause
    exit /b 1
)

echo   - Tagging backend...
docker tag atlasaiincubator-atlas-backend:latest !DOCKER_USERNAME!/atlas-backend:!IMAGE_TAG!
if errorlevel 1 (
    echo [ERROR] Failed to tag backend
    pause
    exit /b 1
)

echo [OK] Images tagged successfully
echo.

REM Push images
echo [3/4] Pushing images to Docker Hub...
echo.

echo   - Pushing frontend...
docker push !DOCKER_USERNAME!/atlas-frontend:!IMAGE_TAG!
if errorlevel 1 (
    echo [ERROR] Failed to push frontend
    pause
    exit /b 1
)

echo.
echo   - Pushing backend...
docker push !DOCKER_USERNAME!/atlas-backend:!IMAGE_TAG!
if errorlevel 1 (
    echo [ERROR] Failed to push backend
    pause
    exit /b 1
)

echo.
echo ========================================
echo [SUCCESS] All images pushed!
echo ========================================
echo.
echo Your images on Docker Hub:
echo   - !DOCKER_USERNAME!/atlas-frontend:!IMAGE_TAG!
echo   - !DOCKER_USERNAME!/atlas-backend:!IMAGE_TAG!
echo.
echo.
pause
