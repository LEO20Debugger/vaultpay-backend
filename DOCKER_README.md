# Docker Setup for VaultPay Backend

This guide will help you run the VaultPay backend with **database in Docker** and **application locally** for optimal development experience.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Run the setup script (starts DB + sets up environment)
npm run docker:setup

# Install dependencies and start development
npm install
npm run dev
```

### Option 2: Manual Setup
```bash
# 1. Start database only
docker-compose up -d

# 2. Install dependencies
npm install

# 3. Setup database
npm run db:setup

# 4. Start development server
npm run start:dev
```

## 📊 Services

| Service | Port | Description |
|---------|------|-------------|
| **MySQL** | 3306 | Database server (Docker) |
| **Redis** | 6379 | Cache server (Docker) |
| **API** | 3000 | NestJS application (Local) |

## 🛠️ Available Commands

### Development Commands
```bash
# Start everything (DB + setup + dev server)
npm run dev

# Start database only
npm run docker:up

# Stop database
npm run docker:down

# View database logs
npm run docker:logs
```

### Database Commands
```bash
# Access MySQL shell
docker-compose exec mysql mysql -u vaultpay_user -p vaultpay

# Run database setup
npm run db:setup

# View database logs
docker-compose logs mysql
```

## 🔧 Development Workflow

### Recommended Development Setup
```bash
# 1. Start database
npm run docker:up

# 2. Install dependencies (first time only)
npm install

# 3. Setup database (first time only)
npm run db:setup

# 4. Start development server
npm run start:dev
```

### Benefits of This Approach
- ✅ **Fast development** - No app container rebuilds
- ✅ **Hot reload** - Instant code changes
- ✅ **Better debugging** - Direct IDE access
- ✅ **Easy testing** - Direct access to logs
- ✅ **Database isolation** - Clean, consistent DB environment

## 📁 File Structure

```
├── Dockerfile                 # Application container
├── docker-compose.yml        # Production services
├── docker-compose.dev.yml    # Development services
├── .dockerignore             # Docker ignore file
├── scripts/
│   ├── docker-setup.bat      # Windows setup script
│   └── docker-setup.sh       # Linux/Mac setup script
└── src/database/migrations/  # Database initialization
```

## 🔐 Environment Variables

The setup script creates a `.env` file with these defaults:

```env
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
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   netstat -ano | findstr :3000
   netstat -ano | findstr :3306
   
   # Stop conflicting services or change ports in docker-compose.yml
   ```

2. **Database Connection Failed**
   ```bash
   # Check if MySQL is running
   docker-compose ps
   
   # Check MySQL logs
   docker-compose logs mysql
   
   # Restart MySQL
   docker-compose restart mysql
   ```

3. **Permission Issues (Linux/Mac)**
   ```bash
   # Make scripts executable
   chmod +x scripts/docker-setup.sh
   ```

4. **Windows Docker Issues**
   ```bash
   # Make sure Docker Desktop is running
   # Check if WSL2 is enabled
   # Restart Docker Desktop if needed
   ```

### Reset Everything
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
npm run docker:setup
```

## 📝 Database Management

### Access Database
```bash
# Connect to MySQL
docker-compose exec mysql mysql -u vaultpay_user -p vaultpay

# Or use external tool
# Host: localhost
# Port: 3306
# User: vaultpay_user
# Password: vaultpay_password
# Database: vaultpay
```

### Backup Database
```bash
# Create backup
docker-compose exec mysql mysqldump -u vaultpay_user -p vaultpay > backup.sql

# Restore backup
docker-compose exec -T mysql mysql -u vaultpay_user -p vaultpay < backup.sql
```

## 🚀 Production Deployment

For production deployment, make sure to:

1. **Change default passwords** in `docker-compose.yml`
2. **Use environment variables** for sensitive data
3. **Enable SSL/TLS** for database connections
4. **Use secrets management** for JWT secrets
5. **Set up monitoring** and logging
6. **Configure backup strategies**

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MySQL Docker Image](https://hub.docker.com/_/mysql)
- [NestJS Documentation](https://docs.nestjs.com/)
