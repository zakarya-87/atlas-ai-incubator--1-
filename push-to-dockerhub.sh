#!/bin/bash

# Docker Hub Push Script for ATLAS AI Incubator
# Usage: ./push-to-dockerhub.sh <your-dockerhub-username>

set -e

# Check if username is provided
if [ -z "$1" ]; then
    echo "❌ Error: Docker Hub username required"
    echo ""
    echo "Usage:"
    echo "  ./push-to-dockerhub.sh <your-dockerhub-username>"
    echo ""
    echo "Example:"
    echo "  ./push-to-dockerhub.sh johndoe"
    echo ""
    exit 1
fi

DOCKER_USERNAME=$1
IMAGE_TAG="latest"

echo "🐳 Docker Hub Push Script"
echo "=========================="
echo "Username: $DOCKER_USERNAME"
echo "Tag: $IMAGE_TAG"
echo ""

# Check if user is logged in
echo "🔍 Checking Docker Hub login status..."
if ! docker info | grep -q "Username"; then
    echo "❌ Not logged into Docker Hub"
    echo ""
    echo "Please login first:"
    echo "  docker login"
    echo ""
    exit 1
fi

echo "✅ Logged into Docker Hub"
echo ""

# Tag images
echo "🏷️  Tagging images..."

echo "  → Tagging frontend..."
docker tag atlasaiincubator-atlas-frontend:latest $DOCKER_USERNAME/atlas-frontend:$IMAGE_TAG

echo "  → Tagging backend..."
docker tag atlasaiincubator-atlas-backend:latest $DOCKER_USERNAME/atlas-backend:$IMAGE_TAG

echo "✅ Images tagged successfully"
echo ""

# Push images
echo "📤 Pushing images to Docker Hub..."
echo ""

echo "  → Pushing frontend..."
docker push $DOCKER_USERNAME/atlas-frontend:$IMAGE_TAG

echo ""
echo "  → Pushing backend..."
docker push $DOCKER_USERNAME/atlas-backend:$IMAGE_TAG

echo ""
echo "✅ All images pushed successfully!"
echo ""
echo "📋 Your images on Docker Hub:"
echo "  • $DOCKER_USERNAME/atlas-frontend:$IMAGE_TAG"
echo "  • $DOCKER_USERNAME/atlas-backend:$IMAGE_TAG"
echo ""
echo "🎉 Done!"
