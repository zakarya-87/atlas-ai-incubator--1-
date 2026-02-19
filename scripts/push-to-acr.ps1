# Push Docker Images to Azure Container Registry

$ACR_NAME = "atlasairegistry"
$ACR_LOGIN_SERVER = "$ACR_NAME.azurecr.io"

# Check if Azure CLI is installed
if (!(Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Host "Azure CLI is not installed." -ForegroundColor Red
    exit 1
}

# Login to Azure if needed
Write-Host "Checking Azure login..." -ForegroundColor Yellow
$account = az account show --output json | ConvertFrom-Json
if (!$account) {
    az login
}

# Login to ACR
Write-Host "Logging in to ACR ($ACR_NAME)..." -ForegroundColor Yellow
az acr login --name $ACR_NAME

# Tag and Push Frontend
Write-Host "Tagging and Pushing Frontend..." -ForegroundColor Cyan
docker tag atlas-frontend:latest "$ACR_LOGIN_SERVER/atlas-frontend:latest"
docker push "$ACR_LOGIN_SERVER/atlas-frontend:latest"

# Tag and Push Backend
Write-Host "Tagging and Pushing Backend..." -ForegroundColor Cyan
docker tag atlas-backend:latest "$ACR_LOGIN_SERVER/atlas-backend:latest"
docker push "$ACR_LOGIN_SERVER/atlas-backend:latest"

Write-Host "Done!" -ForegroundColor Green
