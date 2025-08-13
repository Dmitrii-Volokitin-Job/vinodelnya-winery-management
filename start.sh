#!/bin/bash

echo "🍷 Starting Vinodelnya Winery Management System..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📋 Creating .env file from .env.example..."
    cp .env.example .env
fi

# Build and start all services
echo "🔨 Building and starting services..."
docker compose build --no-cache
docker compose up -d

echo ""
echo "✅ Vinodelnya is starting up!"
echo ""
echo "📱 Access points:"
echo "   🌐 Frontend: http://localhost:8080"
echo "   🔧 Backend API: http://localhost:8081/api/v1"
echo "   📚 API Documentation: http://localhost:8081/swagger-ui/index.html"
echo ""
echo "🔐 Login credentials:"
echo "   👨‍💼 Admin: admin/admin (full access)"
echo "   👤 User: user/user (read-only)"
echo ""
echo "⏳ Please wait 1-2 minutes for all services to fully start..."
echo "📊 Check status with: docker compose ps"