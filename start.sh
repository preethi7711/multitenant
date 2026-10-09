#!/bin/bash

# Task Management System Startup Script

set -e

echo "==================================="
echo "Task Management System - Startup"
echo "==================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ Please edit .env and set JWT_SECRET_KEY before continuing!"
    echo ""
    exit 1
fi

# Check if JWT_SECRET_KEY is set
if grep -q "your-super-secret-jwt-key-change-in-production" .env; then
    echo "⚠️  WARNING: JWT_SECRET_KEY is using default value!"
    echo "   Please set a secure random key in .env file"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "🐳 Starting Docker services..."
docker-compose down
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check Redis
echo "🔍 Checking Redis..."
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis is not ready"
    exit 1
fi

# Check Application
echo "🔍 Checking Application..."
sleep 5
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Application is ready"
else
    echo "❌ Application is not ready"
    echo "   Check logs: docker-compose logs app"
    exit 1
fi

echo ""
echo "==================================="
echo "✨ System is ready!"
echo "==================================="
echo ""
echo "📡 API Endpoints:"
echo "   - Health Check: http://localhost:8000/health"
echo "   - API Docs:     http://localhost:8000/docs"
echo "   - API Base URL: http://localhost:8000/api/v1"
echo ""
echo "📊 Services:"
echo "   - MongoDB:      localhost:27017"
echo "   - Redis:        localhost:6379"
echo "   - FastAPI:      localhost:8000"
echo ""
echo "📝 View logs:"
echo "   docker-compose logs -f app"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
echo ""
