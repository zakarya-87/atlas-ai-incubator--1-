#!/bin/bash
# Azure Container Instance Deployment Script for ATLAS AI Incubator

set -e  # Exit on any error

echo "========================================="
echo "ATLAS AI Incubator - Azure Deployment"
echo "========================================="

# Configuration
SUBSCRIPTION_ID="5689f64a-dd95-4134-b15e-5a9cd0d59779"
RESOURCE_GROUP="atlas-ai-rg"
LOCATION="eastus"
CONTAINER_GROUP_NAME="atlas-ai-container-group"
REGISTRY_NAME="atlasairegistry"  # Main registry for eastus
FRONTEND_IMAGE="atlas-frontend:latest"
BACKEND_IMAGE="atlas-backend:latest"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "Azure CLI is not installed. Please install it first."
    echo "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Login to Azure (optional - you might already be logged in)
echo "Checking Azure login status..."
az account set --subscription "$SUBSCRIPTION_ID" 2>/dev/null || {
    echo "Initiating login..."
    az login
    az account set --subscription "$SUBSCRIPTION_ID"
}

# Get subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "Using subscription: $SUBSCRIPTION_ID"

# Create resource group if it doesn't exist
echo "Creating resource group: $RESOURCE_GROUP"
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --tags Project=ATLAS-AI-Incubator

# Prompt for sensitive information
echo "Please provide the following sensitive information:"
read -s -p "Database URL: " DATABASE_URL
echo
read -s -p "JWT Secret: " JWT_SECRET
echo
read -s -p "API Key: " API_KEY
echo

# Deploy the container group using ARM template
echo "Deploying container group..."
az deployment group create \
    --resource-group "$RESOURCE_GROUP" \
    --template-file "./aci-deployment-template.json" \
    --parameters containerGroupName="$CONTAINER_GROUP_NAME" \
    --parameters frontendImage="$FRONTEND_IMAGE" \
    --parameters backendImage="$BACKEND_IMAGE" \
    --parameters databaseUrl="$DATABASE_URL" \
    --parameters jwtSecret="$JWT_SECRET" \
    --parameters apiKey="$API_KEY"

echo "Deployment completed successfully!"
echo "Access your application at the IP address shown in the output."

# Show the public IP
FRONTEND_IP=$(az container show --resource-group "$RESOURCE_GROUP" --name "$CONTAINER_GROUP_NAME" --query ipAddress.ip --output tsv)
echo "Frontend is accessible at: http://$FRONTEND_IP"