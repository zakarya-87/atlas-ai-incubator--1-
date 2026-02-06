# ATLAS AI Incubator - Docker Build and Azure Deployment Guide

This guide explains how to build Docker images for the ATLAS AI Incubator frontend and backend, and deploy them to Azure Container Instances.

## Prerequisites

1. **Docker Desktop** installed and running
2. **Azure CLI** installed
3. **Node.js** and **npm** for local development
4. An **Azure subscription**

## Building Docker Images

### Frontend Image

```bash
# Navigate to the project root directory
cd C:\Users\zboud\ATLAS AI Incubator

# Build the frontend image
# IMPORTANT: You MUST provide the VITE_BACKEND_URL build argument!
docker build -t atlas-frontend --build-arg VITE_BACKEND_URL=https://atlas-ai-backend-app.azurewebsites.net .

# Tag for Azure Container Registry (if needed)
docker tag atlas-frontend your-acr-name.azurecr.io/atlas-frontend:v1.0.0
```

### Backend Image

```bash
# Navigate to the backend directory
cd C:\Users\zboud\ATLAS AI Incubator\backend

# Build the backend image
docker build -t atlas-backend .

# Tag for Azure Container Registry (if needed)
docker tag atlas-backend your-acr-name.azurecr.io/atlas-backend:v1.0.0
```

## Testing Locally

Before deploying to Azure, test your images locally:

```bash
# Run with docker-compose
docker-compose -f docker-compose.azure.yml up --build
```

## Deploying to Azure Container Instances

### Option 1: Using the Provided Scripts

#### On Windows (PowerShell):
```powershell
.\deploy-to-azure.ps1
```

#### On Linux/macOS (Bash):
```bash
chmod +x deploy-to-azure.sh
./deploy-to-azure.sh
```

### Option 2: Manual Deployment Steps

1. **Login to Azure:**
```bash
az login
```

2. **Create a Resource Group:**
```bash
az group create --name atlas-ai-rg --location eastus
```

3. **Push Images to Container Registry (if using ACR):**
```bash
# Login to your Azure Container Registry
az acr login --name your-acr-name

# Push images
docker push your-acr-name.azurecr.io/atlas-frontend:v1.0.0
docker push your-acr-name.azurecr.io/atlas-backend:v1.0.0
```

4. **Deploy Using ARM Template:**
```bash
az deployment group create \
    --resource-group atlas-ai-rg \
    --template-file "./aci-deployment-template.json" \
    --parameters containerGroupName="atlas-ai-container-group" \
    --parameters frontendImage="atlas-frontend:latest" \
    --parameters backendImage="atlas-backend:latest" \
    --parameters databaseUrl="your_database_url_here" \
    --parameters jwtSecret="your_jwt_secret_here" \
    --parameters apiKey="your_api_key_here"
```

## Architecture Overview

The deployment consists of:
- **Frontend**: React application served by Nginx
- **Backend**: NestJS API server
- **PostgreSQL**: Database for persistent storage
- **Redis**: Caching and session storage (Note: For production, consider Azure Cache for Redis)

## Environment Variables

The application expects the following environment variables:

### Backend:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token signing
- `API_KEY`: Application API key
- `NODE_ENV`: Environment (production/development)
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port

### Frontend:
- `VITE_BACKEND_URL`: URL of the backend API

## Security Considerations

1. Store sensitive information (API keys, database passwords) in Azure Key Vault
2. Use Azure Container Registry with private access
3. Enable HTTPS for production deployments
4. Regularly update base images to patch security vulnerabilities

## Scaling Considerations

For production deployments, consider:
- Using Azure Container Apps instead of ACI for auto-scaling
- Setting up Azure Load Balancer for traffic distribution
- Using Azure Cache for Redis instead of a containerized Redis
- Implementing proper logging and monitoring with Azure Monitor

## Troubleshooting

### Common Issues:

1. **Docker build fails**: Ensure Docker Desktop is running and you have sufficient disk space
2. **ACI deployment fails**: Check that all required environment variables are provided
3. **Application not accessible**: Verify firewall rules and security groups allow traffic on required ports

### Useful Commands:

```bash
# View container logs
az container logs --resource-group atlas-ai-rg --name atlas-ai-container-group --container-name atlas-backend

# Restart container group
az container restart --resource-group atlas-ai-rg --name atlas-ai-container-group

# List container groups
az container list --resource-group atlas-ai-rg
```