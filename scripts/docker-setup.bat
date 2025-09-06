@echo off
echo 🐳 Setting up VaultPay Database with Docker...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose and try again.
    pause
    exit /b 1
)

echo ✅ Docker is running

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    (
        echo # Database Configuration
        echo DB_HOST=localhost
        echo DB_PORT=3306
        echo DB_USER=vaultpay_user
        echo DB_PASSWORD=vaultpay_password
        echo DB_NAME=vaultpay
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
        echo JWT_EXPIRES_IN=15m
        echo.
        echo # Application Configuration
        echo PORT=3000
        echo NODE_ENV=development
        echo.
        echo # Redis Configuration (optional)
        echo REDIS_HOST=localhost
        echo REDIS_PORT=6379
        echo REDIS_PASSWORD=
    ) > .env
    echo ✅ .env file created
) else (
    echo ✅ .env file already exists
)

REM Start database services
echo 🔨 Starting database services...
docker-compose up -d

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 30 /nobreak >nul

REM Check if services are running
echo 🔍 Checking service status...
docker-compose ps

echo.
echo 🎉 Database is now running!
echo.
echo 📊 Services:
echo   • MySQL: localhost:3306
echo   • Redis: localhost:6379
echo   • Database: vaultpay
echo.
echo 🚀 Next steps:
echo   1. Install dependencies: npm install
echo   2. Run database setup: npm run db:setup
echo   3. Start development server: npm run start:dev
echo.
echo 📚 Useful commands:
echo   • View logs: docker-compose logs -f
echo   • Stop services: docker-compose down
echo   • Restart services: docker-compose restart
echo   • View database: docker-compose exec mysql mysql -u vaultpay_user -p vaultpay
echo.
pause
