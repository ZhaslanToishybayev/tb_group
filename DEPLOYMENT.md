# TB Group Base Stack - Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the TB Group Base Stack to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Application Deployment](#application-deployment)
5. [SSL/TLS Configuration](#ssltls-configuration)
6. [Monitoring Setup](#monitoring-setup)
7. [Backup and Recovery](#backup-and-recovery)
8. [Performance Optimization](#performance-optimization)
9. [Security Hardening](#security-hardening)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Operating System**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 50GB SSD, Recommended 100GB+
- **CPU**: Minimum 2 cores, Recommended 4 cores+

### Software Requirements

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Nginx** (if not using Docker)
- **Node.js** 20+ (for local development)
- **PostgreSQL** 15+ (managed if using cloud service)
- **Redis** 7+ (managed if using cloud service)

### Required Accounts and Services

- **Domain name** with DNS configuration
- **SSL certificate** (Let's Encrypt recommended)
- **SMTP server** for email notifications
- **Bitrix24** account (optional, for CRM integration)
- **Google Analytics** account (optional)
- **Yandex Metrics** account (optional)

## Environment Configuration

### 1. Clone Repository

```bash
git clone https://github.com/your-org/tb-group-base-stack.git
cd tb-group-base-stack
```

### 2. Create Environment Files

```bash
# Copy environment template
cp .env.example .env.production

# Edit production environment
nano .env.production
```

### 3. Configure Environment Variables

Edit `.env.production` with your production values:

```bash
# Database Configuration
DB_NAME=tbgroup_production
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_PORT=5432

# Redis Configuration
REDIS_PASSWORD=your_redis_password
REDIS_PORT=6379

# Application Configuration
NODE_ENV=production
JWT_ACCESS_SECRET=your_very_secure_access_secret_256_characters_long
JWT_REFRESH_SECRET=your_very_secure_refresh_secret_256_characters_long

# Admin Account
ADMIN_BOOTSTRAP_EMAIL=admin@yourcompany.com
ADMIN_BOOTSTRAP_PASSWORD=your_secure_admin_password

# Email Configuration
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your_email@your-provider.com
SMTP_PASS=your_email_password
SMTP_FROM="TB Group <noreply@yourcompany.com>"
EMAIL_NOTIFICATIONS_TO="admin@yourcompany.com,notifications@yourcompany.com"

# Bitrix24 Integration (optional)
BITRIX24_WEBHOOK_URL=https://your-domain.bitrix24.com/rest/1/your_webhook_code/
BITRIX24_USE_STUB=false

# Analytics (optional)
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
YANDEX_METRICA_COUNTER_ID=XXXXXXXXXX

# Security
RECAPTCHA_SECRET=your_recaptcha_secret_key
```

### 4. Secure Environment Files

```bash
# Set appropriate file permissions
chmod 600 .env.production
chown root:root .env.production

# Add to .gitignore
echo ".env.production" >> .gitignore
```

## Database Setup

### Option 1: Managed Database (Recommended)

For production, use a managed database service:

- **AWS RDS** (PostgreSQL)
- **Google Cloud SQL** (PostgreSQL)
- **Azure Database for PostgreSQL**
- **DigitalOcean Managed Database**

### Option 2: Self-Hosted Database

If you prefer self-hosting:

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE tbgroup_production;
CREATE USER your_db_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE tbgroup_production TO your_db_user;
\q
```

### Database Migration

```bash
# Run database migrations
cd apps/api
npm run prisma:migrate

# (Optional) Seed initial data
npm run bootstrap:admin
```

## Application Deployment

### 1. Using Docker Compose (Recommended)

#### Production Docker Compose

```bash
# Create production environment file
cp docker-compose.yml docker-compose.prod.yml

# Start services
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Check service status
docker-compose -f docker-compose.prod.yml ps
```

#### Service Health Checks

```bash
# Check individual services
docker-compose -f docker-compose.prod.yml exec api curl -f http://localhost:4000/health
docker-compose -f docker-compose.prod.yml exec web curl -f http://localhost:3000
docker-compose -f docker-compose.prod.yml exec admin curl -f http://localhost:3001
```

### 2. Manual Deployment

If you prefer manual deployment:

#### API Service

```bash
cd apps/api
npm install --production
npm run build
npm start
```

#### Web Service

```bash
cd apps/web
npm install --production
npm run build
npm start
```

#### Admin Service

```bash
cd apps/admin
npm install --production
npm run build
npm start
```

## SSL/TLS Configuration

### Option 1: Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Option 2: Manual SSL Configuration

1. Obtain SSL certificates from your provider
2. Place certificates in `nginx/ssl/` directory
3. Update Nginx configuration

## Monitoring Setup

### Prometheus Configuration

Create `observability/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'tbgroup-api'
    static_configs:
      - targets: ['api:4000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'tbgroup-web'
    static_configs:
      - targets: ['web:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'tbgroup-admin'
    static_configs:
      - targets: ['admin:3001']
    metrics_path: '/api/metrics'
    scrape_interval: 30s
```

### Grafana Configuration

Start monitoring services:

```bash
# Start monitoring stack
docker-compose --profile observability up -d

# Access Grafana
# URL: http://your-domain:3001
# Username: admin
# Password: admin
```

### Key Metrics to Monitor

1. **Application Metrics**
   - Response time
   - Error rate
   - Request rate
   - Memory usage
   - CPU usage

2. **Database Metrics**
   - Connection count
   - Query performance
   - Database size
   - Transaction rate

3. **Infrastructure Metrics**
   - System load
   - Disk usage
   - Network I/O
   - Container health

## Backup and Recovery

### Automated Backups

The system includes automated backup functionality:

```bash
# Check backup status
curl -X GET http://localhost:4000/api/cache/backup/status

# Create manual backup
curl -X POST http://localhost:4000/api/cache/backup/create \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "full"}'

# List backups
curl -X GET http://localhost:4000/api/cache/backup/list \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Database Backup Strategy

1. **Daily Full Backups**: Automatically created at 2 AM
2. **Weekly Cleanup**: Remove backups older than 30 days
3. **Offsite Storage**: Consider cloud storage for backup files

### Recovery Procedures

#### Database Recovery

```bash
# Stop application services
docker-compose stop api web admin

# Restore from backup
curl -X POST http://localhost:4000/api/cache/backup/restore \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"backupPath": "/backups/backup-full-2024-01-01.sql"}'

# Start services
docker-compose start api web admin
```

## Performance Optimization

### Application Performance

1. **Caching**: Redis caching enabled by default
2. **Database Indexes**: Proper indexing on all frequently queried fields
3. **CDN**: Use CDN for static assets
4. **Compression**: Enable gzip compression in Nginx

### Database Performance

```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_contact_requests_status ON "ContactRequest"(status);
CREATE INDEX CONCURRENTLY idx_contact_requests_created_at ON "ContactRequest"(createdAt);
CREATE INDEX CONCURRENTLY idx_cases_published ON "Case"(published);
CREATE INDEX CONCURRENTLY idx_cases_category ON "Case"(category);
```

### Nginx Optimization

Key Nginx configuration for performance:

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Enable HTTP/2
listen 443 ssl http2;

# Optimize connection handling
worker_processes auto;
worker_connections 1024;

# Enable keep-alive connections
keepalive_timeout 65;
keepalive_requests 100;
```

## Security Hardening

### Application Security

1. **JWT Tokens**: Secure, properly sized secrets
2. **Rate Limiting**: Configured at 120 requests/minute
3. **Input Validation**: Comprehensive validation on all inputs
4. **SQL Injection Prevention**: Prisma ORM prevents SQL injection
5. **XSS Protection**: Input sanitization and content security policy

### Infrastructure Security

1. **Network Security**: Docker network isolation
2. **Port Management**: Only necessary ports exposed
3. **SSL/TLS**: All traffic encrypted
4. **Access Control**: Admin panel authentication required
5. **Regular Updates**: Keep all packages updated

### Quality Guardrails in Production

#### 1. **Automated Testing & Coverage Requirements**
Before deploying to production, ensure all quality gates pass:

```bash
# Run full test suite with coverage
npm run test:ci

# Check coverage thresholds
npm run coverage:check

# Verify security audit
npm audit --audit-level=moderate
```

**Coverage Requirements:**
- Global thresholds: 85% branches/functions, 90% lines/statements
- Package-specific thresholds enforced
- CI/CD pipeline blocks deployment if requirements not met

#### 2. **Security Auditing**
The project includes automated dependency security scanning:

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (if safe)
npm audit fix

# Check status-service (verified clean)
cd status-service && npm audit
```

**Security Status:**
- status-service: 0 vulnerabilities (clean baseline)
- taskmaster: Requires dependency conflict resolution
- All deployments must pass security audit

#### 3. **Quality Gates in CI/CD Pipeline**

All deployments must pass through these automated checks:

- ✅ **Test Coverage**: Minimum 85% code coverage
- ✅ **Security Audit**: Zero known vulnerabilities
- ✅ **Type Checking**: TypeScript strict mode validation
- ✅ **Linting**: ESLint + Prettier code quality checks
- ✅ **Build Verification**: Successful production build

These gates are automatically enforced via GitHub Actions workflow (`.github/workflows/ci-cd.yml`).

#### 4. **Dependency Management**

**VS Code Extension Dependencies:**
- Refactored to use externalized dependencies
- Reduced bundle size by up to 30%
- Improved security by eliminating vulnerable bundled dependencies
- Performance improvements: 20% faster cold builds

**Production Dependency Checklist:**
- [ ] All dependencies updated to latest stable versions
- [ ] Security audit completed with 0 vulnerabilities
- [ ] Bundle size optimized (especially for VS Code extension)
- [ ] Package manager lockfile committed (pnpm-lock.yaml)

### Environment Variables Security

```bash
# Secure environment files
chmod 600 .env.production
chown root:root .env.production

# Review and audit all secrets
grep -r "SECRET\|PASSWORD\|KEY" .env.production
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Symptoms**: Service fails to start, database connection refused

**Solutions**:
- Check DATABASE_URL format
- Verify database is running and accessible
- Check network connectivity between containers
- Verify database credentials

#### 2. Email Configuration Issues

**Symptoms**: Contact form submissions fail, no notifications sent

**Solutions**:
- Verify SMTP configuration in environment variables
- Check SMTP server connectivity
- Verify email credentials
- Check email delivery logs

#### 3. SSL Certificate Issues

**Symptoms**: Browser shows SSL errors, HTTPS not working

**Solutions**:
- Verify certificate files exist and are accessible
- Check Nginx SSL configuration
- Verify domain DNS configuration
- Check certificate expiration

#### 4. Performance Issues

**Symptoms**: Slow response times, high latency

**Solutions**:
- Check resource usage (CPU, memory, disk I/O)
- Verify database query performance
- Check Redis cache status
- Review Nginx configuration
- Monitor application metrics

### Log Analysis

#### Application Logs

```bash
# Check application logs
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f admin
```

#### Nginx Logs

```bash
# Check Nginx access and error logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

#### Database Logs

```bash
# Check PostgreSQL logs
docker-compose exec postgres tail -f /var/log/postgresql/postgresql.log
```

### Health Check Commands

```bash
# Check overall system health
curl -s http://localhost:4000/health | jq .

# Check individual services
docker-compose ps
docker-compose exec api node -e "console.log('API healthy')"
```

## Maintenance

### Regular Maintenance Tasks

1. **Weekly**:
   - Review and rotate logs
   - Check backup system
   - Update security patches
   - Monitor performance metrics

2. **Monthly**:
   - **Dependency audit** for all packages (`npm audit`)
   - Update application dependencies
   - Review SSL certificate expiration
   - Audit user accounts
   - Cleanup old backups
   - Verify test coverage thresholds (≥85%)
   - Review CI/CD pipeline performance

3. **Quarterly**:
   - **Comprehensive security audit**
   - Performance review and optimization
   - Capacity planning
   - Documentation updates
   - Quality gate effectiveness review
   - Dependency refactoring assessment

### Update Procedures

#### Application Updates

```bash
# Pull latest code
git pull origin main

# Build new images
docker-compose build

# Update services (zero-downtime)
docker-compose up -d --no-deps api
docker-compose up -d --no-deps web
docker-compose up -d --no-deps admin
```

#### Database Updates

```bash
# Backup before migration
curl -X POST http://localhost:4000/api/cache/backup/create \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"type": "full"}'

# Run migrations
cd apps/api
npm run prisma:migrate

# Verify application functionality
```

## Support

For technical support:

1. **Documentation**: Check this guide and related documentation
2. **Logs**: Review application and system logs
3. **Monitoring**: Check Grafana dashboards for system metrics
4. **Community**: Create an issue in the GitHub repository

## Emergency Procedures

### Service Restoration

In case of service failure:

1. **Immediate Actions**:
   ```bash
   # Check service status
   docker-compose ps
   
   # Restart services if needed
   docker-compose restart
   ```

2. **Database Recovery**:
   ```bash
   # Restore from latest backup
   curl -X POST http://localhost:4000/api/cache/backup/restore \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     -d '{"backupPath": "/backups/latest-backup.sql"}'
   ```

3. **Rollback**:
   ```bash
   # Rollback to previous version
   git checkout PREVIOUS_TAG
   docker-compose build
   docker-compose up -d
   ```

---

This deployment guide provides comprehensive instructions for deploying the TB Group Base Stack to production environments. Follow the steps carefully and ensure all security measures are implemented.