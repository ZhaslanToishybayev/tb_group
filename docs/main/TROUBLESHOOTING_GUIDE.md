# TB Group Base Stack - Troubleshooting Guide

## Table of Contents
1. [Common Issues](#common-issues)
2. [Database Problems](#database-problems)
3. [Build Errors](#build-errors)
4. [Runtime Errors](#runtime-errors)
5. [Performance Issues](#performance-issues)
6. [Integration Issues](#integration-issues)

## Common Issues

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using the port
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 pnpm dev
```

### Node Modules Issues

**Error**: `Cannot find module` or `Module not found`

**Solution**:
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# For specific workspace
pnpm install --filter @tbgroup/api
```

### Environment Variables Not Loading

**Error**: `undefined` values or missing configuration

**Solution**:
1. Ensure `.env` file exists in project root
2. Check variable names match exactly (case-sensitive)
3. Restart development server after changes
4. Verify format: `KEY="value"` (no spaces around =)

## Database Problems

### Connection Refused

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution**:
```bash
# Start PostgreSQL
sudo service postgresql start

# Or using Docker
docker-compose -f docker-compose.db.yml up -d

# Check connection
psql -h localhost -U postgres -d tbgroup
```

### Prisma Migration Issues

**Error**: `Migration failed` or `Schema validation error`

**Solution**:
```bash
# Reset database (development only!)
pnpm -F @tbgroup/api prisma migrate reset

# Deploy migrations
pnpm -F @tbgroup/api prisma migrate deploy

# Generate client
pnpm -F @tbgroup/api prisma generate
```

### Seed Data Issues

**Error**: `Error during seeding` or duplicate key errors

**Solution**:
```bash
# Clear existing data
pnpm -F @tbgroup/api prisma migrate reset --force
pnpm -F @tbgroup/api prisma db seed
```

## Build Errors

### TypeScript Compilation Errors

**Error**: `TS2322: Type 'string' is not assignable to type 'number'`

**Solution**:
```bash
# Check types
pnpm type-check

# Auto-fix linting issues
pnpm lint --fix
```

### Next.js Build Failures

**Error**: `Build failed` with various errors

**Solution**:
```bash
# Clean build
rm -rf .next apps/web/.next
pnpm -F @tbgroup/web build

# Check for TypeScript errors
pnpm -F @tbgroup/web tsc --noEmit
```

### Dependency Version Conflicts

**Error**: `Unable to resolve dependency tree`

**Solution**:
```bash
# Install with legacy peer deps
npm install --legacy-peer-deps

# Or update conflicting packages
pnpm update package-name
```

## Runtime Errors

### API Returns 500 Error

**Error**: `Internal Server Error`

**Solution**:
1. Check API logs: `tail -f logs/api.log`
2. Verify database connection
3. Check environment variables
4. Review error handling in route handlers

### Authentication Failures

**Error**: `401 Unauthorized` or `Token expired`

**Solution**:
```javascript
// Verify token format
const token = localStorage.getItem('token');
if (!token) {
  // Redirect to login
}

// Refresh token if expired
const refreshToken = localStorage.getItem('refreshToken');
await refreshAccessToken(refreshToken);
```

### CORS Errors

**Error**: `Access to fetch blocked by CORS policy`

**Solution**:
```javascript
// In API server (apps/api/src/app.ts)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
```

## Performance Issues

### Slow API Responses

**Symptoms**: Response time > 2 seconds

**Solutions**:
1. Enable Redis caching
2. Add database indexes
3. Check for N+1 queries
4. Use pagination for large datasets

### High Memory Usage

**Symptoms**: Server crashes with `JavaScript heap out of memory`

**Solutions**:
```bash
# Increase Node.js heap size
node --max-old-space-size=4096 apps/api/dist/index.js

# Or use more efficient queries
// Instead of loading all records
const users = await prisma.user.findMany();
// Use pagination
const users = await prisma.user.findMany({
  take: 50,
  skip: page * 50,
});
```

### Database Slow Queries

**Solution**:
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_contact-requests-email ON "ContactRequest"(email);
CREATE INDEX idx-cases-created ON "Case"(createdAt);

-- Check slow queries
SELECT query, mean_time FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;
```

## Integration Issues

### Bitrix24 Not Receiving Leads

**Error**: Leads not appearing in CRM

**Solution**:
1. Verify webhook URL is correct
2. Check BITRIX24_USE_STUB=false in production
3. Verify webhook has proper permissions
4. Check logs: `tail -f logs/bitrix24.log`

```javascript
// Test webhook manually
curl -X POST https://your-domain.bitrix24.com/rest/1/xxx/crm.lead.add \
  -H "Content-Type: application/json" \
  -d '{"fields": {"TITLE": "Test Lead"}}'
```

### Email Not Sending

**Error**: Emails not delivered

**Solution**:
1. Verify SMTP credentials
2. Check EMAIL_USE_STUB=false in production
3. Verify SMTP server allows sending
4. Check spam folder

```bash
# Test SMTP connection
telnet smtp.example.com 587
```

### reCAPTCHA Verification Fails

**Error**: `reCAPTCHA verification failed`

**Solution**:
```javascript
// On frontend
const recaptchaToken = await grecaptcha.execute('6Lc...', {action: 'contact'});

// On backend
import { verifyRecaptcha } from './utils/recaptcha';
const isValid = await verifyRecaptcha(recaptchaToken);
if (!isValid) throw new Error('Invalid reCAPTCHA');
```

## Getting Help

### Check Logs
```bash
# All logs
tail -f logs/*.log

# API logs specifically
tail -f logs/api.log | grep ERROR

# Database logs
tail -f /var/log/postgresql/postgresql-*.log
```

### Health Check Endpoints
- API Health: `http://localhost:4000/health`
- Cache Stats: `http://localhost:4000/api/cache/stats`
- Database: `http://localhost:4000/api/health/db`

### Enable Debug Mode
```bash
# Development
DEBUG=* pnpm dev

# Production
NODE_ENV=development LOG_LEVEL=debug pnpm start
```

### Run Diagnostics
```bash
# Security audit
./scripts/security-audit.sh

# Full test suite
pnpm test

# Type checking
pnpm type-check
```

## Prevention

### Best Practices
1. Always use `.env` for secrets (never hardcode)
2. Keep dependencies updated: `pnpm update`
3. Run tests before deploying: `pnpm test`
4. Monitor logs in production
5. Use health check endpoints
6. Implement proper error handling
7. Add database indexes for performance

### Monitoring
- Set up Prometheus/Grafana
- Monitor error rates
- Track response times
- Watch memory usage
- Alert on database connections

---
For more help, check:
- [Integration Overview](../integration-overview.md)
- [DevOps Runbook](./DEVOPS_RUNBOOK.md)
- [Admin Guide](./ADMIN_GUIDE.md)
