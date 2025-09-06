#!/bin/bash

# Docker Setup Script for VaultPay Backend
echo "🐳 Setting up VaultPay Backend with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

echo "✅ Docker is running"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database Configuration
DB_HOST=mysql
DB_PORT=3306
DB_USER=vaultpay_user
DB_PASSWORD=vaultpay_password
DB_NAME=vaultpay

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m

# Application Configuration
PORT=3000
NODE_ENV=production

# Redis Configuration (optional)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "🎉 VaultPay Backend is now running!"
echo ""
echo "📊 Services:"
echo "  • API: http://localhost:3000"
echo "  • MySQL: localhost:3306"
echo "  • Database: vaultpay"
echo ""
echo "📚 Useful commands:"
echo "  • View logs: docker-compose logs -f"
echo "  • Stop services: docker-compose down"
echo "  • Restart services: docker-compose restart"
echo "  • View database: docker-compose exec mysql mysql -u vaultpay_user -p vaultpay"
echo ""
echo "🔧 Development mode:"
echo "  • Start dev services: docker-compose -f docker-compose.dev.yml up -d"
echo "  • Run app locally with Docker DB: npm run start:dev"
echo ""
