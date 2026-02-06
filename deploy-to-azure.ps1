# PowerShell Script for Building and Deploying ATLAS AI Incubator to Azure Container Instances

Write-Host "=========================================" -ForegroundColor Green
Write-Host "ATLAS AI Incubator - Azure Deployment" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Configuration
$RESOURCE_GROUP = "atlas-ai-rg"
$LOCATION = "eastus"
$CONTAINER_GROUP_NAME = "atlas-ai-container-group"
$FRONTEND_IMAGE = "atlas-frontend:latest"
$BACKEND_IMAGE = "atlas-backend:latest"

# Check if Azure CLI is installed
if (!(Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Host "Azure CLI is not installed. Please install it first." -ForegroundColor Red
    Write-Host "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Red
    exit 1
}

# Login to Azure (optional - you might already be logged in)
Write-Host "Checking Azure login status..." -ForegroundColor Yellow
try {
    $account = az account show --output json | ConvertFrom-Json
    Write-Host "Logged in as: $($account.user.name)" -ForegroundColor Green
} catch {
    Write-Host "You are not logged in to Azure. Initiating login..." -ForegroundColor Yellow
    az login
}

# Get subscription ID
$SUBSCRIPTION_ID = $(az account show --query id -o tsv)
Write-Host "Using subscription: $SUBSCRIPTION_ID" -ForegroundColor Cyan

# Create resource group if it doesn't exist
Write-Host "Creating resource group: $RESOURCE_GROUP" -ForegroundColor Yellow
az group create --name $RESOURCE_GROUP --location $LOCATION --tags Project=ATLAS-AI-Incubator

# Prompt for sensitive information
Write-Host "Please provide the following sensitive information:" -ForegroundColor Yellow
$DATABASE_URL = Read-Host -Prompt "Database URL (hidden)" -AsSecureString
$JWT_SECRET = Read-Host -Prompt "JWT Secret (hidden)" -AsSecureString
$API_KEY = Read-Host -Prompt "API Key (hidden)" -AsSecureString

# Convert secure strings to plain text for az command
$BSTR_DATABASE_URL = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DATABASE_URL)
$PLAIN_DATABASE_URL = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($BSTR_DATABASE_URL)

$BSTR_JWT_SECRET = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($JWT_SECRET)
$PLAIN_JWT_SECRET = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($BSTR_JWT_SECRET)

$BSTR_API_KEY = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($API_KEY)
$PLAIN_API_KEY = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($BSTR_API_KEY)

# Deploy the container group using ARM template
Write-Host "Deploying container group..." -ForegroundColor Yellow
az deployment group create `
    --resource-group $RESOURCE_GROUP `
    --template-file "./aci-deployment-template.json" `
    --parameters containerGroupName=$CONTAINER_GROUP_NAME `
    --parameters frontendImage=$FRONTEND_IMAGE `
    --parameters backendImage=$BACKEND_IMAGE `
    --parameters databaseUrl=$PLAIN_DATABASE_URL `
    --parameters jwtSecret=$PLAIN_JWT_SECRET `
    --parameters apiKey=$PLAIN_API_KEY

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Access your application at the IP address shown in the output." -ForegroundColor Green

# Show the public IP
$FRONTEND_IP = $(az container show --resource-group $RESOURCE_GROUP --name $CONTAINER_GROUP_NAME --query ipAddress.ip --output tsv)
Write-Host "Frontend is accessible at: http://$FRONTEND_IP" -ForegroundColor Cyan