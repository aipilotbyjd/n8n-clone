#!/bin/bash

# N8N Clone - Development Deployment Script
# This script deploys the n8n clone to a development environment

set -e

echo "🚀 Starting N8N Clone Development Deployment..."

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
cd "$PROJECT_ROOT"

echo "📁 Project root: $PROJECT_ROOT"

# Create environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating local environment file..."
    cp docker/.env.dev .env.local
fi

# Start infrastructure services
echo "🐳 Starting infrastructure services..."
cd docker
docker-compose -f docker-compose.dev.yml --env-file .env.dev up -d postgres-dev redis-dev adminer mailhog

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🏥 Checking service health..."
docker-compose -f docker-compose.dev.yml ps

# Install dependencies
echo "📦 Installing dependencies..."
cd "$PROJECT_ROOT"
npm install

# Build all applications
echo "🔨 Building applications..."
npm run build

# Start all microservices in development mode
echo "🚀 Starting microservices..."
npm run start:dev &

echo "✅ Development deployment completed!"
echo ""
echo "🌐 Services are available at:"
echo "  - API Gateway: http://localhost:3000"
echo "  - Database Admin: http://localhost:8080"
echo "  - Email Testing: http://localhost:8025"
echo "  - Redis Admin: http://localhost:8081"
echo ""
echo "🛑 To stop all services, run: npm run docker:dev:down"
