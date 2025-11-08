# Database Configuration Guide

## Overview

The Status Service supports both **SQLite** (default) and **PostgreSQL** databases. This guide explains how to configure the database, override default paths, and manage the seeding workflow for different environments.

## 📋 Table of Contents

1. [Default Configuration](#default-configuration)
2. [SQLite Configuration](#sqlite-configuration)
3. [PostgreSQL Configuration](#postgresql-configuration)
4. [Environment Variables](#environment-variables)
5. [Seeding Workflow](#seeding-workflow)
6. [Database Schema](#database-schema)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

## Default Configuration

### SQLite (Development Default)

**Default Database Path**:
```
./status-service/data/incidents.sqlite
```

**Features**:
- WAL mode enabled for better concurrency
- Foreign keys enforced
- Automatic schema creation
- No external dependencies required

**Configuration**:
- No environment variables required for default setup
- Database created automatically on first run

### Default Behavior

1. Application starts
2. Checks for `INCIDENTS_DB_PATH` environment variable
3. If not set, uses default path: `./status-service/data/incidents.sqlite`
4. Creates data directory if it doesn't exist
5. Initializes database with schema
6. Ready to use

## SQLite Configuration

### Override Database Path

Set the `INCIDENTS_DB_PATH` environment variable to customize the database location:

```bash
# Linux/macOS
export INCIDENTS_DB_PATH=/custom/path/incidents.db
npm run dev

# Windows (PowerShell)
$env:INCIDENTS_DB_PATH="C:\custom\path\incidents.db"
npm run dev

# Docker
docker run -e INCIDENTS_DB_PATH=/data/incidents.db ...
```

### In .env File

Add to your `.env` file:

```bash
# Custom SQLite database path
INCIDENTS_DB_PATH=/var/lib/tb-group/incidents.sqlite
```

### In docker-compose.yml

```yaml
services:
  status-service:
    environment:
      - INCIDENTS_DB_PATH=/data/incidents.sqlite
    volumes:
      - ./data:/data
```

### Path Resolution

```typescript
// getDatabasePath() logic
function getDatabasePath(): string {
  const customPath = process.env.INCIDENTS_DB_PATH;

  if (customPath) {
    // Use custom path from environment variable
    return customPath;
  }

  // Default path: ./status-service/data/incidents.sqlite
  const defaultPath = resolve(process.cwd(), 'status-service', 'data', 'incidents.sqlite');
  return defaultPath;
}
```

### Example Configurations

#### Development with Custom Path

```bash
# .env
INCIDENTS_DB_PATH=./dev-data/incidents.sqlite

# Run application
npm run dev
```

#### Docker Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  status-service:
    build: .
    environment:
      - INCIDENTS_DB_PATH=/app/data/incidents.sqlite
    volumes:
      - status_data:/app/data

volumes:
  status_data:
```

#### Production Docker

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  status-service:
    environment:
      - INCIDENTS_DB_PATH=/data/production/incidents.sqlite
    volumes:
      - production_data:/data
    restart: unless-stopped

volumes:
  production_data:
```

## PostgreSQL Configuration

### Enable PostgreSQL

To use PostgreSQL instead of SQLite:

1. **Install PostgreSQL driver**:
   ```bash
   npm install pg
   ```

2. **Set DATABASE_URL environment variable**:
   ```bash
   export DATABASE_URL=postgresql://user:password@localhost:5432/status_db
   ```

3. **Update service initialization** (in `src/services/incidents.ts`):
   ```typescript
   // Switch from SQLite to PostgreSQL
   if (process.env.DATABASE_URL) {
     repositoryInstance = new PostgresIncidentRepository();
   } else {
     repositoryInstance = new SQLiteIncidentRepository();
   }
   ```

### DATABASE_URL Format

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

**Examples**:
```bash
# Local development
DATABASE_URL=postgresql://postgres:password@localhost:5432/status_dev

# Docker
DATABASE_URL=postgresql://postgres:password@postgres:5432/status_db

# Production
DATABASE_URL=postgresql://tbuser:secure_password@db.example.com:5432/tbgroup_prod

# With SSL
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

### PostgreSQL Configuration Examples

#### Local Development

```bash
# .env
DATABASE_URL=postgresql://postgres:my_password@localhost:5432/status_dev
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: status_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  status-service:
    build: .
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/status_db
    depends_on:
      - postgres

volumes:
  postgres_data:
```

#### Production Deployment

```bash
# .env.production
DATABASE_URL=postgresql://tbgroup_user:${DB_PASSWORD}@db.example.com:5432/tbgroup_prod
DB_PASSWORD=your_secure_password_here
```

### SSL Configuration

For production environments with SSL:

```bash
DATABASE_URL=postgresql://user:pass@db.example.com:5432/db?sslmode=require
```

Or in code:
```typescript
this.pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
```

## Environment Variables

### Complete Reference

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `INCIDENTS_DB_PATH` | SQLite database path | `./status-service/data/incidents.sqlite` | `/data/incidents.sqlite` |
| `DATABASE_URL` | PostgreSQL connection string | (none) | `postgresql://user:pass@host:5432/db` |
| `NODE_ENV` | Environment mode | `development` | `production` |

### Priority Order

1. **Explicitly set environment variables** (`INCIDENTS_DB_PATH` or `DATABASE_URL`)
2. **Default values** (SQLite with default path)

### Setting Environment Variables

#### Unix/Linux/macOS

```bash
# Temporary (current session)
export INCIDENTS_DB_PATH=/custom/path/incidents.db

# Permanent (add to ~/.bashrc or ~/.zshrc)
echo 'export INCIDENTS_DB_PATH=/custom/path/incidents.db' >> ~/.bashrc
```

#### Windows

```powershell
# Temporary (current session)
$env:INCIDENTS_DB_PATH="C:\custom\path\incidents.db"

# Permanent (User level)
[System.Environment]::SetEnvironmentVariable("INCIDENTS_DB_PATH", "C:\custom\path\incidents.db", "User")
```

#### Docker

```dockerfile
# In Dockerfile
ENV INCIDENTS_DB_PATH=/data/incidents.sqlite

# In docker-compose.yml
environment:
  - INCIDENTS_DB_PATH=/data/incidents.sqlite

# In docker run
docker run -e INCIDENTS_DB_PATH=/data/incidents.sqlite ...
```

#### .env File

```bash
# .env
INCIDENTS_DB_PATH=./data/incidents.sqlite
NODE_ENV=development
```

## Seeding Workflow

### Overview

The seeding workflow populates the database with sample data for development, testing, and demonstration purposes.

### Running the Seed Script

```bash
# From status-service directory
cd status-service
npm run dev:seed
```

### What It Does

1. **Connects to Database** (SQLite or PostgreSQL)
2. **Clears Existing Data** - Removes all incidents
3. **Creates Sample Incidents** - 6 realistic incidents
4. **Displays Statistics** - Shows counts by status and severity
5. **Lists All Incidents** - Displays full incident details

### Sample Data

The seed script creates 6 incidents:

| # | Title | Status | Severity |
|---|-------|--------|----------|
| 1 | API Performance Degradation | investigating | high |
| 2 | Database Connection Pool Exhaustion | identified | critical |
| 3 | CDN Cache Miss Rate Spike | monitoring | medium |
| 4 | Email Delivery Delays | resolved | low |
| 5 | Payment Gateway Timeout | investigating | critical |
| 6 | Search Service Slow Response | monitoring | high |

### Seeding in Different Environments

#### Development

```bash
npm run dev:seed
npm run dev
```

#### Docker Development

```bash
# Build and run
docker-compose up -d

# Seed data
docker-compose exec status-service npm run dev:seed
```

#### Docker Production

```bash
# Don't seed in production!
# Seeding is for development/testing only
```

#### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
- name: Seed database
  run: |
    cd status-service
    npm run dev:seed
- name: Run tests
  run: npm test
```

### Automating Seed

#### Package.json Script

Add to `package.json`:

```json
{
  "scripts": {
    "setup": "npm run dev:seed",
    "dev": "npm run dev:seed && tsx watch src/server.ts"
  }
}
```

#### Docker Entrypoint

```dockerfile
# In Dockerfile
COPY package*.json ./
RUN npm install
RUN npm run dev:seed
CMD ["npm", "run", "dev"]
```

### Customizing Seed Data

Edit `src/scripts/seed.ts`:

```typescript
const sampleIncidents = [
  {
    title: 'Custom Incident',
    description: 'Description here',
    status: 'investigating' as const,
    severity: 'high' as const,
  },
  // Add more...
];
```

## Database Schema

### SQLite Schema

```sql
CREATE TABLE incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('investigating', 'identified', 'monitoring', 'resolved')),
  severity TEXT NOT NULL CHECK(severity IN ('low', 'medium', 'high', 'critical')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL
);

CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_created_at ON incidents(created_at);
```

### PostgreSQL Schema

```sql
CREATE TABLE incidents (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('investigating', 'identified', 'monitoring', 'resolved')),
  severity TEXT NOT NULL CHECK(severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_created_at ON incidents(created_at);
```

### Schema Differences

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| Auto-increment ID | `AUTOINCREMENT` | `SERIAL` |
| Timestamp | `DATETIME` | `TIMESTAMP WITH TIME ZONE` |
| Constraints | ✅ CHECK constraints | ✅ CHECK constraints |
| Indexes | ✅ Supported | ✅ Supported |

## Production Deployment

### Recommended Configuration

#### Option 1: PostgreSQL (Recommended)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  status-service:
    image: tbgroup/status-service:latest
    environment:
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      - NODE_ENV=production
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Option 2: SQLite with Volume

```yaml
# docker-compose.prod.sqlite.yml
version: '3.8'

services:
  status-service:
    image: tbgroup/status-service:latest
    environment:
      - INCIDENTS_DB_PATH=/data/incidents.sqlite
      - NODE_ENV=production
    volumes:
      - status_data:/data
    restart: unless-stopped

volumes:
  status_data:
```

### Environment Variables for Production

```bash
# .env.production
NODE_ENV=production

# PostgreSQL (recommended)
DATABASE_URL=postgresql://tbgroup_user:${DB_PASSWORD}@db.example.com:5432/tbgroup_prod

# OR SQLite
INCIDENTS_DB_PATH=/data/incidents.sqlite
```

### Migration Strategy

#### From SQLite to PostgreSQL

1. **Export SQLite data**:
   ```bash
   npm run dev:seed  # Ensure data is current
   ```

2. **Set up PostgreSQL**:
   ```bash
   export DATABASE_URL=postgresql://user:pass@host:5432/db
   ```

3. **Run application**:
   - Schema will be created automatically
   - Data will need to be migrated manually

#### Data Migration Script

```typescript
// migration.ts
import sqlite from 'better-sqlite3';
import { Pool } from 'pg';

async function migrateSQLiteToPostgres() {
  // Read SQLite data
  const sqliteDb = new Database('./incidents.sqlite');
  const incidents = sqliteDb.prepare('SELECT * FROM incidents').all();

  // Write to PostgreSQL
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    for (const incident of incidents) {
      await client.query(
        'INSERT INTO incidents (title, description, status, severity, created_at, updated_at, resolved_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [incident.title, incident.description, incident.status, incident.severity, incident.created_at, incident.updated_at, incident.resolved_at]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
    pool.end();
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Database Path Not Found

**Error**: `ENOENT: no such file or directory`

**Solution**:
```bash
# Ensure directory exists
mkdir -p /custom/path

# Set correct permissions
chmod 755 /custom/path

# Set environment variable
export INCIDENTS_DB_PATH=/custom/path/incidents.db
```

#### 2. Permission Denied

**Error**: `EACCES: permission denied`

**Solution**:
```bash
# Fix permissions
sudo chown -R $USER:$USER /data/incidents.db
chmod 644 /data/incidents.db
```

#### 3. Database Locked

**Error**: `database is locked`

**Solution**:
- Ensure no other processes are using the database
- Restart the application
- For SQLite, WAL mode should handle this automatically

#### 4. DATABASE_URL Not Set

**Error**: `DATABASE_URL environment variable is required`

**Solution**:
```bash
# Set the environment variable
export DATABASE_URL=postgresql://user:pass@host:5432/db

# Verify it's set
echo $DATABASE_URL
```

#### 5. Connection Refused (PostgreSQL)

**Error**: `connect ECONNREFUSED`

**Solution**:
```bash
# Check PostgreSQL is running
docker-compose ps

# Check connection string
# Format: postgresql://user:password@host:port/database

# Test connection
psql $DATABASE_URL
```

#### 6. Schema Not Created

**Error**: Table doesn't exist

**Solution**:
- Restart the application
- Schema is created automatically on startup
- Check logs for errors

### Debugging

#### Enable Debug Logging

```typescript
// In application
import pino from 'pino';
const logger = pino({ level: 'debug' });

// Check database initialization logs
logger.info({ path: dbPath }, 'Database path');
logger.info('Database initialized');
```

#### Check Database Connection

```bash
# SQLite
file ./status-service/data/incidents.sqlite
sqlite3 ./status-service/data/incidents.sqlite ".tables"

# PostgreSQL
psql $DATABASE_URL
\dt
```

#### Verify Environment Variables

```bash
# Check all environment variables
env | grep -E "(DATABASE|INCIDENTS|NODE_ENV)"

# Check specific variable
echo $INCIDENTS_DB_PATH
echo $DATABASE_URL
```

## Best Practices

### 1. Environment-Specific Configs

```bash
# .env.development
INCIDENTS_DB_PATH=./dev-data/incidents.sqlite
NODE_ENV=development

# .env.test
INCIDENTS_DB_PATH=./test-data/incidents.sqlite
NODE_ENV=test

# .env.production
DATABASE_URL=postgresql://user:pass@host:5432/db
NODE_ENV=production
```

### 2. Never Commit Sensitive Data

```bash
# .gitignore
.env
.env.local
.env.production
*.sqlite
```

### 3. Use Docker Volumes for Persistence

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
  - status_data:/data
```

### 4. Health Checks

```yaml
services:
  postgres:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
```

### 5. Backup Strategy

#### SQLite

```bash
# Backup
cp ./status-service/data/incidents.sqlite ./backups/incidents-$(date +%Y%m%d).sqlite

# Restore
cp ./backups/incidents-20251101.sqlite ./status-service/data/incidents.sqlite
```

#### PostgreSQL

```bash
# Backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20251101.sql
```

### 6. Monitoring

```typescript
// Log database operations
logger.info({ operation: 'create', incidentId: incident.id }, 'Database operation');
```

## Quick Reference

### Commands

```bash
# Start with default SQLite
npm run dev

# Start with custom SQLite path
export INCIDENTS_DB_PATH=/data/incidents.db
npm run dev

# Start with PostgreSQL
export DATABASE_URL=postgresql://user:pass@host:5432/db
npm run dev

# Seed database
npm run dev:seed

# Check database
sqlite3 ./status-service/data/incidents.sqlite
psql $DATABASE_URL
```

### Environment Variables

```bash
# SQLite
INCIDENTS_DB_PATH=/custom/path/incidents.sqlite

# PostgreSQL
DATABASE_URL=postgresql://user:pass@host:5432/db

# General
NODE_ENV=production
```

## Summary

### Key Points

✅ **SQLite** is default and recommended for development
✅ **PostgreSQL** is recommended for production
✅ **Environment variables** control database configuration
✅ **Seeding** populates database with sample data
✅ **Automatic schema creation** on startup
✅ **Docker volumes** for data persistence

### Decision Matrix

| Scenario | Recommendation |
|----------|----------------|
| Development | SQLite with default path |
| Testing | SQLite with test path |
| Docker Development | SQLite with volume |
| Production (Small) | SQLite with volume |
| Production (Large) | PostgreSQL |
| High Availability | PostgreSQL with clustering |
| Multi-instance | PostgreSQL |

### Next Steps

1. Choose database (SQLite for dev, PostgreSQL for prod)
2. Configure environment variables
3. Test connection
4. Run seed script (dev/test only)
5. Deploy with proper volumes/backups
6. Monitor and maintain

---

**Last Updated**: November 1, 2025
**Version**: 1.0.0
