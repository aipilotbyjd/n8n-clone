#!/bin/bash

# N8N Clone - Production Deployment Script
# This script deploys the n8n clone to a production environment

set -e

echo "🚀 Starting N8N Clone Production Deployment..."

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

# Check for production environment file
if [ ! -f ".env.production" ]; then
    echo "❌ Production environment file (.env.production) not found!"
    echo "Please create the production environment file with your configuration."
    exit 1
fi

# Build and start all services
echo "🐳 Building and starting production services..."
cd docker
docker-compose -f docker-compose.yml --env-file ../.env.production up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
docker-compose -f docker-compose.yml ps

# Run database migrations if needed
echo "🗄️ Running database migrations..."
# Add migration commands here when implemented

echo "✅ Production deployment completed!"
echo ""
echo "🌐 Services are available at:"
echo "  - API Gateway: http://localhost:3000"
echo "  - Monitoring: http://localhost:3011"
echo ""
echo "📊 To view logs, run: npm run docker:prod:logs"
echo "🛑 To stop all services, run: npm run docker:prod:down"
