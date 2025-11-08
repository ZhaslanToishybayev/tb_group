# 🚀 DevOps Runbook

**Version**: 1.0
**Last Updated**: 2025-10-31

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Deployment](#deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Management](#database-management)
6. [Monitoring & Observability](#monitoring--observability)
7. [Backup & Recovery](#backup--recovery)
8. [Scaling](#scaling)
9. [Security](#security)
10. [Troubleshooting](#troubleshooting)
11. [Maintenance](#maintenance)

---

## Overview

This runbook provides operational procedures for the TB Group Base Stack application, covering deployment, monitoring, maintenance, and incident response.

### System Components

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js 14 | Public website |
| **Admin Panel** | React + Vite | Content management |
| **API** | Express.js + TypeScript | Backend services |
| **Database** | PostgreSQL 15 | Primary data store |
| **Cache** | Redis 7 | Session & cache layer |
| **Web Server** | Nginx | Reverse proxy & static files |
| **Process Manager** | PM2 / Docker | Application lifecycle |
| **CI/CD** | GitHub Actions | Automated deployment |

### Infrastructure Requirements

**Minimum Production Specs**:
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 50 GB SSD
- **Network**: 100 Mbps

**Recommended Production Specs**:
- **CPU**: 4 cores
- **RAM**: 8 GB
- **Storage**: 100 GB SSD
- **Network**: 1 Gbps

---

## System Architecture

```
┌─────────────────┐
│   Load Balancer │
│    (Nginx)      │
└────────┬────────┘
         │
    ┌────┴────┬──────────────┐
    │         │              │
┌───▼───┐ ┌───▼───┐     ┌────▼────┐
│ Front │ │ Admin │     │   API   │
│  (PM2)│ │ (PM2) │     │ (PM2)   │
└───┬───┘ └───┬───┘     └────┬────┘
    │         │              │
    └─────────┼──────────────┘
              │
    ┌─────────▼──────────┐
    │   PostgreSQL 15    │
    └─────────┬──────────┘
              │
    ┌─────────▼──────────┐
    │     Redis 7        │
    └────────────────────┘
```

---

## Deployment

### Prerequisites

```bash
# System dependencies
Node.js >= 18.x
pnpm >= 8.x
PostgreSQL >= 15
Redis >= 7.x
Git
```

### Quick Deploy

```bash
# 1. Clone repository
git clone <repository-url>
cd tbgroup-base-stack

# 2. Install dependencies
pnpm install

# 3. Setup environment
cp .env.example .env
# Edit .env with production values

# 4. Build applications
pnpm build

# 5. Setup database
pnpm --filter @tb/api prisma migrate deploy
pnpm --filter @tb/api prisma db seed

# 6. Start services
pnpm --filter @tb/api start
pnpm --filter @tb/web start
pnpm --filter @tb/admin start
```

### Docker Deployment

```bash
# 1. Build images
docker-compose -f docker-compose.prod.yml build

# 2. Start services
docker-compose -f docker-compose.prod.yml up -d

# 3. Check status
docker-compose -f docker-compose.prod.yml ps
```

### Environment-Specific Deployments

#### Staging

```bash
# Set staging environment
export NODE_ENV=staging

# Deploy with staging config
pnpm build
pnpm --filter @tb/api deploy:staging
```

#### Production

```bash
# Set production environment
export NODE_ENV=production

# Deploy with production config (includes health checks)
pnpm build
pnpm --filter @tb/api deploy:production --health-check
```

### Post-Deployment Checklist

- [ ] Health check endpoints return 200 OK
- [ ] Database migrations applied successfully
- [ ] Static assets served correctly
- [ ] Authentication works
- [ ] API endpoints respond
- [ ] Database connections established
- [ ] Redis cache operational
- [ ] Logs show no critical errors
- [ ] SSL certificate valid
- [ ] Monitoring alerts configured

---

## Environment Configuration

### Environment Variables

**Required Variables** (`.env`):

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5433/tbgroup"

# Redis
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_ACCESS_SECRET="secure-random-string"
JWT_REFRESH_SECRET="secure-random-string"

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-site-key"
RECAPTCHA_SECRET="your-secret-key"

# SMTP
SMTP_HOST="smtp.provider.com"
SMTP_PORT="587"
SMTP_USER="username"
SMTP_PASS="password"

# Integrations
BITRIX24_WEBHOOK_URL="https://..."
GA4_MEASUREMENT_ID="G-XXXXXXXXXX"
```

### Configuration Validation

```bash
# Validate environment
node -e "require('zod').parse(require('fs').readFileSync('.env', 'utf8'))"
```

---

## Database Management

### Migration Workflow

```bash
# Create new migration
pnpm --filter @tb/api prisma migrate dev --name <migration_name>

# Apply migrations (production)
pnpm --filter @tb/api prisma migrate deploy

# Reset database (development only)
pnpm --filter @tb/api prisma migrate reset

# Generate Prisma client
pnpm --filter @tb/api prisma generate
```

### Database Backup

```bash
# Manual backup
pg_dump -U postgres -h localhost -d tbgroup > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -U postgres -h localhost -d tbgroup < backup_20251031.sql

# Scheduled backup (cron)
0 2 * * * pg_dump -U postgres -h localhost -d tbgroup > /backups/db_$(date +\%Y\%m\%d_\%H\%M\%S).sql
```

### Performance Tuning

**PostgreSQL Configuration** (`postgresql.conf`):

```ini
# Memory
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Checkpoints
checkpoint_completion_target = 0.9
wal_buffers = 16MB

# Query planner
random_page_cost = 1.1
```

---

## Monitoring & Observability

### Health Checks

**API Health Endpoint**:
```bash
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"...","uptime":123}
```

**Database Health**:
```bash
curl http://localhost:3001/health/db
# Expected: {"database":"connected"}
```

**Redis Health**:
```bash
curl http://localhost:3001/health/cache
# Expected: {"cache":"connected"}
```

### Metrics

**Application Metrics** (Prometheus format):

- HTTP requests total
- HTTP request duration (histogram)
- Active database connections
- Cache hit/miss ratio
- Authentication success/failure rate
- Error rate by endpoint

**System Metrics**:

- CPU usage
- Memory usage
- Disk I/O
- Network traffic
- PostgreSQL connections
- Redis memory usage

### Logging

**Log Levels**: ERROR, WARN, INFO, DEBUG

**Log Format**:
```json
{
  "timestamp": "2025-10-31T12:00:00.000Z",
  "level": "INFO",
  "service": "api",
  "message": "User login",
  "metadata": {
    "userId": "123",
    "ip": "192.168.1.1"
  }
}
```

**Log Locations**:
- Application: `/var/log/tbgroup/app.log`
- Access: `/var/log/tbgroup/access.log`
- Error: `/var/log/tbgroup/error.log`
- Database: `/var/log/postgresql/`

### Alerting

**Critical Alerts**:
- API down (> 2 minutes)
- Database connection failure
- Disk space > 90%
- Memory usage > 90%
- High error rate (> 5% in 5 minutes)

**Warning Alerts**:
- API response time > 2 seconds
- Cache hit rate < 80%
- Database connections > 80% of limit

### Grafana Dashboard

Access: `http://localhost:3000` (Grafana)

**Pre-configured Dashboards**:
- System Overview
- API Performance
- Database Metrics
- Error Tracking

---

## Backup & Recovery

### Backup Strategy

**Automated Backups** (Daily):
```bash
# Database
pg_dump tbgroup | gzip > /backups/db_$(date +%Y%m%d).sql.gz

# Files
tar -czf /backups/files_$(date +%Y%m%d).tar.gz /var/www/tbgroup/uploads

# Configuration
tar -czf /backups/config_$(date +%Y%m%d).tar.gz /etc/nginx /etc/tbgroup
```

**Retention Policy**:
- Daily backups: Keep 7 days
- Weekly backups: Keep 4 weeks
- Monthly backups: Keep 12 months

### Recovery Procedures

**Database Recovery**:

```bash
# 1. Stop application
pm2 stop all

# 2. Restore database
gunzip -c /backups/db_20251031.sql.gz | psql tbgroup

# 3. Verify integrity
pnpm --filter @tb/api prisma db push --force-reset

# 4. Restart application
pm2 restart all
```

**Full System Recovery**:

```bash
# 1. Setup new server
# 2. Install dependencies
# 3. Restore configuration
# 4. Restore database
# 5. Restore files
# 6. Start services
```

**Disaster Recovery Plan (RTO/RPO)**:
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 24 hours
- Backup Location: AWS S3 / Google Cloud Storage
- Recovery Testing: Monthly

---

## Scaling

### Horizontal Scaling

**Load Balancer Configuration** (Nginx):

```nginx
upstream tbgroup_backend {
    least_conn;
    server 10.0.1.10:3001 weight=3 max_fails=3 fail_timeout=30s;
    server 10.0.1.11:3001 weight=3 max_fails=3 fail_timeout=30s;
    server 10.0.1.12:3001 weight=3 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name tbgroup.kz;

    location / {
        proxy_pass http://tbgroup_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Vertical Scaling

**API Server**:
```bash
# Increase PM2 instances
pm2 scale api 4

# Or update instance config in ecosystem.config.js
module.exports = {
  apps: [{
    name: 'api',
    instances: 4,
    exec_mode: 'cluster'
  }]
}
```

**Database**:
- Connection pooling enabled (default: 10 connections)
- Read replicas for read-heavy workloads
- Connection pooler (PgBouncer)

### Database Scaling

**Read Replica**:
```bash
# Master-Slave replication
# Configure in postgresql.conf (master) and postgresql.conf (replica)
```

**Connection Pooling**:
```bash
# Use PgBouncer
pgbouncer.ini
[databases]
tbgroup = host=localhost port=5432 dbname=tbgroup

[pgbouncer]
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
```

---

## Security

### Security Checklist

- [ ] SSL/TLS enabled (Let's Encrypt or commercial)
- [ ] Firewall configured (UFW/iptables)
- [ ] SSH key-only authentication
- [ ] Database access restricted to application servers
- [ ] Redis password configured
- [ ] Secrets stored in environment variables (.env not in git)
- [ ] Rate limiting enabled (120 requests/minute)
- [ ] CORS configured for specific domains
- [ ] Security headers (Helmet.js)
- [ ] SQL injection protection (Prisma)
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Input validation (Zod)
- [ ] Regular security updates

### Security Headers

```javascript
// Implemented via Helmet.js
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### SSL/TLS Configuration

**Let's Encrypt**:
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d tbgroup.kz -d www.tbgroup.kz

# Auto-renewal (crontab)
0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall Rules

```bash
# UFW configuration
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## Troubleshooting

### Common Issues

#### Issue: High CPU Usage

**Symptoms**:
- API response slow
- Server load > 2.0
- CPU usage > 80%

**Diagnosis**:
```bash
# Check top processes
top

# Check PM2 processes
pm2 monit

# Check logs
tail -f /var/log/tbgroup/app.log
```

**Solutions**:
- Scale API instances (`pm2 scale api 4`)
- Optimize database queries
- Enable Redis caching
- Review slow queries

#### Issue: Database Connection Failures

**Symptoms**:
- API returns 500 errors
- "Connection refused" in logs
- Health check fails

**Diagnosis**:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connections
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Check logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

**Solutions**:
- Restart PostgreSQL (`sudo systemctl restart postgresql`)
- Increase connection pool
- Check disk space
- Review connection limits

#### Issue: Redis Cache Misses

**Symptoms**:
- High response times
- Database queries slow
- Cache hit rate < 80%

**Diagnosis**:
```bash
# Check Redis status
redis-cli ping
# Should return: PONG

# Check memory usage
redis-cli info memory

# Check cache keys
redis-cli --bigkeys
```

**Solutions**:
- Increase Redis memory
- Implement cache warming
- Review TTL settings
- Optimize cache keys

#### Issue: Memory Leaks

**Symptoms**:
- Increasing memory usage
- OOM errors
- Application crashes

**Diagnosis**:
```bash
# Check memory usage
free -h
pm2 monit

# Check for leaks
node --inspect app.js
# Use Chrome DevTools memory profiler
```

**Solutions**:
- Restart services (temporary)
- Find memory leaks in code
- Increase server memory
- Implement memory limits

### Performance Tuning

**Database Queries**:
```sql
-- Enable slow query log
log_min_duration_statement = 1000

-- Analyze slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

**API Optimization**:
```javascript
// Enable compression
app.use(compression());

// Cache static files
app.use(express.static('public', {
  maxAge: '1d',
  etag: true
}));
```

---

## Maintenance

### Regular Maintenance Tasks

**Daily**:
- Monitor system health
- Check error logs
- Verify backups completed
- Review security alerts

**Weekly**:
- Update dependencies (`pnpm update`)
- Clean old log files
- Review performance metrics
- Check SSL certificate expiration

**Monthly**:
- Security updates
- Database maintenance (VACUUM, ANALYZE)
- Disaster recovery testing
- Review and optimize queries
- Update documentation

### Maintenance Commands

```bash
# Update dependencies
pnpm update

# Database maintenance
psql -d tbgroup -c "VACUUM ANALYZE;"

# Clean old backups (keep last 30 days)
find /backups -name "*.sql.gz" -mtime +30 -delete

# Log rotation
sudo logrotate /etc/logrotate.d/tbgroup

# Check SSL certificate
openssl x509 -in /etc/letsencrypt/live/tbgroup.kz/fullchain.pem -text -noout
```

### Update Procedure

```bash
# 1. Backup current state
./scripts/backup.sh

# 2. Pull latest code
git pull origin main

# 3. Update dependencies
pnpm install

# 4. Run migrations
pnpm --filter @tb/api prisma migrate deploy

# 5. Build applications
pnpm build

# 6. Run tests
pnpm test

# 7. Deploy (zero-downtime)
pm2 reload ecosystem.config.js --env production

# 8. Verify deployment
./scripts/health-check.sh
```

### Incident Response

**Severity Levels**:

- **P0 - Critical**: Site down, data loss, security breach
- **P1 - High**: Major feature broken, performance severely degraded
- **P2 - Medium**: Minor feature broken, workaround available
- **P3 - Low**: Cosmetic issues, feature requests

**Response Process**:

1. **Acknowledge** (15 minutes for P0/P1)
2. **Assess** severity and impact
3. **Communicate** to stakeholders
4. **Mitigate** (restore service)
5. **Investigate** root cause
6. **Document** incident and resolution
7. **Prevent** recurrence

**Communication Templates** (see `/docs/operations/incident-communication.md`)

---

## Contact Information

### On-Call Rotation

- **Primary**: DevOps Team
- **Secondary**: Engineering Manager
- **Escalation**: CTO

### Emergency Contacts

- **Phone**: +7 (XXX) XXX-XXXX (24/7)
- **Email**: devops@tbgroup.kz
- **PagerDuty**: [link]

### Support Hours

- **Business Hours**: Mon-Fri, 9:00-18:00 (UTC+6)
- **Emergency**: 24/7
- **Scheduled Maintenance**: Sun, 2:00-4:00 AM (UTC+6)

---

## Appendix

### Useful Commands

```bash
# PM2
pm2 status
pm2 logs
pm2 restart all
pm2 reload ecosystem.config.js

# PostgreSQL
psql -U postgres -d tbgroup
pg_dump tbgroup > backup.sql

# Redis
redis-cli monitor
redis-cli info stats

# Nginx
nginx -t
sudo systemctl reload nginx
```

### Port Reference

| Service | Port | Protocol |
|---------|------|----------|
| API | 3001 | HTTP |
| Web | 3000 | HTTP |
| Admin | 3002 | HTTP |
| PostgreSQL | 5432 | TCP |
| Redis | 6379 | TCP |
| Nginx | 80, 443 | HTTP/HTTPS |

### File Locations

| Path | Description |
|------|-------------|
| `/var/www/tbgroup` | Application files |
| `/var/log/tbgroup` | Application logs |
| `/etc/nginx/sites-available/tbgroup` | Nginx config |
| `/etc/postgresql/15/main` | PostgreSQL config |
| `/etc/redis` | Redis config |
| `/home/tbgroup/.env` | Environment variables |

---

**End of DevOps Runbook**

*For admin user guide, see [ADMIN_GUIDE.md](ADMIN_GUIDE.md)*
